# TransitOps — Intelligent Fleet Operations & Logistics Platform

TransitOps is a modern, enterprise-grade Fleet Management and Logistics platform designed to track, schedule, audit, and analyze fleet resources, driver dispatches, maintenance logs, and financial transactions (fuel logs, tolls, custom expenses).

This repository is organized as a monorepo containing:
1. **`/backend`**: A robust Laravel 11 REST API utilizing Laravel Sanctum for Bearer-token authentication, Spatie Laravel Permission for RBAC (Role-Based Access Control), and Eloquent database services.
2. **`/frontend`**: A premium Next.js (App Router) client application styled with high-fidelity custom CSS/Tailwind components, offering fully responsive screens for different roles (Admin, Dispatcher, Fleet Manager, Safety Officer, and Driver).

---

## Technical Stack & Architecture

### Backend
- **Framework**: Laravel 11.x
- **Database**: MySQL 8.0+ (Production) / SQLite (Local/Testing fallback)
- **Authentication**: Laravel Sanctum Bearer Token Auth
- **Access Control**: Spatie Permission (Roles & Permissions)

### Frontend
- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript
- **State & Routing**: React Context, Next.js Server Components, custom async fetch state
- **Styling**: Vanilla CSS custom themes & Tailwind CSS v4, fully responsive touch-friendly layout

---

## Installation & Setup Instructions

To get TransitOps fully running on any machine, follow these step-by-step setup instructions.

### 1. Prerequisites
Ensure you have the following installed on your system:
- **PHP**: `v8.2` or later
- **Composer**: `v2.x`
- **Node.js**: `v20.x` or later (with `npm`)
- **Git**
- **SQLite / MySQL Server**

---

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy the environment configuration file:
   ```bash
   cp .env.example .env
   ```
4. Generate the application key:
   ```bash
   php artisan key:generate
   ```
5. Set up your database in `.env`. By default, it will use SQLite. If using SQLite, create an empty file:
   ```bash
   touch database/database.sqlite
   ```
   If using MySQL, update the environment variables:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=transitops
   DB_USERNAME=root
   DB_PASSWORD=
   ```
6. Clear any config cache and run database migrations with seeding:
   ```bash
   php artisan config:clear
   php artisan migrate:fresh --seed
   ```
7. Start the local Laravel development server:
   ```bash
   php artisan serve
   ```
   The backend API will run on `http://127.0.0.1:8000`.

---

### 3. Frontend Setup
1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Copy the environment configuration file:
   ```bash
   cp .env.local.example .env.local
   ```
4. Verify your `.env.local` contains the correct API endpoint pointing to your backend:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```
5. Run the local development server:
   ```bash
   npm run dev
   ```
   The Next.js client will run on `http://localhost:3000`.

---

## Role-Based Seeding & Authentication

The database seeder provisions standard role profiles with specific dashboard controls and page permissions. Use these credentials to log in:

| Role | Username | Password | Permissions & Functions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@transitops.com` | `password` | Has unrestricted access to all modules, settings, and reports. |
| **Dispatcher** | `dispatcher@transitops.com` | `password` | Manages and monitors active dispatches, trips, and routing logs. |
| **Fleet Manager** | `fleetmanager@transitops.com` | `password` | Oversees vehicles, physical assets, maintenance bookings, and workshop statuses. |
| **Safety Officer** | `safety@transitops.com` | `password` | Approves driver schedules, checks licenses, updates safety scores, and audits driver profiles. |

---

## End-to-End API Flow Testing

We have built an automated Python test script to verify the integrity of the Laravel API routes (Authentication, Resource creation, state transition, and analytics).

To run the automated tests:
1. Ensure the backend Laravel server is running at `http://127.0.0.1:8000`.
2. Navigate to the `frontend/` directory and execute:
   ```bash
   python3 scratch/test_api_flow.py
   ```
This script validates:
- API Health Status
- Sanctum Auth Bearer Token Login
- `/me` Auth check
- Real-time Dashboard statistics
- Vehicle & Driver Creation
- Trip Drafting, Dispatching, Completion
- Fuel Logging & Expense Auditing
- Maintenance Scheduling, Starting, Completing
- Comprehensive Fleet Report generation
