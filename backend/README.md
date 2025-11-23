# Backend - FastAPI Ticketing System

A robust FastAPI backend with AI-powered features, intelligent ticket management, and knowledge base chat capabilities.

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
# From project root
docker-compose up backend
```

### Local Development
```bash
cd backend
pip install -r requirements.txt
python src/seed_data.py  # Run once to create demo data
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## 🛠 Tech Stack

- **Framework**: FastAPI
- **Python**: 3.11
- **Database**: MongoDB 6 with Beanie ODM
- **Vector DB**: ChromaDB
- **Task Queue**: Celery with Redis
- **AI/ML**: LangChain, OpenAI, Google Generative AI
- **Authentication**: JWT tokens

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/              # API routes
│   │   └── v1/
│   │       └── routes/   # Route modules
│   │           ├── ticket.py
│   │           ├── kb_chat.py
│   │           ├── article.py
│   │           └── ...
│   │
│   ├── models/           # Database models
│   │   ├── ticket.py
│   │   ├── chat_session.py
│   │   ├── article.py
│   │   └── ...
│   │
│   ├── services/         # Business logic
│   │   ├── ticket_service.py
│   │   ├── kb_chat_service.py
│   │   ├── chat_analytics_service.py
│   │   ├── ai_service.py
│   │   └── ...
│   │
│   ├── langchain_app/    # AI/LLM integration
│   │   ├── chains/        # LangChain chains
│   │   │   ├── kb_chat.py
│   │   │   ├── summarize_ticket_data.py
│   │   │   └── ...
│   │   └── config/       # Model configuration
│   │
│   ├── tasks/            # Celery tasks
│   │   └── sla_monitor.py
│   │
│   ├── schemas/          # Pydantic schemas
│   ├── utils/            # Utility functions
│   └── core/             # Core configuration
│
├── main.py               # FastAPI application entry point
├── requirements.txt      # Python dependencies
└── Dockerfile            # Docker configuration
```

## 🎯 Key Features

### API Endpoints

#### Authentication
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile
- `POST /api/v1/users/logout` - User logout

#### Tickets
- `GET /api/v1/tickets` - List tickets (with filters)
- `POST /api/v1/tickets` - Create ticket
- `GET /api/v1/tickets/{id}` - Get ticket details
- `PUT /api/v1/tickets/{id}` - Update ticket
- `POST /api/v1/tickets/{id}/assign` - Assign ticket
- `POST /api/v1/tickets/{id}/status` - Update status
- `GET /api/v1/tickets/stats` - Get ticket statistics
- `POST /api/v1/tickets/{id}/summary` - Generate AI summary
- `POST /api/v1/tickets/{id}/closing_comments` - Generate closing comments

#### Knowledge Base Chat
- `GET /api/v1/kb-chat/sessions` - List chat sessions
- `POST /api/v1/kb-chat/sessions` - Create chat session
- `GET /api/v1/kb-chat/sessions/{id}` - Get session details
- `GET /api/v1/kb-chat/sessions/{id}/messages` - Get messages
- `POST /api/v1/kb-chat/sessions/{id}/messages` - Send message
- `POST /api/v1/kb-chat/sessions/{id}/rate` - Rate session
- `POST /api/v1/kb-chat/sessions/{id}/convert-to-ticket` - Convert to ticket
- `DELETE /api/v1/kb-chat/sessions/{id}` - Delete session
- `GET /api/v1/kb-chat/analytics` - Get chat analytics

#### Knowledge Base Articles
- `GET /api/v1/articles` - List articles
- `POST /api/v1/articles` - Create article
- `GET /api/v1/articles/{id}` - Get article
- `PUT /api/v1/articles/{id}` - Update article
- `DELETE /api/v1/articles/{id}` - Delete article
- `GET /api/v1/articles/search` - Search articles
- `POST /api/v1/articles/generate-tags` - Generate AI tags

#### Categories & Tags
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/subcategories` - List subcategories
- `GET /api/v1/tags` - List tags

#### Files
- `POST /api/v1/files/upload` - Upload file
- `GET /api/v1/files/{id}/download` - Download file
- `POST /api/v1/files/tickets/{id}/attach` - Attach files to ticket

### AI-Powered Features

#### Ticket Summarization
- Automatic AI-generated summaries for tickets
- Uses OpenAI GPT models
- Fallback to Google Generative AI
- Background task processing

#### Intelligent Agent Assignment
- AI-powered ticket routing
- Matches tickets to agents based on expertise
- Considers agent workload and specialization
- Automatic assignment on ticket creation

#### Knowledge Base Chat
- Conversational AI interface
- Semantic search across KB articles
- Context-aware responses
- Source citation and references
- Chat history management

#### Chat Analytics
- Comprehensive analytics service
- Aggregates session and message data
- Calculates conversion rates and metrics
- Identifies top articles and topics
- Time-based trend analysis

### Background Tasks

#### Celery Tasks
- `assign_ticket_to_agent_task` - AI agent assignment
- `generate_initial_summary_task` - Ticket summary generation
- `monitor_sla_task` - SLA breach monitoring (scheduled)

## 🔧 Configuration

### Environment Variables

```env
MONGODB_URL=mongodb://mongodb:27017/ticketsystem
REDIS_URL=redis://redis-broker:6379/0
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here  # Optional
SECRET_KEY=your_secret_key_here
```

### Database Models

- `User` - User accounts with roles
- `Ticket` - Support tickets
- `Comment` - Ticket comments
- `Category` / `SubCategory` - Ticket categorization
- `Tag` - Ticket tags
- `Article` - Knowledge base articles
- `KBChatSession` - Chat sessions
- `ChatMessage` - Chat messages
- `FileDocument` - File attachments

## 📊 Seed Data

Run seed data script to populate database:

```bash
python src/seed_data.py
```

Creates:
- 6 demo users (3 regular users, 3 agents)
- Categories and subcategories
- Sample tickets
- Knowledge base articles
- Tags

## 🔐 Authentication

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (user/agent)
- Token expiration handling

## 🤖 AI Integration

### LangChain Chains
- `KBChatChain` - Knowledge base chat chain
- `SummarizeTicketChain` - Ticket summarization
- `GenerateClosingCommentsChain` - Closing comment generation
- `AgentAssignmentChain` - Intelligent agent assignment

### Model Configuration
- Supports OpenAI GPT models
- Supports Google Generative AI
- Lazy initialization for optional APIs
- Fallback mechanisms for reliability

## 📈 Analytics Service

### Chat Analytics (`chat_analytics_service.py`)
- Aggregates chat session data
- Calculates metrics (sessions, messages, conversion rates)
- Identifies top articles and topics
- Generates time-based trends
- Supports date range filtering

## 🚀 Production Deployment

The backend runs in Docker containers:
- `fastapi-backend` - Main API server
- `celery-worker-task` - Background task worker
- `celery-beat-task` - Scheduled task scheduler

## 📖 API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔄 Recent Updates

### Chat Analytics API
- New endpoint: `GET /api/v1/kb-chat/analytics`
- Supports date range filtering (days parameter)
- Returns comprehensive analytics data
- User-specific analytics (future: admin view all)

### Session Management
- Improved session persistence
- Session deduplication
- Better error handling
- Session verification on restore

### Chat-to-Ticket Conversion
- Enhanced conversion service
- Chat history included in ticket description
- Pre-filled ticket data
- Proper session marking

## 🧪 Testing

Test scripts available:
- `test_chat_api.py` - Chat API testing
- `test_kb_chain.py` - Knowledge base chain testing
- `test_llm_access.py` - LLM connection testing

## 📦 Key Dependencies

```txt
fastapi==0.115.0
beanie==1.23.0
pymongo==4.6.0
langchain==0.3.0
langchain-openai==0.2.0
openai==1.54.0
celery==5.3.4
redis==5.0.1
chromadb==0.5.0
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
```

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Write docstrings for public methods
4. Test API endpoints with Swagger UI
5. Update this README for new features
