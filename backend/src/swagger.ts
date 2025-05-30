import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Natural Language Task Manager API',
      version: '1.0.0',
      description: 'API documentation for Natural Language Task Manager',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Task ID'
            },
            taskName: {
              type: 'string',
              description: 'Name of the task'
            },
            assignee: {
              type: 'string',
              description: 'Person assigned to the task'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date of the task'
            },
            priority: {
              type: 'string',
              enum: ['P1', 'P2', 'P3', 'P4'],
              description: 'Task priority'
            },
            description: {
              type: 'string',
              description: 'Detailed task description'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Task tags'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed'],
              description: 'Task status'
            },
            originalInput: {
              type: 'string',
              description: 'Original natural language input'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                details: {
                  type: 'object'
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options); 