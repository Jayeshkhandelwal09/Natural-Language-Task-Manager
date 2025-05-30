import mongoose, { Schema, Document } from 'mongoose';

export interface IAudioProcessingLog extends Document {
  originalFilename: string;
  fileSize: number;
  duration: number;
  transcriptionText: string;
  processingTimeMs: number;
  tasksCreated: number;
  errorDetails?: string;
  createdAt: Date;
}

const AudioLogSchema: Schema = new Schema({
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  transcriptionText: {
    type: String,
    required: true
  },
  processingTimeMs: {
    type: Number,
    required: true
  },
  tasksCreated: {
    type: Number,
    required: true,
    default: 0
  },
  errorDetails: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IAudioProcessingLog>('AudioProcessingLog', AudioLogSchema); 