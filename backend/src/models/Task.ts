import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  taskName: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  description: string;
  tags: string[];
  dependencies: mongoose.Types.ObjectId[];
  status: 'pending' | 'in_progress' | 'completed';
  originalInput: string;
  aiParsedFields: object;
  createdAt: Date;
  updatedAt: Date;
  isOverdue?: boolean;
}

const TaskSchema: Schema = new Schema<ITask>({
  taskName: {
    type: String,
    required: [true, 'Task name is required'],
    maxlength: [200, 'Task name cannot exceed 200 characters'],
    trim: true
  },
  assignee: {
    type: String,
    default: 'Unassigned',
    maxlength: [50, 'Assignee name cannot exceed 50 characters'],
    trim: true
  },
  dueDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(date: Date) {
        return !date || date > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['P1', 'P2', 'P3', 'P4'],
      message: 'Priority must be P1, P2, P3, or P4'
    },
    default: 'P3'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  tags: [{
    type: String,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  originalInput: {
    type: String,
    required: true,
    maxlength: [2000, 'Original input cannot exceed 2000 characters']
  },
  aiParsedFields: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
TaskSchema.index({ assignee: 1, dueDate: 1 });
TaskSchema.index({ priority: 1, createdAt: -1 });
TaskSchema.index({ tags: 1 });
TaskSchema.index({ status: 1, updatedAt: -1 });
TaskSchema.index({ createdAt: -1 }); // For pagination

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

export const Task: Model<ITask> = mongoose.model<ITask>('Task', TaskSchema); 