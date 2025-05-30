import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server';
import { Task, ITask } from '../../models/Task';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Task Controller', () => {
  const sampleTask = {
    taskName: 'Test Task',
    description: 'Test Description',
    priority: 'P1' as const,
    status: 'pending' as const,
    assignee: 'test@example.com',
    dueDate: new Date().toISOString(),
    tags: ['test'],
    originalInput: 'Create a test task'
  };

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send(sampleTask);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.taskName).toBe(sampleTask.taskName);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await Task.create(sampleTask);
    });

    it('should get all tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
      expect(response.body.data.tasks.length).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body.data.tasks[0].status).toBe('pending');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const doc = await Task.create(sampleTask);
      const task = doc as unknown as mongoose.Document & { _id: mongoose.Types.ObjectId };
      taskId = task._id.toString();
    });

    it('should update a task', async () => {
      const update = { taskName: 'Updated Task' };
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.data.taskName).toBe(update.taskName);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const doc = await Task.create(sampleTask);
      const task = doc as unknown as mongoose.Document & { _id: mongoose.Types.ObjectId };
      taskId = task._id.toString();
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });
  });
}); 