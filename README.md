# Collaborative Todo App

A collaborative task management web application that allows users to create, manage, and share tasks with others in real time.

![Login Page](./assets/LoginPage.png)


## Project Overview

This is a collaborative task management web application that has been created by me, that allows users to create, manage, and share tasks with others in real-time. We can create tasks with titles, descriptions, due dates, and priorities, then share those tasks with collaborators via email. When a task is shared, both the owner and collaborator can view, edit and complete it, with all changes synced in real-time.

## Quick Guide on how to use it

1. **Sign up** with email and password, then verify your email
2. **Sign in** to access your dashboard
3. **Create tasks** with a title, optional description, due date, and priority (low/medium/high)
4. **Organize tasks** by dragging and dropping them to reorder
5. **Share tasks** with other users by entering their email address
6. **Collaborate** on shared tasks—both parties can edit and complete them
7. **Track changes** via the task history feature that logs all actions
8. **Get notified** when someone shares a task with you or removes your access

## Features

1. User Authentication
2. Task Management
3. Due Date Handling
4. Task Sharing & Collaboration
5. Task History & Audit Logs
6. Notifications
7. Drag-and-Drop Functionality
8. Theme Toggle

## External Libraries

### Frontend

| Technology                 | Purpose                                                               |
| -------------------------- | --------------------------------------------------------------------- |
| Next.js                    | React framework with App Router for server-side rendering and actions |
| TypeScript                 | End-to-end type safety across the codebase                            |
| Tailwind CSS               | Utility-first styling with built-in dark mode support                 |
| Radix UI                   | Accessible, unstyled UI primitives (checkboxes, labels, slots)        |
| Lucide React & React Icons | Icon libraries for consistent UI elements                             |
| @dnd-kit                   | Drag-and-drop support for task reordering                             |
| Zod                        | Schema-based validation for form inputs                               |

### Backend

| Technology     | Purpose                                                         |
| -------------- | --------------------------------------------------------------- |
| Next.js Server | Backend logic co-located with frontend, executed on the server  |
| Supabase Auth  | Email/password authentication with secure cookie-based sessions |
| Supabase SSR   | Server-side Supabase client for Next.js App Router              |



## Preview

### SignIn Page
![Login Page](./assets/LoginPage.png)

### SignUp Page
![Signup Page](./assets/SignupPage.png)

### Home Page
![Home Page](./assets/HomePage.png)