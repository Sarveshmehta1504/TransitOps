<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FuelLogController;
use App\Http\Controllers\MaintenanceLogController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'message' => 'TransitOps Laravel API is responsive.',
    ]);
});

Route::post('/login');
Route::get('/dashboard', [DashboardController::class, 'index']);

// Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('vehicles', VehicleController::class);

    Route::apiResource('drivers', DriverController::class);

    Route::apiResource('trips', TripController::class);

    Route::apiResource('maintenance', MaintenanceLogController::class);

    Route::apiResource('fuel-logs', FuelLogController::class);

    Route::apiResource('expenses', ExpenseController::class);

// });
