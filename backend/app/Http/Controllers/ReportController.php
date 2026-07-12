<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function vehicleReport(Request $request): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->vehicleReport($request->all()));
    }

    public function driverReport(Request $request): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->driverReport($request->all()));
    }

    public function tripReport(Request $request): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->tripReport($request->all()));
    }

    public function fuelReport(Request $request): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->fuelReport($request->all()));
    }

    public function expenseReport(Request $request): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->expenseReport($request->all()));
    }

    public function maintenanceReport(Request $request): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->maintenanceReport($request->all()));
    }

    public function financialReport(): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->financialReport());
    }

    public function performanceReport(): JsonResponse
    {
        return $this->reportResponse(fn () => $this->reportService->performanceReport());
    }

    private function reportResponse(callable $callback): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Report generated successfully',
                'data' => $callback(),
            ]);
        } catch (Throwable) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to generate report',
            ], 500);
        }
    }
}
