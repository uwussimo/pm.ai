# Project Management Tool - Setup Guide

A full-featured multi-tenant project management tool built with Next.js 15, Prisma, and PostgreSQL.

## Features

- **Multi-tenant Architecture**: Users can create multiple projects and invite team members
- **Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Kanban Board**: Drag-and-drop task management with customizable statuses
- **Rich Task Management**:
  - Full markdown support for task descriptions
  - Task assignments
  - Due dates and start dates
  - Image attachments
  - Comments system
- **Dark/Light Mode**: Full theme support with next-themes
- **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with jose, bcryptjs
- **Drag & Drop**: @dnd-kit
- **Markdown**: react-markdown, remark-gfm

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Create a PostgreSQL database and update the `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/pm_db"
JWT_SECRET="your-secret-key-change-in-production"
```

### 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Usage Flow

1. **Sign Up**: Create a new account at `/signup`
2. **Dashboard**: View all your projects
3. **Create Project**: Click "New Project" to create a project
4. **Add Statuses**: Create status columns (e.g., "To Do", "In Progress", "Done")
5. **Create Tasks**: Add tasks to statuses with full markdown descriptions
6. **Invite Users**: Project owners can invite team members by email
7. **Manage Tasks**:
   - Drag and drop tasks between statuses
   - Assign tasks to team members
   - Add comments to tasks
   - Set due dates

## Database Schema

- **User**: Authentication and user management
- **Project**: Multi-tenant projects with owner and members
- **Status**: Customizable workflow statuses per project
- **Task**: Tasks with markdown, assignments, dates, and images
- **Comment**: Task comments with user attribution

## API Routes

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/projects/[id]/invite` - Invite user to project

### Statuses

- `POST /api/projects/[id]/statuses` - Create status
- `PATCH /api/statuses/[id]` - Update status
- `DELETE /api/statuses/[id]` - Delete status

### Tasks

- `POST /api/projects/[id]/tasks` - Create task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Comments

- `POST /api/tasks/[id]/comments` - Add comment
- `PATCH /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation (use a strong random string)

## Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Protected API routes with session validation
- Multi-tenant data isolation
- CSRF protection through same-origin policy

## Notes

- Only project owners can invite users, create statuses, and delete projects
- All project members can create and manage tasks
- Users can only edit/delete their own comments
- Task descriptions support full GitHub Flavored Markdown
- Drag-and-drop updates task status in real-time
