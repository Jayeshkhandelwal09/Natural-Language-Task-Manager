import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Retry utility function
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retries exceeded');
};

const TASK_PARSING_PROMPT = `
Parse the natural language input into a structured JSON task with the following fields:
- taskName: A clear, concise title
- description: Detailed task description
- priority: One of [P1, P2, P3, P4] where P1 is highest
- dueDate: ISO date string if specified (must be in the future), null if not specified
- assignee: The person assigned to the task, or "Unassigned"
- tags: Array of relevant tags

For dates:
- If "tomorrow" is mentioned, set to tomorrow at 11:59 PM
- If "next week" is mentioned, set to 7 days from now at 11:59 PM
- If "next Friday" or similar is mentioned, set to the next occurrence of that day at 11:59 PM
- If no specific date is mentioned, set dueDate to null

Return the response in valid JSON format.
Example format:
{
  "taskName": "Example Task",
  "description": "Detailed description",
  "priority": "P1",
  "dueDate": "2024-03-20T23:59:00.000Z",
  "assignee": "John Doe",
  "tags": ["important", "meeting"]
}
`;

export interface ParsedTask {
  taskName: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  dueDate: string | null;
  assignee: string;
  tags: string[];
}

function getNextDayOfWeek(dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  const targetDay = days.indexOf(dayName.toLowerCase());
  
  if (targetDay === -1) return today;
  
  const currentDay = today.getDay();
  const daysUntilTarget = (targetDay + 7 - currentDay) % 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  targetDate.setHours(23, 59, 0, 0);
  
  // If the calculated date is today, add 7 days
  if (daysUntilTarget === 0) {
    targetDate.setDate(targetDate.getDate() + 7);
  }
  
  return targetDate;
}

export class OpenAIService {
  private openai: OpenAI;
  private readonly tempDir: string;

  constructor() {
    console.log('Environment variables:', {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
      NODE_ENV: process.env.NODE_ENV
    });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
    });

    this.tempDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async parseNaturalLanguage(input: string): Promise<ParsedTask> {
    return withRetry(async () => {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: "You are a task parser that converts natural language into structured JSON data. " + TASK_PARSING_PROMPT
          },
          {
            role: "user",
            content: `Parse this task into JSON: ${input}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }

      try {
        const parsedTask = JSON.parse(content);
        
        // Validate required fields
        if (!parsedTask.taskName || !parsedTask.description) {
          throw new Error('Missing required fields in parsed task');
        }

        // Handle date parsing
        if (parsedTask.dueDate) {
          const dueDate = new Date(parsedTask.dueDate);
          const now = new Date();

          // If the date is in the past, adjust it
          if (dueDate <= now) {
            // Check if it's a day of the week mention
            const dayMatch = input.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
            if (dayMatch) {
              parsedTask.dueDate = getNextDayOfWeek(dayMatch[1]).toISOString();
            } else if (input.toLowerCase().includes('tomorrow')) {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(23, 59, 0, 0);
              parsedTask.dueDate = tomorrow.toISOString();
            } else if (input.toLowerCase().includes('next week')) {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              nextWeek.setHours(23, 59, 0, 0);
              parsedTask.dueDate = nextWeek.toISOString();
            }
          }
        }

        return parsedTask;
      } catch (error) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Failed to parse task from natural language');
      }
    });
  }

  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
    return withRetry(async () => {
      // Validate audio buffer
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Invalid or empty audio buffer');
      }

      console.log('Processing audio file:', {
        filename,
        bufferSize: audioBuffer.length,
        bufferType: typeof audioBuffer,
        bufferStart: audioBuffer.slice(0, 4).toString('hex') // Log first 4 bytes to check header
      });

      // Validate file extension
      const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
      const ext = path.extname(filename).toLowerCase();
      if (!validExtensions.includes(ext)) {
        throw new Error(`Unsupported audio format: ${ext}. Supported formats: ${validExtensions.join(', ')}`);
      }

      const tempFilePath = path.join(this.tempDir, `temp_${Date.now()}_${filename}`);
      
      try {
        // Write buffer to temp file and verify it exists
        fs.writeFileSync(tempFilePath, audioBuffer);
        const stats = fs.statSync(tempFilePath);
        console.log('Temporary file created:', {
          path: tempFilePath,
          size: stats.size,
          exists: fs.existsSync(tempFilePath)
        });

        // Create file stream and verify it's readable
        const fileStream = fs.createReadStream(tempFilePath);
        await new Promise<void>((resolve, reject) => {
          fileStream.once('readable', () => resolve());
          fileStream.once('error', reject);
        });

        console.log('Sending request to OpenAI...');
        const transcription = await this.openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: "whisper-1",
          response_format: "text",
          language: "en",
          temperature: 0.2,
          prompt: "This is a task description. The speaker is describing a task to be done."
        });

        console.log('Received transcription:', {
          length: transcription?.length || 0,
          preview: transcription?.substring(0, 100),
          raw: transcription // Log the full transcription for debugging
        });

        // Validate transcription result
        if (!transcription || transcription.trim().length === 0) {
          throw new Error('Audio transcription produced empty result. Please ensure the audio contains clear speech.');
        }

        return transcription.trim();
      } catch (error) {
        console.error('Transcription error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          type: error instanceof Error ? error.constructor.name : typeof error
        });
        
        if (error instanceof Error) {
          // Check for specific OpenAI API errors
          if (error.message.includes('Invalid file format')) {
            throw new Error(`Invalid audio format. Please ensure the file is a valid audio file.`);
          }
          if (error.message.includes('File is too large')) {
            throw new Error(`File size exceeds OpenAI's limit. Please use a smaller file.`);
          }
          if (error.message.includes('No speech found')) {
            throw new Error(`No speech detected in the audio file. Please ensure the audio contains clear speech.`);
          }
          throw new Error(`Audio transcription failed: ${error.message}`);
        }
        throw error;
      } finally {
        // Clean up temporary file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log('Temporary file cleaned up:', tempFilePath);
        }
      }
    });
  }
} 