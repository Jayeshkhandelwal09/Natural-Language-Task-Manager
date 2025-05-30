import mongoose from 'mongoose';
import { EventEmitter } from 'events';

interface OpenAIUsage {
  requests: number;
  tokens: number;
  lastReset: Date;
}

class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private openAIUsage: OpenAIUsage;

  private constructor() {
    super();
    this.openAIUsage = {
      requests: 0,
      tokens: 0,
      lastReset: new Date()
    };
    this.setupDailyReset();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private setupDailyReset(): void {
    setInterval(() => {
      const now = new Date();
      if (now.getDate() !== this.openAIUsage.lastReset.getDate()) {
        this.openAIUsage = {
          requests: 0,
          tokens: 0,
          lastReset: now
        };
        this.emit('usage.reset');
      }
    }, 1000 * 60 * 60); // Check every hour
  }

  trackOpenAIUsage(tokens: number): void {
    this.openAIUsage.requests++;
    this.openAIUsage.tokens += tokens;
    this.emit('openai.usage', this.openAIUsage);
  }

  getSystemHealth(): {
    status: string;
    database: string;
    openAIUsage: OpenAIUsage;
    uptime: number;
    memory: NodeJS.MemoryUsage;
  } {
    return {
      status: 'operational',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      openAIUsage: this.openAIUsage,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  async checkDatabaseHealth(): Promise<{
    status: string;
    responseTime: number;
    connections: number;
  }> {
    const startTime = Date.now();
    try {
      if (!mongoose.connection.db) {
        throw new Error('Database connection not established');
      }
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        connections: mongoose.connection.readyState
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        connections: mongoose.connection.readyState
      };
    }
  }
}

export const monitoringService = MonitoringService.getInstance(); 