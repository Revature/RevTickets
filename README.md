# Ticketing System - Full Stack Application

A comprehensive AI-powered ticketing system with intelligent queue management, knowledge base chat, and analytics dashboard, built with FastAPI backend and Next.js frontend.

## 🚀 Quick Start

**Just run one command to start everything:**

```bash
docker-compose up --build
```

This will automatically:
- Start MongoDB database
- Start Redis broker
- Start ChromaDB vector database
- Start FastAPI backend with seed data
- Start Celery workers for background tasks
- Start Next.js frontend
- Create demo users and sample tickets

## 📱 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **ChromaDB**: localhost:8001

## 🔐 Demo Login Credentials

### Regular Users:
- `john.doe@company.com` / `password123`
- `jane.smith@company.com` / `password123`
- `mike.johnson@company.com` / `password123`

### Agents (Full Access):
- `sarah.wilson@company.com` / `password123`
- `david.brown@company.com` / `password123`
- `lisa.davis@company.com` / `password123`

## 🎯 Key Features

### Core Features
- **Authentication**: JWT-based login with role-based access control
- **Ticket Management**: Create, view, update, and manage support tickets
- **Categories System**: Organize tickets with categories, subcategories, and tags
- **User Roles**: Regular users and agents with different permissions
- **File Attachments**: Upload and attach files to tickets
- **Comments System**: Rich text comments with editing capabilities
- **SLA Monitoring**: Automated SLA tracking and breach detection

### AI-Powered Features
- **AI Ticket Summaries**: Automatic AI-generated summaries for tickets
- **AI Agent Assignment**: Intelligent ticket routing based on agent expertise
- **AI Closing Comments**: AI-generated closing comments for resolved tickets
- **AI Knowledge Base Tags**: Automatic tag generation for KB articles

### Knowledge Base
- **Article Management**: Create, edit, and manage knowledge base articles
- **Rich Text Editor**: Full-featured rich text editing with TipTap
- **Article Search**: Semantic search across knowledge base content
- **AI Tag Generation**: Automatic tag suggestions for articles

### Knowledge Base Chat
- **AI Chat Interface**: Conversational interface for querying knowledge base
- **Session Management**: Multiple chat sessions with history
- **Chat-to-Ticket Conversion**: Convert unresolved chats to support tickets
- **Session Rating**: Rate chat sessions for quality feedback
- **Session Persistence**: Chat sessions persist across navigation

### Analytics Dashboard
- **Chat Analytics**: Comprehensive analytics dashboard for chat usage
- **Session Metrics**: Total sessions, messages, conversion rates
- **Top Articles**: Most referenced knowledge base articles
- **Top Topics**: Most discussed topics in chats
- **Time-based Trends**: Sessions over time visualization
- **Quick Access**: Analytics buttons on all relevant pages

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Built-in theme switching
- **Real-time Updates**: Live updates for ticket status changes
- **Session Persistence**: Chat sessions preserved across navigation

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19, Flowbite React
- **Styling**: Tailwind CSS 4
- **Rich Text**: TipTap
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **ORM**: Beanie (MongoDB ODM)
- **Database**: MongoDB 6
- **Vector Database**: ChromaDB
- **Task Queue**: Celery with Redis
- **AI/ML**: LangChain, OpenAI, Google Generative AI

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT tokens
- **Caching**: Redis
- **Background Tasks**: Celery Beat & Workers

## 📂 Project Structure

```
├── frontend/              # Next.js React application
│   ├── app/              # App Router pages
│   │   ├── tickets/      # Ticket management pages
│   │   ├── knowledge-base/ # KB pages (articles, chat, analytics)
│   │   └── auth/         # Authentication pages
│   ├── src/
│   │   ├── app/          # Application layer
│   │   │   ├── features/ # Feature modules
│   │   │   └── shared/   # Shared components
│   │   ├── lib/          # Core utilities and API clients
│   │   ├── hooks/        # Custom React hooks
│   │   └── contexts/     # React contexts
│   └── hooks/            # Feature-specific hooks
├── backend/               # FastAPI Python application
│   ├── src/
│   │   ├── api/          # API routes
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── langchain_app/ # AI/LLM integration
│   │   └── tasks/        # Celery tasks
│   └── requirements.txt  # Python dependencies
├── testing/              # Test documentation and scripts
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

## 🔧 Development

### Prerequisites
- Docker and Docker Compose
- (Optional) Node.js 18+ and Python 3.11+ for local development

### Running in Development Mode

**Option 1: Full Docker (Recommended)**
```bash
docker-compose up --build
```

**Option 2: Local Development**
```bash
# Backend
cd backend
pip install -r requirements.txt
python src/seed_data.py  # Run once to create demo data
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` file in project root:
```env
# Backend
MONGODB_URL=mongodb://mongodb:27017/ticketsystem
REDIS_URL=redis://redis-broker:6379/0
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here  # Optional

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## 📊 Demo Data

The application automatically creates:
- 6 demo users (3 regular users, 3 agents)
- Sample categories (Technical Support, Account Management, General Inquiry)
- Demo tickets with various statuses and priorities
- Knowledge base articles
- Tags for organization (department, priority, type)

## 🚀 Production Deployment

The application is containerized and ready for production deployment:

```bash
docker-compose up -d
```

All services run in separate containers:
- `mongodb` - Database
- `redis-broker` - Redis cache and message broker
- `chroma-vectordb` - Vector database for embeddings
- `fastapi-backend` - Backend API
- `celery-worker-task` - Background task worker
- `celery-beat-task` - Scheduled task scheduler
- `nextjs-frontend` - Frontend application

## 📖 API Documentation

When running, visit http://localhost:8000/docs for interactive API documentation with Swagger UI.

## 🧪 Testing

Comprehensive testing guides are available in the `testing/` directory:
- `CHAT_ANALYTICS_DASHBOARD_TEST.md` - Analytics dashboard testing
- `ANALYTICS_BUTTONS_TEST.md` - Analytics button functionality testing

## 🎨 Key Pages & Routes

### User Pages
- `/` - Dashboard (agents only)
- `/tickets` - My Tickets list
- `/tickets/create` - Create new ticket
- `/tickets/[id]` - Ticket details
- `/knowledge-base` - Knowledge base articles
- `/knowledge-base/chat` - AI chat interface
- `/knowledge-base/analytics` - Chat analytics dashboard
- `/profile` - User profile

### Agent Pages
- `/categories` - Category management
- `/knowledge-base/create` - Create KB article
- `/knowledge-base/[id]/edit` - Edit KB article

## 🔄 Recent Updates

### Chat Analytics Dashboard
- Comprehensive analytics for knowledge base chat usage
- Metrics include sessions, messages, conversion rates, satisfaction
- Time-based trends and top articles/topics
- Quick access buttons on all relevant pages

### Session Persistence
- Chat sessions persist across navigation
- Browser back button restores previous chat state
- Session deduplication prevents duplicate sessions

### Chat-to-Ticket Conversion
- Convert unresolved chats to support tickets
- Pre-filled ticket data from chat history
- Chat history included in ticket description
- Seamless navigation without logout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker-compose up --build`
5. Submit a pull request

## 📄 License

This project is part of the Revature training program.
