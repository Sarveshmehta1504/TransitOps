<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exceptions\BusinessRuleException;
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
                'status' => 200,
                'message' => 'Dashboard data retrieved successfully',
                'data' => $this->dashboardService->getDashboardData(),
            ], 200);
        } catch (BusinessRuleException) {
            return response()->json([
                'success' => false,
                'status' => 403,
                'message' => 'Unable to load dashboard data.',
            ], 403);
        } catch (Throwable) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Unable to load dashboard data.',
            ], 500);
        }
    }
}
