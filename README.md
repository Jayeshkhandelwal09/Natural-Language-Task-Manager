# Natural Language Task Manager

A modern task management application that uses natural language processing and speech recognition to create and manage tasks intelligently.

## 🌟 Features

- **Natural Language Task Creation**: Create tasks using everyday language
- **Voice Input Support**: Add tasks using voice commands
- **Smart Task Parsing**: Automatically extracts due dates, priorities, and tags from natural text
- **Rich Task Management**:
  - Priority levels (P1-P4)
  - Due dates
  - Task status tracking
  - Tags support
  - Task descriptions
  - Assignee management
- **Modern UI/UX**:
  - Responsive design
  - Beautiful gradients and animations
  - Loading states and skeletons
  - Filter and sort capabilities
  - Pagination support

## 🛠 Tech Stack

### Frontend
- Next.js with TypeScript
- TailwindCSS for styling
- ShadcnUI components
- React Context for state management
- Date-fns for date handling

### Backend
- Express.js with TypeScript
- MongoDB with Mongoose
- OpenAI GPT-3.5 for task parsing
- OpenAI Whisper for audio transcription
- Winston for logging
- Joi for validation
- Helmet for security
- Rate limiting
- CORS protection

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- OpenAI API key

### Environment Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd Natural-Language-Task-Manager
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend (.env):
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
CORS_ORIGIN=http://localhost:3000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs

## 📝 API Documentation

The API documentation is available through Swagger UI at `/api-docs` when running the backend server.

### Key Endpoints:

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get tasks with pagination and filters
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/audio` - Create task from audio input
- `POST /api/tasks/bulk` - Bulk operations on tasks

## 🔒 Security Features

- Helmet security headers
- Rate limiting
- CORS protection
- Input validation and sanitization
- File upload restrictions
- Error logging and monitoring

## 🤝 Contributing

This project is currently in development. Feel free to submit issues and enhancement requests.

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- ShadcnUI for the beautiful components
- OpenAI for GPT and Whisper APIs 