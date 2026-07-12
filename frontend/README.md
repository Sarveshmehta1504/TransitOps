# TransitOps Frontend

Next.js client for the TransitOps fleet operations platform.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)

## Prerequisites

- **Node.js**: `v20.x` or later recommended
- **Package Manager**: npm
- **Backend**: The Laravel backend must be running separately on its own port (default: `http://127.0.0.1:8000`).

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and set up your variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the local development server:
   ```bash
   npm run dev
   ```
   The client will be running at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The fully qualified base URL of the Laravel backend API. | `http://127.0.0.1:8000/api` |

## Folder Structure

```
frontend/
├── src/
│   ├── app/                 # Routes & pages (Next.js App Router)
│   ├── components/          # Shared, reusable UI components (placeholder)
│   ├── lib/
│   │   └── api.ts           # Central typed fetch client wrapper
│   ├── hooks/               # Custom React hooks (placeholder)
│   └── types/               # Shared TypeScript type definitions (placeholder)
├── public/                  # Static assets
├── .env.local.example       # Template environment variables
├── next.config.ts           # Next.js configurations
├── tailwind.config.ts       # Tailwind CSS configurations
├── tsconfig.json            # TypeScript configurations
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

## Backend Dependency

This frontend is designed to interact with the Laravel API running at the address configured in `NEXT_PUBLIC_API_URL`. It does not include or spin up the backend server. For instructions on running the Laravel server, database configuration, and migrations, please refer to the [backend README](file:///Volumes/Sarvesh%20SSD/code/TransitOps/backend/README.md).

### Expected Health Route in Laravel
The home page queries a `/health` endpoint to verify connection status. If you haven't done so already, add this route in your Laravel backend's `routes/api.php` file:

```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'message' => 'TransitOps Laravel API is responsive.'
    ]);
});
```

### CORS Setup
Ensure the Laravel backend's CORS configuration (usually in `config/cors.php` or `sanctum.php` depending on version) allows requests from the frontend origin `http://localhost:3000`.

## Scripts

- `npm run dev`: Runs the development server on `http://localhost:3000`.
- `npm run build`: Compiles the Next.js production build.
- `npm run start`: Starts the production build server.
- `npm run lint`: Runs ESLint checks.

## Status

This project is a clean frontend scaffold stage. Real feature screens (vehicles, drivers, trips, maintenance, fuel, and reports) will be added incrementally in upcoming milestones.
