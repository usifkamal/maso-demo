# White-Label AI Chatbot Platform MVP - Demo Version

> **🎭 Demo Version**: This is a **demo version** of the White-Label AI Chatbot Platform, configured with demo mode enabled by default.
A comprehensive monorepo containing two main services for building a white-label AI chatbot platform:

- **Backend** (`/backend`) - File processing, URL crawling, document management, and AI embeddings service
- **Frontend** (`/frontend`) - User interface, dashboard, and chat experience

**Note:** This demo version does not connect to real databases or store real data.

## 🏗️ Architecture

This monorepo uses **pnpm workspaces** to manage two independent Next.js applications:

```
├── backend/          # File processing & ingestion service (Port 3004)
├── frontend/         # Chat UI & dashboard service (Port 3000)
├── package.json      # Root workspace configuration
└── README.md
```

## 🌍 EU Compliance

This platform is configured for EU compliance with:
- **Supabase Region**: Frankfurt (EU Central 1)
- **No Telemetry**: All tracking and analytics disabled
- **GDPR Compliant**: Full data protection compliance
- **EU-Based Infrastructure**: All data processing within EU

See [EU Compliance Documentation](docs/EU-COMPLIANCE.md) and [GDPR Checklist](docs/GDPR.md) for details.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Supabase** account and project (Frankfurt region)
- **OpenAI** API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd white-label-ai-chatbot-platform
   pnpm install
   ```

2. **Set up environment variables:**
   
   Copy the example environment files and configure them:
   ```bash
   cp docs/env-examples/backend.env.example backend/.env.local
   cp docs/env-examples/frontend.env.example frontend/.env.local
   ```

3. **Configure each service:**
   
   **Backend** (`backend/.env.local`):
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   
   # Application
   PORT=3004
   NEXT_TELEMETRY_DISABLED=1
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   
   # Application
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3004
   NEXT_TELEMETRY_DISABLED=1
   ```

### Running the Services

#### Option 1: Run All Services (Recommended)
```bash
# Start all services in parallel
pnpm dev
```

This will start:
- Backend: http://localhost:3004
- Frontend: http://localhost:3000

#### Option 2: Run Individual Services
```bash
# Backend only
pnpm --filter backend run dev

# Frontend only
pnpm --filter frontend run dev
```

## 📁 Project Structure

### Backend (`/backend`)
- **Purpose**: File processing, URL crawling, document management, and AI embeddings
- **Tech Stack**: Next.js 15, Supabase, Gemini/OpenAI, TypeScript, Langchain
- **Key Features**:
  - File upload and processing (PDF, TXT)
  - URL crawling and content extraction (Cheerio)
  - Document chunking and embedding (Gemini)
  - Vector search capabilities (pgvector)
  - Background job processing
  - Multi-tenant API with authentication

### Frontend (`/frontend`)
- **Purpose**: User interface and chat experience
- **Tech Stack**: Next.js 13, React, Tailwind CSS, TypeScript
- **Key Features**:
  - Modern chat interface
  - Real-time messaging
  - User authentication
  - Responsive design

## 🛠️ Development Commands

### Root Level Commands
```bash
# Install all dependencies
pnpm install

# Run all services in development
pnpm dev

# Build all services
pnpm build

# Start all services in production
pnpm start

# Lint all services
pnpm lint

# Type check all services
pnpm type-check

# Clean all node_modules
pnpm clean
```

### Service-Specific Commands
```bash
# Backend commands
pnpm --filter backend run dev
pnpm --filter backend run build
pnpm --filter backend run start


# Frontend commands
pnpm --filter frontend run dev
pnpm --filter frontend run build
```

## 🔧 Configuration

### Port Configuration
- **Backend**: 3004
- **Frontend**: 3000

### Environment Variables
Each service has its own `.env.local` file. See the `.env.example` files in each directory for required variables.

### Database Setup
1. Create a Supabase project
2. Run the migration files in each service's `supabase/migrations/` directory
3. Configure the database URLs in your environment files

### Overview

This project uses a multi-service architecture:
- **Frontend**: Deploy to Vercel (Next.js optimized)
- **Backend**: Deploy to Render or Fly.io (persistent jobs, file processing)
- **Database**: Supabase (managed PostgreSQL with pgvector)


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
