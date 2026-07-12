<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FuelLogController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'message' => 'TransitOps Laravel API is responsive.',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:view dashboard');

    // Reports
    Route::prefix('reports')
        ->middleware('permission:view reports')
        ->group(function () {

            Route::get('/vehicles', [ReportController::class, 'vehicleReport']);
            Route::get('/drivers', [ReportController::class, 'driverReport']);
            Route::get('/trips', [ReportController::class, 'tripReport']);
            Route::get('/fuel', [ReportController::class, 'fuelReport']);
            Route::get('/expenses', [ReportController::class, 'expenseReport']);
            Route::get('/maintenance', [ReportController::class, 'maintenanceReport']);
            Route::get('/financial', [ReportController::class, 'financialReport']);
            Route::get('/performance', [ReportController::class, 'performanceReport']);
        });

    /*
    |--------------------------------------------------------------------------
    | Vehicles
    |--------------------------------------------------------------------------
    */

    Route::apiResource('vehicles', VehicleController::class)
        ->middleware([
            'index'   => 'permission:view vehicles',
            'show'    => 'permission:view vehicles',
            'store'   => 'permission:manage vehicles',
            'update'  => 'permission:manage vehicles',
            'destroy' => 'permission:manage vehicles',
        ]);

    Route::post('vehicles/{vehicle}/retire', [VehicleController::class, 'retire'])
        ->middleware('permission:manage vehicles');

    /*
    |--------------------------------------------------------------------------
    | Drivers
    |--------------------------------------------------------------------------
    */

    Route::apiResource('drivers', DriverController::class)
        ->middleware([
            'index'   => 'permission:view drivers',
            'show'    => 'permission:view drivers',
            'store'   => 'permission:manage drivers',
            'update'  => 'permission:manage drivers',
            'destroy' => 'permission:manage drivers',
        ]);

    Route::post('drivers/{driver}/suspend', [DriverController::class, 'suspend'])
        ->middleware('permission:manage drivers');

    Route::post('drivers/{driver}/activate', [DriverController::class, 'activate'])
        ->middleware('permission:manage drivers');

    /*
    |--------------------------------------------------------------------------
    | Trips
    |--------------------------------------------------------------------------
    */

    Route::apiResource('trips', TripController::class)
        ->middleware([
            'index'   => 'permission:view trips',
            'show'    => 'permission:view trips',
            'store'   => 'permission:manage trips',
            'update'  => 'permission:manage trips',
            'destroy' => 'permission:manage trips',
        ]);

    Route::post('trips/{trip}/dispatch', [TripController::class, 'dispatch'])
        ->middleware('permission:manage trips');

    Route::post('trips/{trip}/complete', [TripController::class, 'complete'])
        ->middleware('permission:manage trips');

    Route::post('trips/{trip}/cancel', [TripController::class, 'cancel'])
        ->middleware('permission:manage trips');

    /*
    |--------------------------------------------------------------------------
    | Maintenance
    |--------------------------------------------------------------------------
    */

    Route::apiResource('maintenance', MaintenanceController::class)
        ->middleware([
            'index'   => 'permission:view maintenance',
            'show'    => 'permission:view maintenance',
            'store'   => 'permission:manage maintenance',
            'update'  => 'permission:manage maintenance',
            'destroy' => 'permission:manage maintenance',
        ]);

    Route::post('maintenance/{maintenance}/start', [MaintenanceController::class, 'start'])
        ->middleware('permission:manage maintenance');

    Route::post('maintenance/{maintenance}/complete', [MaintenanceController::class, 'complete'])
        ->middleware('permission:manage maintenance');

    Route::post('maintenance/{maintenance}/cancel', [MaintenanceController::class, 'cancel'])
        ->middleware('permission:manage maintenance');

    /*
    |--------------------------------------------------------------------------
    | Fuel Logs
    |--------------------------------------------------------------------------
    */

    Route::apiResource('fuel-logs', FuelLogController::class)
        ->middleware([
            'index'   => 'permission:view fuel logs',
            'show'    => 'permission:view fuel logs',
            'store'   => 'permission:manage fuel logs',
            'update'  => 'permission:manage fuel logs',
            'destroy' => 'permission:manage fuel logs',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Expenses
    |--------------------------------------------------------------------------
    */

    Route::apiResource('expenses', ExpenseController::class)
        ->middleware([
            'index'   => 'permission:view expenses',
            'show'    => 'permission:view expenses',
            'store'   => 'permission:manage expenses',
            'update'  => 'permission:manage expenses',
            'destroy' => 'permission:manage expenses',
        ]);
});
