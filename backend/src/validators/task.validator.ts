import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createResponse } from '../types/api';

export const taskInputSchema = Joi.object({
  input: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Task input cannot be empty',
      'string.max': 'Task input cannot exceed 2000 characters'
    })
});

export const transcriptSchema = Joi.object({
  transcript: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Transcript cannot be empty',
      'string.max': 'Transcript cannot exceed 2000 characters'
    })
});

export const taskUpdateSchema = Joi.object({
  taskName: Joi.string().max(200).optional(),
  assignee: Joi.string().max(50).optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  priority: Joi.string().valid('P1', 'P2', 'P3', 'P4').optional(),
  description: Joi.string().max(1000).optional(),
  tags: Joi.array().items(Joi.string().max(20)).max(5).optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed').optional()
});

export const validateTaskInput = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = taskInputSchema.validate(req.body);
  if (error) {
    res.status(400).json(createResponse(false, null, {
      code: 'VALIDATION_ERROR',
      message: error.details[0].message
    }));
    return;
  }
  next();
};

export const validateTranscript = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = transcriptSchema.validate(req.body);
  if (error) {
    res.status(400).json(createResponse(false, null, {
      code: 'VALIDATION_ERROR',
      message: error.details[0].message
    }));
    return;
  }
  next();
};

export const validateTaskUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = taskUpdateSchema.validate(req.body);
  if (error) {
    res.status(400).json(createResponse(false, null, {
      code: 'VALIDATION_ERROR',
      message: error.details[0].message
    }));
    return;
  }
  next();
}; 