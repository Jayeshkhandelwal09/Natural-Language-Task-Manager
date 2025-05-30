import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { createResponse } from '../types/api';
import { OpenAIService } from '../services/openai.service';
import fs from 'fs';


// Extend Express Request type to include file from Multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class TaskController {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  // Get tasks with pagination and filters
  getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter: any = {};
      if (req.query.assignee) filter.assignee = req.query.assignee;
      if (req.query.priority) filter.priority = req.query.priority;
      if (req.query.status) filter.status = req.query.status;

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Task.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json(createResponse(true, tasks, null, {
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: filter
      }));
    } catch (error) {
      throw error;
    }
  };

  // Get single task
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json(createResponse(false, null, {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }));
        return;
      }
      res.json(createResponse(true, task));
    } catch (error) {
      throw error;
    }
  };

  // Create task from natural language
  createFromNaturalLanguage = async (req: Request, res: Response): Promise<void> => {
    try {
      const startTime = Date.now();
      const parsedTask = await this.openAIService.parseNaturalLanguage(req.body.input);
      
      const task = new Task({
        ...parsedTask,
        originalInput: req.body.input
      });

      const savedTask = await task.save();
      const processingTime = Date.now() - startTime;

      res.status(201).json(createResponse(true, savedTask, null, {
        timing: processingTime
      }));
    } catch (error) {
      throw error;
    }
  };

  // Create task from audio transcript
  createFromTranscript = async (req: Request, res: Response): Promise<void> => {
    try {
      const startTime = Date.now();
      const parsedTask = await this.openAIService.parseNaturalLanguage(req.body.transcript);
      
      const task = new Task({
        ...parsedTask,
        originalInput: req.body.transcript
      });

      const savedTask = await task.save();
      const processingTime = Date.now() - startTime;

      res.status(201).json(createResponse(true, savedTask, null, {
        timing: processingTime
      }));
    } catch (error) {
      throw error;
    }
  };

  // Create task from audio file
  createFromAudio = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      // Validate file presence
      if (!req.file) {
        res.status(400).json(createResponse(false, null, {
          code: 'NO_FILE',
          message: 'No audio file provided'
        }));
        return;
      }

      const startTime = Date.now();
      
      try {
        // Read the file from disk
        const audioBuffer = fs.readFileSync(req.file.path);
        
        const transcript = await this.openAIService.transcribeAudio(
          audioBuffer,
          req.file.originalname
        );

        // Log the transcript for debugging

        const parsedTask = await this.openAIService.parseNaturalLanguage(transcript);
        
        const task = new Task({
          ...parsedTask,
          originalInput: transcript
        });

        const savedTask = await task.save();
        const processingTime = Date.now() - startTime;

        // Clean up the uploaded file
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }

        res.status(201).json(createResponse(true, savedTask, null, {
          timing: processingTime,
          transcript: transcript // Include transcript in response for debugging
        }));
      } catch (error) {
        // Clean up the uploaded file in case of error
        if (req.file?.path && fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file after error:', cleanupError);
          }
        }

        if (error instanceof Error) {
          res.status(400).json(createResponse(false, null, {
            code: 'PROCESSING_ERROR',
            message: error.message,
            details: error.stack
          }));
        } else {
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Update task
  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!task) {
        res.status(404).json(createResponse(false, null, {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }));
        return;
      }

      res.json(createResponse(true, task));
    } catch (error) {
      throw error;
    }
  };

  // Delete task
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      
      if (!task) {
        res.status(404).json(createResponse(false, null, {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }));
        return;
      }

      res.json(createResponse(true, { message: 'Task deleted successfully' }));
    } catch (error) {
      throw error;
    }
  };

  // Bulk delete tasks
  deleteTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json(createResponse(false, null, {
          code: 'INVALID_INPUT',
          message: 'Task IDs array is required'
        }));
        return;
      }

      const result = await Task.deleteMany({ _id: { $in: ids } });
      
      res.json(createResponse(true, {
        message: `${result.deletedCount} tasks deleted successfully`
      }));
    } catch (error) {
      throw error;
    }
  };

  // Bulk update tasks status
  updateTasksStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ids, status } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0 || !status) {
        res.status(400).json(createResponse(false, null, {
          code: 'INVALID_INPUT',
          message: 'Task IDs array and status are required'
        }));
        return;
      }

      const result = await Task.updateMany(
        { _id: { $in: ids } },
        { $set: { status } },
        { runValidators: true }
      );
      
      res.json(createResponse(true, {
        message: `${result.modifiedCount} tasks updated successfully`
      }));
    } catch (error) {
      throw error;
    }
  };
} 