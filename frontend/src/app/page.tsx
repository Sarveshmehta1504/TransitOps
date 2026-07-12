import { apiGet } from "@/lib/api";

type HealthResponse = {
  status: string;
  timestamp: string;
  message?: string;
  [key: string]: unknown;
};

export default async function Home() {
  let connectionStatus: "success" | "error" = "success";
  let responseData: HealthResponse | null = null;
  let errorMessage: string | null = null;

  try {
    responseData = await apiGet<HealthResponse>("/health");
  } catch (error: unknown) {
    connectionStatus = "error";
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">
              T
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              TransitOps
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 border border-slate-800 px-3 py-1 rounded-full bg-slate-900/50">
              Scaffold Stage
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full flex flex-col justify-center relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Smart Transport Operations Platform
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Frontend scaffold is up and running. Below is the live connection test to confirm communication with your Laravel backend.
          </p>
        </div>

        {/* Connection status section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Target Backend API
              </p>
              <code className="text-blue-400 font-mono text-sm break-all">
                {apiUrl}
              </code>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 self-start md:self-auto">
              <span className="text-sm font-medium">Status:</span>
              {connectionStatus === "success" ? (
                <div className="flex items-center text-emerald-400 font-semibold space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-rose-400 font-semibold space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                  <span>Disconnected</span>
                </div>
              )}
            </div>
          </div>

          {connectionStatus === "success" && responseData ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm">
                Successfully connected to the Laravel backend and retrieved health status.
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Raw Response
                </p>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400/90 leading-relaxed shadow-inner">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm leading-relaxed">
                Could not connect to the backend. Error details: <code className="text-rose-200 font-mono text-xs font-semibold bg-rose-950/40 px-1 py-0.5 rounded">{errorMessage}</code>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  How to resolve:
                </h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mr-3 mt-0.5 shrink-0">1</span>
                    <span>
                      Make sure your Laravel server is running at <code className="text-slate-200 font-mono text-xs bg-slate-950 px-1.5 py-0.5 rounded">http://127.0.0.1:8000</code> or your target port.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mr-3 mt-0.5 shrink-0">2</span>
                    <span>
                      If you have not enabled API routes in Laravel 11, run <code className="text-slate-200 font-mono text-xs bg-slate-950 px-1.5 py-0.5 rounded">php artisan install:api</code> inside the <code className="text-slate-300">backend/</code> folder.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mr-3 mt-0.5 shrink-0">3</span>
                    <span>
                      Add the health endpoint inside the backend&apos;s <code className="text-slate-300">routes/api.php</code> file:
                      <pre className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto select-all">
{`Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'message' => 'TransitOps Laravel API is responsive.'
    ]);
});`}
                      </pre>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mr-3 mt-0.5 shrink-0">4</span>
                    <span>
                      Ensure CORS is configured in the backend&apos;s <code className="text-slate-300">config/cors.php</code> or middleware to allow requests from the Next.js frontend origin <code className="text-slate-200 font-mono text-xs bg-slate-950 px-1.5 py-0.5 rounded">http://localhost:3000</code>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 mt-auto">
        <p>&copy; {new Date().getFullYear()} TransitOps Platform. Built with Next.js & Tailwind CSS.</p>
      </footer>
    </div>
  );
}
