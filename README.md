# Collaborative Todo App

A collaborative task management web application that allows users to create, manage, and share tasks with others in real-time.

## Project Overview

### What This App Does

This is a full-stack todo application built with Next.js and Supabase that goes beyond a simple personal task list. Users can create tasks with titles, descriptions, due dates, and priorities, then share those tasks with collaborators via email. When a task is shared, both the owner and collaborator can view, edit, and complete it—with all changes synced in real-time.

### Why It Was Built

Traditional todo apps are personal and isolated. This app solves the problem of collaborative task management—think shared grocery lists, team project tasks, or household chores where multiple people need visibility and the ability to take action on the same items.

### How a User Would Use It

1. **Sign up** with email and password, then verify your email
2. **Sign in** to access your dashboard
3. **Create tasks** with a title, optional description, due date, and priority (low/medium/high)
4. **Organize tasks** by dragging and dropping them to reorder
5. **Share tasks** with other users by entering their email address
6. **Collaborate** on shared tasks—both parties can edit and complete them
7. **Track changes** via the task history feature that logs all actions
8. **Get notified** when someone shares a task with you or removes your access

---

## Features

### User Authentication

- **Sign Up**: New users register with name, email, and password. Email verification is required before accessing the app.
- **Sign In**: Existing users log in with email and password. Invalid credentials or unverified emails show appropriate error messages.
- **Sign Out**: Clear session and redirect to login page.
- **Session Persistence**: Sessions are managed via secure HTTP-only cookies through Supabase Auth.

### Task Management

- **Create Tasks**: Add new tasks with:
  - Title (required)
  - Description (optional)
  - Due date (required, must be today or in the future)
  - Priority level (low, medium, high—defaults to medium)

- **Edit Tasks**: Modify any field of an existing task. Both owners and collaborators can edit shared tasks.

- **Complete Tasks**: Toggle task completion status. Completed tasks appear in a separate "Completed" section with strikethrough styling.

- **Delete Tasks**: Only the task owner can delete a task. This permanently removes the task and all associated data.

- **Bulk Actions**:
  - Delete all completed tasks
  - Delete all tasks (owner's tasks only)

### Due Date Handling

- Due dates are stored in UTC and displayed in the user's local timezone
- Visual indicators show "Today", "Tomorrow", or the formatted date
- Overdue tasks display a red warning icon and highlighted text
- Date validation prevents selecting past dates when creating/editing tasks

### Task Sharing & Collaboration

- **Share by Email**: Task owners can share tasks with other users by entering their email address
- **Collaborator Management**: View all collaborators on a task and remove access if needed
- **Shared Task Indicator**: Tasks shared with you display a "Shared" badge with a two-person icon
- **Permission Rules**:
  - Only owners can share or delete tasks
  - Both owners and collaborators can edit tasks and toggle completion
  - Collaborators see a read-only share modal (can't add/remove other collaborators)

### Task History & Audit Logs

Every action on a task is logged, including:
- Task creation
- Task updates (edits)
- Completion/uncompletion
- Collaborator added
- Collaborator removed

Users can view the full history of any task they have access to, with timestamps and the email of who performed each action.

### Notifications

- Users receive in-app notifications when:
  - Someone shares a task with them
  - Someone removes them from a shared task
- Notification bell shows unread count
- Mark individual notifications or all as read
- Real-time notification updates via Supabase subscriptions

### Drag-and-Drop Reordering

- Users can reorder their active tasks via drag-and-drop
- Task order is stored per-user, so collaborators can have different orderings of the same shared tasks
- Order persists across sessions

### Theme Toggle

- Light and dark mode support
- Toggle button in the header
- Preference saved to localStorage and persists across sessions

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router for server-side rendering and server actions |
| **TypeScript** | Type safety across the entire codebase |
| **Tailwind CSS** | Utility-first styling with dark mode support |
| **Radix UI** | Accessible, unstyled primitives for checkboxes, labels, and slots |
| **Lucide React** & **React Icons** | Icon libraries for UI elements |
| **@dnd-kit** | Drag-and-drop functionality for task reordering |
| **Zod** | Schema validation for form inputs |

### Backend

| Technology | Purpose |
|------------|---------|
| **Next.js Server Actions** | Backend logic co-located with frontend, runs on the server |
| **Supabase Auth** | Email/password authentication with cookies |
| **Supabase SSR** | Server-side Supabase client for Next.js App Router |

Server actions are organized by domain:
- `actions/auth/` — signup, signin, signout
- `actions/todos/` — CRUD operations, sharing, audit logging
- `actions/notifications/` — fetch, mark read

### Database

| Technology | Purpose |
|------------|---------|
| **Supabase (PostgreSQL)** | Hosted PostgreSQL database with real-time subscriptions |

Supabase was chosen because:
- Built-in auth that integrates seamlessly with the database
- Row Level Security (RLS) policies for permission enforcement at the database layer
- Real-time subscriptions for live updates without custom WebSocket code
- Generous free tier for development/small projects

---

## Application Architecture

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│ Server Actions  │────▶│    Supabase     │
│   (React UI)    │◀────│ (Backend Logic) │◀────│   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │              Real-time Channels               │
        └───────────────────────────────────────────────┘
```

### Folder Structure

```
collaborative-todo-1/
├── actions/                 # Server actions (backend logic)
│   ├── auth/               # Authentication actions
│   ├── notifications/      # Notification CRUD
│   └── todos/              # Todo CRUD, sharing, audit logs
├── app/                    # Next.js App Router pages
│   ├── signin/             # Sign in page
│   ├── signup/             # Sign up page
│   └── page.tsx            # Main dashboard (protected)
├── components/             # React components
│   ├── auth/               # Auth-related components
│   ├── notifications/      # Notification bell dropdown
│   ├── realtime/           # Real-time subscription provider
│   ├── theme/              # Theme provider and toggle
│   ├── todos/              # All todo-related components
│   └── ui/                 # Base UI primitives (Button, Input, etc.)
├── lib/                    # Utilities and types
│   ├── interface.ts        # TypeScript interfaces
│   └── validations/        # Zod schemas
├── utils/
│   └── supabase/           # Supabase client initialization
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server-side client
│       └── middleware.ts   # Session refresh middleware
└── middleware.ts           # Next.js middleware for auth
```

### Data Flow

1. **Page Load**: Next.js server component fetches data using Supabase server client
2. **User Action**: Client component calls a server action
3. **Server Action**: Validates auth, performs database operation, calls `revalidatePath("/")` to refresh
4. **Real-time**: Supabase sends PostgreSQL changes to subscribed clients, triggering `router.refresh()`

---

## API Documentation

### Authentication Actions

#### `signup(formData: FormData)`
Creates a new user account.

**Input:**
- `email` (string): User's email
- `password` (string): User's password

**Behavior:**
- Registers user with Supabase Auth
- Sends verification email
- Redirects to `/signin`

**Errors:**
- Throws if email already exists or password is too weak

---

#### `signin(formData: FormData)`
Authenticates an existing user.

**Input:**
- `email` (string): User's email
- `password` (string): User's password

**Behavior:**
- Authenticates with Supabase
- Sets session cookies
- Redirects to `/` (dashboard)

**Errors:**
- Redirects to `/signin?error=invalid_credentials` for wrong email/password
- Redirects to `/signin?error=email_not_verified` if email not verified

---

#### `signout()`
Signs out the current user.

**Behavior:**
- Clears session
- Redirects to `/signin`

---

### Todo Actions

#### `addTodo(formData: FormData)`
Creates a new task.

**Input:**
- `task` (string): Task title
- `description` (string, optional): Task description
- `due_date` (string): Date in YYYY-MM-DD format
- `priority` (string): "low", "medium", or "high"

**Permissions:** Authenticated users only

**Behavior:**
- Creates task in database with user_id of current user
- Creates audit log entry
- Revalidates page

---

#### `editTodo(todo: Todo)`
Updates an existing task.

**Input:** Full Todo object with updated fields

**Permissions:** Task owner or collaborator

**Behavior:**
- Updates task, description, due_date, priority
- Creates audit log entry

---

#### `deleteTodo(id: string)`
Permanently deletes a task.

**Permissions:** Task owner only (enforced via RLS)

---

#### `onCheckChange(todo: Todo)`
Toggles task completion status.

**Permissions:** Task owner or collaborator

**Behavior:**
- Toggles `is_complete` boolean
- Creates audit log entry

---

#### `updateTaskOrder(orderedTodoIds: string[])`
Saves drag-and-drop reordering.

**Input:** Array of todo IDs in desired order

**Behavior:**
- Upserts to `user_task_order` table
- Order is per-user, not global

---

### Sharing Actions

#### `shareTodo(todoId: string, email: string)`
Shares a task with another user.

**Permissions:** Task owner only

**Validation:**
- Cannot share with yourself
- Cannot share with same person twice

**Behavior:**
- Creates entry in `todo_shares` table
- Creates audit log entry

---

#### `getCollaborators(todoId: string)`
Fetches all users a task is shared with.

**Returns:** Array of TodoShare objects

---

#### `removeCollaborator(todoId: string, email: string)`
Removes a user's access to a shared task.

**Permissions:** Task owner only

**Behavior:**
- Deletes share entry
- Creates notification for removed user
- Creates audit log entry

---

### Notification Actions

#### `getNotifications()`
Fetches notifications for the current user.

**Returns:** Array of up to 20 most recent notifications

---

#### `markNotificationRead(id: string)`
Marks a single notification as read.

---

#### `markAllNotificationsRead()`
Marks all notifications as read.

---

## Database Structure

### Tables

#### `todos`
Stores all tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Owner's user ID (foreign key to auth.users) |
| `task` | TEXT | Task title |
| `description` | TEXT | Optional description |
| `due_date` | TIMESTAMPTZ | Due date in UTC |
| `priority` | TEXT | "low", "medium", or "high" |
| `is_complete` | BOOLEAN | Completion status |
| `inserted_at` | TIMESTAMPTZ | Creation timestamp |

#### `todo_shares`
Tracks shared tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `todo_id` | UUID | Foreign key to todos |
| `owner_id` | UUID | Task owner's user ID |
| `shared_with_email` | TEXT | Email of collaborator |
| `shared_with_user_id` | UUID | User ID if they have an account |
| `created_at` | TIMESTAMPTZ | When shared |

Unique constraint on `(todo_id, shared_with_email)` prevents duplicate shares.

#### `user_task_order`
Per-user task ordering for drag-and-drop.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User whose order this is |
| `todo_id` | UUID | Task being ordered |
| `sort_order` | INTEGER | Position in list |
| `created_at` | TIMESTAMPTZ | When set |

#### `task_audit_logs`
History of all task actions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `todo_id` | UUID | Related task |
| `action_type` | TEXT | created, updated, completed, etc. |
| `message` | TEXT | Human-readable description |
| `performed_by_user_id` | UUID | Who did it |
| `performed_by_email` | TEXT | Email of actor |
| `created_at` | TIMESTAMPTZ | When it happened |

#### `notifications`
In-app notifications for users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Recipient |
| `type` | TEXT | Notification type |
| `title` | TEXT | Short title |
| `message` | TEXT | Full message |
| `todo_id` | UUID | Related task (optional) |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMPTZ | When created |

### Relationships

```
users (auth.users)
  │
  ├──< todos (user_id)
  │      │
  │      ├──< todo_shares (todo_id)
  │      ├──< task_audit_logs (todo_id)
  │      └──< user_task_order (todo_id)
  │
  ├──< notifications (user_id)
  └──< user_task_order (user_id)
```

---

## External Libraries

| Library | Purpose | Where Used |
|---------|---------|------------|
| `@supabase/ssr` | Supabase client for Next.js server components | `utils/supabase/` |
| `@supabase/supabase-js` | Core Supabase client | `utils/supabase/client.ts` |
| `zod` | Form validation with type inference | `lib/validations/` |
| `@dnd-kit/core` | Core drag-and-drop functionality | `components/todos/sortable-todo-list.tsx` |
| `@dnd-kit/sortable` | Sortable preset for reordering | `components/todos/sortable-*.tsx` |
| `@radix-ui/react-checkbox` | Accessible checkbox primitive | `components/ui/checkbox.tsx` |
| `@radix-ui/react-label` | Accessible label primitive | `components/ui/label.tsx` |
| `lucide-react` | Icon library | Throughout components |
| `class-variance-authority` | Variant styling for components | `components/ui/` |
| `tailwind-merge` | Merge Tailwind classes without conflicts | `lib/utils.ts` |
| `tailwindcss-animate` | Animation utilities | `tailwind.config.ts` |

---

## Environment & Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (found in project settings) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side access |

Both are prefixed with `NEXT_PUBLIC_` because they're used in both client and server contexts.

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the required tables (see Database Structure above)
3. Enable Row Level Security on all tables
4. Set up RLS policies for proper access control
5. Enable real-time for `todos`, `todo_shares`, and `notifications` tables

---

## Security & Permissions

### Authentication Flow

1. User submits credentials to server action
2. Supabase Auth validates and returns session tokens
3. Session stored in HTTP-only cookies (secure, no JavaScript access)
4. Middleware refreshes session on each request
5. Server actions verify session before any database operation

### Route Protection

- **Public routes**: `/signin`, `/signup`
- **Protected routes**: `/` (dashboard)

The middleware (`middleware.ts`) runs on every request and refreshes the session. The main page component checks for authenticated user and redirects to `/signin` if not found.

### Permission Enforcement

Permissions are enforced at two levels:

1. **Application Layer**: Server actions check `user_id` matches current user before allowing owner-only operations
2. **Database Layer**: Supabase RLS policies provide an additional security layer

| Action | Owner | Collaborator |
|--------|-------|--------------|
| View task | ✅ | ✅ |
| Edit task | ✅ | ✅ |
| Complete task | ✅ | ✅ |
| Delete task | ✅ | ❌ |
| Share task | ✅ | ❌ |
| Remove collaborator | ✅ | ❌ |

---

## Limitations & Improvements

### Known Limitations

- **No password reset flow**: Users who forget their password have no self-service recovery option
- **Email-only sharing**: Users must know the exact email address; no username search
- **No offline support**: Requires internet connection for all operations
- **No recurring tasks**: Tasks are one-time only
- **No subtasks or checklists**: Tasks are single-level
- **No file attachments**: Cannot attach images or documents to tasks

### Potential Improvements

With more time, I would add:

- **Password reset via email** with Supabase Auth magic links
- **Task categories/tags** for better organization
- **Search and filter** by title, priority, due date, or tags
- **Due date reminders** via email or push notifications
- **Mobile-responsive design improvements** for better small-screen experience
- **Keyboard shortcuts** for power users
- **Task comments** for collaboration discussion
- **Export/import** tasks as CSV or JSON
- **Calendar view** showing tasks by due date

---

## How to Run the Project Locally

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-todo-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Create tables as described in Database Structure
   - Enable RLS and create appropriate policies
   - Enable real-time for relevant tables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Summary

This collaborative todo app demonstrates a full-stack implementation using modern web technologies. It handles real-world concerns like authentication, authorization, real-time updates, and collaborative workflows. The codebase follows Next.js App Router conventions with server actions for backend logic, making it a cohesive example of building production-ready applications with React and Supabase.
