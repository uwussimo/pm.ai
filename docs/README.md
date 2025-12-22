# Project Management Tool

A full-featured, multi-tenant project management application built with Next.js 15, Prisma, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

## Features

### Core Functionality

- **Multi-tenant Architecture**: Users can create unlimited projects and invite team members
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Real-time Kanban Board**: Drag-and-drop task management with @dnd-kit
- **Rich Task Management**:
  - Full GitHub Flavored Markdown support for descriptions
  - Task assignments to team members
  - Due dates and start dates
  - Image attachments
  - Real-time comments system
- **Customizable Workflows**: Create custom status columns with colors and emojis
- **Dark/Light Mode**: Full theme support with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Technical Features

- Server-side rendering with Next.js 15
- Type-safe database queries with Prisma
- Beautiful UI components with shadcn/ui
- Real-time updates with React Server Components
- Protected routes with middleware
- Optimistic UI updates

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**

```bash
npm install
```

2. **Setup environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pm_db"
JWT_SECRET="your-secret-key-change-in-production"
```

3. **Setup database**

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

Or use the setup script:

```bash
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

4. **Start development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Getting Started

1. **Sign Up**: Create your account at `/signup`
2. **Create Project**: From the dashboard, click "New Project"
3. **Setup Workflow**: Add status columns (e.g., "To Do", "In Progress", "Done")
4. **Create Tasks**: Add tasks with rich markdown descriptions
5. **Invite Team**: Share projects with team members via email
6. **Collaborate**: Assign tasks, add comments, and track progress

### Project Management

- **Drag & Drop**: Move tasks between statuses by dragging
- **Task Details**: Click any task to view/edit full details
- **Markdown Support**: Use markdown in task descriptions for formatting
- **Comments**: Collaborate with team members through task comments
- **Assignments**: Assign tasks to specific team members
- **Dates**: Set start and due dates for better planning

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui, Radix UI
- **Drag & Drop**: @dnd-kit
- **Markdown**: react-markdown, remark-gfm
- **Theme**: next-themes
- **Notifications**: sonner

### Backend

- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Authentication**: JWT (jose), bcryptjs
- **API**: Next.js API Routes

## Project Structure

```
pm-usufdev/
├── app/
│   ├── (auth)/
│   │   ├── signin/          # Sign in page
│   │   └── signup/          # Sign up page
│   ├── api/
│   │   ├── auth/            # Authentication endpoints
│   │   ├── projects/        # Project CRUD
│   │   ├── statuses/        # Status management
│   │   ├── tasks/           # Task management
│   │   └── comments/        # Comments system
│   ├── dashboard/           # Projects dashboard
│   ├── projects/[id]/       # Project detail with Kanban
│   ├── layout.tsx           # Root layout with theme
│   └── page.tsx             # Home (redirects)
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard-header.tsx # App header
│   ├── projects-list.tsx    # Projects grid
│   ├── project-board.tsx    # Kanban board
│   ├── task-dialog.tsx      # Task create/edit
│   └── theme-toggle.tsx     # Dark/light mode
├── lib/
│   ├── auth.ts              # JWT utilities
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Helpers
├── prisma/
│   └── schema.prisma        # Database schema
└── middleware.ts            # Route protection
```

## API Documentation

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project with statuses and tasks
- `PATCH /api/projects/[id]` - Update project (owner only)
- `DELETE /api/projects/[id]` - Delete project (owner only)
- `POST /api/projects/[id]/invite` - Invite user (owner only)

### Statuses

- `POST /api/projects/[id]/statuses` - Create status column
- `PATCH /api/statuses/[id]` - Update status
- `DELETE /api/statuses/[id]` - Delete status

### Tasks

- `POST /api/projects/[id]/tasks` - Create task
- `GET /api/tasks/[id]` - Get task with comments
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Comments

- `POST /api/tasks/[id]/comments` - Add comment
- `PATCH /api/comments/[id]` - Update own comment
- `DELETE /api/comments/[id]` - Delete own comment

## Database Schema

```prisma
User {
  id, email, password
  projects (many-to-many)
  tasks (assigned)
  comments
}

Project {
  id, name, description, ownerId
  users (many-to-many)
  statuses
  tasks
}

Status {
  id, name, color, unicode, order
  projectId
  tasks
}

Task {
  id, title, description, imageUrl
  startDate, dueDate
  projectId, statusId, assigneeId
  comments
}

Comment {
  id, content
  userId, taskId
}
```

## Security

- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcrypt (10 rounds)
- Protected API routes with session validation
- Multi-tenant data isolation
- Cascade deletes for data integrity
- CSRF protection via same-origin policy

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database commands
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate client
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
# Coming soon
```

## Contributing

This is a personal project, but suggestions are welcome!

## License

MIT

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)
