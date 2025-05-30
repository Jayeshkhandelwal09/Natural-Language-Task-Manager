import express, { Router, Request, Response } from 'express';
import { monitoringService } from '../services/monitoring.service';

const router: Router = express.Router();

// Get system health status
router.get('/health', async (req: Request, res: Response) => {
  const systemHealth = monitoringService.getSystemHealth();
  const dbHealth = await monitoringService.checkDatabaseHealth();
  
  res.json({
    success: true,
    data: {
      ...systemHealth,
      database: dbHealth
    }
  });
});

// Get OpenAI usage statistics
router.get('/openai-usage', (req: Request, res: Response) => {
  const health = monitoringService.getSystemHealth();
  res.json({
    success: true,
    data: {
      usage: health.openAIUsage
    }
  });
});

export default router; 