import express, { Router, Request, Response, NextFunction } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validateTaskInput, validateTaskUpdate, validateTranscript } from '../validators/task.validator';
import { audioUpload } from '../middleware/upload';
import { aiProcessingLimiter } from '../middleware/rateLimiting';

// Define custom interface for Multer request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router: Router = express.Router();
const taskController = new TaskController();

// Wrap async route handlers to properly handle promises
const asyncHandler = (fn: (req: Request | MulterRequest, res: Response) => Promise<any>) => {
  return async (req: Request | MulterRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Task CRUD Operations
router.post('/', validateTaskInput, aiProcessingLimiter, asyncHandler(taskController.createFromNaturalLanguage));
router.post('/transcript', validateTranscript, aiProcessingLimiter, asyncHandler(taskController.createFromTranscript));
router.post('/audio', audioUpload.single('audio'), aiProcessingLimiter, asyncHandler(taskController.createFromAudio));
router.get('/', asyncHandler(taskController.getTasks));
router.get('/:id', asyncHandler(taskController.getTaskById));
router.put('/:id', validateTaskUpdate, asyncHandler(taskController.updateTask));
router.delete('/:id', asyncHandler(taskController.deleteTask));

// Bulk operations
router.delete('/bulk', asyncHandler(taskController.deleteTasks));
router.put('/bulk/status', asyncHandler(taskController.updateTasksStatus));

export default router; 