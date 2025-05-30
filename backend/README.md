# Natural Language Task Manager - Backend

A powerful task management system that uses natural language processing to create and manage tasks. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

- Natural language task creation
- Audio task creation with speech-to-text
- Task management with CRUD operations
- Bulk operations support
- Advanced filtering and pagination
- OpenAI integration for task parsing
- Comprehensive monitoring and health checks
- API documentation with Swagger

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Natural-Language-Task-Manager/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_uri_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

The API documentation is available at `http://localhost:3001/api-docs` when the server is running.

### Main Endpoints

#### Tasks
- `POST /api/tasks` - Create task from natural language
- `POST /api/tasks/transcript` - Create task from transcript
- `POST /api/tasks/audio` - Create task from audio file
- `GET /api/tasks` - Get tasks with pagination and filters
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `DELETE /api/tasks/bulk` - Bulk delete tasks
- `PUT /api/tasks/bulk/status` - Bulk update task status

#### Monitoring
- `GET /api/monitoring/health` - Get system health status
- `GET /api/monitoring/openai-usage` - Get OpenAI API usage statistics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | - |
| OPENAI_API_KEY | OpenAI API key | - |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
| RATE_LIMIT_WINDOW_MS | Rate limit window in ms | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| MAX_FILE_SIZE | Max file upload size in bytes | 5242880 |
| UPLOAD_DIR | Directory for temporary files | uploads |

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── validators/     # Input validation
│   └── server.ts       # Server entry point
├── uploads/           # Temporary file storage
└── package.json
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Monitoring

The application includes comprehensive monitoring:
- System health checks
- Database connection monitoring
- OpenAI API usage tracking
- Performance metrics

## Development

1. Run in development mode:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

3. Start production server:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

## License

MIT 