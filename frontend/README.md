# Frontend - Next.js Ticketing System

A modern, responsive frontend application built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
# From project root
docker-compose up frontend
```

### Local Development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Styling**: Tailwind CSS 4.1.11
- **UI Components**: Flowbite React 0.12.2
- **Rich Text Editor**: TipTap 3.0.7
- **Icons**: Lucide React 0.525.0
- **HTTP Client**: Axios 1.11.0
- **Date Utilities**: date-fns 4.1.0

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── tickets/           # Ticket management pages
│   ├── knowledge-base/    # Knowledge base pages
│   │   ├── chat/         # AI chat interface
│   │   ├── analytics/    # Chat analytics dashboard
│   │   └── [id]/         # Article detail/edit pages
│   ├── categories/        # Category management (agents)
│   └── profile/           # User profile pages
│
├── src/
│   ├── app/               # Application layer
│   │   ├── features/      # Feature modules
│   │   │   ├── tickets/   # Ticket components
│   │   │   ├── categories/# Category components
│   │   │   └── dashboard/ # Dashboard components
│   │   └── shared/        # Shared components
│   │       ├── components/# Reusable UI components
│   │       ├── hooks/     # Custom hooks
│   │       └── types/     # TypeScript types
│   │
│   ├── lib/               # Core utilities
│   │   ├── api/           # API client methods
│   │   └── utils/         # Utility functions
│   │
│   ├── hooks/             # Global hooks
│   │   └── useChatHistory.ts
│   │
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   └── constants/         # Application constants
│       └── api.ts         # API endpoints
│
├── hooks/                 # Feature-specific hooks
│   ├── useChatSessions.ts
│   └── useKBChat.ts
│
└── types/                 # TypeScript type definitions
    └── chat.ts
```

## 🎯 Key Features

### Pages & Routes

#### Public Pages
- `/auth/login` - User login

#### User Pages
- `/` - Dashboard (agents only, redirects users to tickets)
- `/tickets` - My Tickets list with filters and search
- `/tickets/create` - Create new ticket with file uploads
- `/tickets/[id]` - Ticket details with comments and AI summary
- `/knowledge-base` - Browse knowledge base articles
- `/knowledge-base/chat` - AI-powered chat interface
- `/knowledge-base/analytics` - Chat analytics dashboard
- `/profile` - User profile and settings

#### Agent Pages
- `/categories` - Category and subcategory management
- `/knowledge-base/create` - Create knowledge base article
- `/knowledge-base/[id]/edit` - Edit knowledge base article

### Components

#### Shared Components
- `MainLayout` - Main application layout with header and sidebar
- `Header` - Top navigation bar with user menu
- `Sidebar` - Side navigation menu
- `ProtectedRoute` - Route protection with role-based access
- `ChatInterface` - Reusable chat interface component
- `LoadingSpinner` - Loading state component
- `StatusBadge` - Status badge components

#### Feature Components
- `TicketsList` - Ticket listing with filters
- `CreateTicketForm` - Ticket creation form
- `TicketDetail` - Ticket detail view
- `CategoriesManagement` - Category management interface
- `ChatAnalyticsDashboard` - Analytics dashboard

### Hooks

#### Custom Hooks
- `useAuth` - Authentication context hook
- `useChatHistory` - Chat message history management
- `useChatSessions` - Chat session management
- `useKBChat` - Knowledge base chat API methods

### API Integration

All API calls are centralized in `src/lib/api/`:
- `tickets.ts` - Ticket API methods
- `kb-chat.ts` - Knowledge base chat API
- `articles.ts` - Knowledge base articles API
- `categories.ts` - Categories API
- `files.ts` - File upload/download API
- `client.ts` - Axios client with interceptors

## 🎨 Styling

The application uses Tailwind CSS with Flowbite React components:
- Responsive design (mobile-first)
- Dark mode support
- Consistent color scheme (orange/blue theme)
- Custom utility classes

## 🔐 Authentication

- JWT token-based authentication
- Token stored in localStorage
- Automatic token refresh
- Protected routes with role-based access
- Auto-logout on 401 errors

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Responsive navigation (collapsible sidebar)
- Touch-friendly interface

## 🌙 Dark Mode

Built-in dark mode support:
- System preference detection
- Manual toggle in header
- Persistent theme preference
- Smooth transitions

## 🚀 Building for Production

```bash
npm run build
npm start
```

The application builds to `.next/standalone` for optimized production deployment.

## 📦 Key Dependencies

```json
{
  "next": "^15.4.2",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "typescript": "^5.8.3",
  "tailwindcss": "^4.1.11",
  "flowbite-react": "^0.12.2",
  "axios": "^1.11.0",
  "@tiptap/react": "^3.0.7",
  "lucide-react": "^0.525.0",
  "date-fns": "^4.1.0"
}
```

## 🔄 Recent Updates

### Chat Analytics Dashboard
- Comprehensive analytics page at `/knowledge-base/analytics`
- Metrics: sessions, messages, conversion rates, satisfaction
- Visualizations: time trends, top articles, top topics
- Quick access buttons on tickets, KB, and chat pages

### Session Persistence
- Chat sessions persist across navigation using sessionStorage
- Browser back button restores previous chat state
- Automatic session restoration on page load
- Session deduplication prevents duplicates

### Chat-to-Ticket Conversion
- Convert chats to tickets with pre-filled data
- Chat history included in ticket description
- Seamless navigation without logout
- Modal-based conversion interface

### Analytics Buttons
- Analytics buttons added to:
  - My Tickets page header
  - Knowledge Base page header
  - KB Chat page header
- Consistent styling and icon (BarChart3)
- Direct navigation to analytics dashboard

## 🧪 Testing

See `testing/ANALYTICS_BUTTONS_TEST.md` for comprehensive testing guides.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Flowbite React](https://flowbite-react.com)
