<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Throwable;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function index(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Dashboard data retrieved successfully',
                'data' => $this->dashboardService->getDashboardData(),
            ]);
        } catch (Throwable) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to load dashboard data.',
            ], 500);
        }
    }
}
