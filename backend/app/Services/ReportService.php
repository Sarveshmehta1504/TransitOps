<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Driver;
use App\Models\Expense;
use App\Models\FuelLog;
use App\Models\MaintenanceLog;
use App\Models\Trip;
use App\Models\Vehicle;

class ReportService
{
    /*
    |--------------------------------------------------------------------------
    | Vehicle Report
    |--------------------------------------------------------------------------
    */

    public function vehicleReport(array $filters = [])
    {
        return Vehicle::query()
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['type'] ?? null, fn($q, $type) => $q->where('type', $type))
            ->latest()
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Driver Report
    |--------------------------------------------------------------------------
    */

    public function driverReport(array $filters = [])
    {
        return Driver::query()
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['license_expiry_from'] ?? null, fn($q, $date) => $q->whereDate('license_expiry', '>=', $date))
            ->when($filters['license_expiry_to'] ?? null, fn($q, $date) => $q->whereDate('license_expiry', '<=', $date))
            ->latest()
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Trip Report
    |--------------------------------------------------------------------------
    */

    public function tripReport(array $filters = [])
    {
        return Trip::query()
            ->with(['vehicle', 'driver'])

            ->when($filters['vehicle_id'] ?? null, fn($q, $id) => $q->where('vehicle_id', $id))

            ->when($filters['driver_id'] ?? null, fn($q, $id) => $q->where('driver_id', $id))

            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))

            ->when($filters['from'] ?? null, fn($q, $date) => $q->whereDate('created_at', '>=', $date))

            ->when($filters['to'] ?? null, fn($q, $date) => $q->whereDate('created_at', '<=', $date))

            ->latest()

            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Fuel Report
    |--------------------------------------------------------------------------
    */

    public function fuelReport(array $filters = [])
    {
        return FuelLog::query()
            ->with(['vehicle', 'trip'])

            ->when($filters['vehicle_id'] ?? null, fn($q, $id) => $q->where('vehicle_id', $id))

            ->when($filters['trip_id'] ?? null, fn($q, $id) => $q->where('trip_id', $id))

            ->when($filters['from'] ?? null, fn($q, $date) => $q->whereDate('fuel_date', '>=', $date))

            ->when($filters['to'] ?? null, fn($q, $date) => $q->whereDate('fuel_date', '<=', $date))

            ->latest('fuel_date')

            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Expense Report
    |--------------------------------------------------------------------------
    */

    public function expenseReport(array $filters = [])
    {
        return Expense::query()
            ->with(['vehicle', 'trip'])

            ->when($filters['vehicle_id'] ?? null, fn($q, $id) => $q->where('vehicle_id', $id))

            ->when($filters['trip_id'] ?? null, fn($q, $id) => $q->where('trip_id', $id))

            ->when($filters['expense_type'] ?? null, fn($q, $type) => $q->where('expense_type', $type))

            ->when($filters['payment_method'] ?? null, fn($q, $method) => $q->where('payment_method', $method))

            ->when($filters['from'] ?? null, fn($q, $date) => $q->whereDate('expense_date', '>=', $date))

            ->when($filters['to'] ?? null, fn($q, $date) => $q->whereDate('expense_date', '<=', $date))

            ->latest('expense_date')

            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Maintenance Report
    |--------------------------------------------------------------------------
    */

    public function maintenanceReport(array $filters = [])
    {
        return MaintenanceLog::query()
            ->with('vehicle')

            ->when($filters['vehicle_id'] ?? null, fn($q, $id) => $q->where('vehicle_id', $id))

            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))

            ->when($filters['maintenance_type'] ?? null, fn($q, $type) => $q->where('maintenance_type', $type))

            ->when($filters['from'] ?? null, fn($q, $date) => $q->whereDate('start_date', '>=', $date))

            ->when($filters['to'] ?? null, fn($q, $date) => $q->whereDate('start_date', '<=', $date))

            ->latest()

            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Financial Summary
    |--------------------------------------------------------------------------
    */

    public function financialReport(): array
    {
        $fuel = FuelLog::sum('total_cost');

        $expense = Expense::sum('amount');

        $maintenance = MaintenanceLog::sum('cost');

        return [

            'fuel_cost' => round((float)$fuel, 2),

            'expense_cost' => round((float)$expense, 2),

            'maintenance_cost' => round((float)$maintenance, 2),

            'overall_cost' => round(
                (float)$fuel + (float)$expense + (float)$maintenance,
                2
            ),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Performance Report
    |--------------------------------------------------------------------------
    */

    public function performanceReport(): array
    {
        return [

            'total_distance' => Trip::sum('actual_distance'),

            'total_fuel' => FuelLog::sum('quantity'),

            'completed_trips' => Trip::where('status', Trip::STATUS_COMPLETED)->count(),

            'average_trip_distance' => round(
                (float)(Trip::avg('actual_distance') ?? 0),
                2
            ),

            'average_fuel_consumption' => round(
                (float)(FuelLog::avg('quantity') ?? 0),
                2
            ),
        ];
    }
}
