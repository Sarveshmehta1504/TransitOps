<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Driver;
use App\Models\Expense;
use App\Models\FuelLog;
use App\Models\MaintenanceLog;
use App\Models\Trip;
use App\Models\Vehicle;

class DashboardService
{
    public function getDashboardData(): array
    {
        return [
            'vehicles' => $this->getVehicleStatistics(),
            'drivers' => $this->getDriverStatistics(),
            'trips' => $this->getTripStatistics(),
            'financials' => $this->getFinancialStatistics(),

            'recent_trips' => $this->getRecentTrips(),

            'recent_expenses' => $this->getRecentExpenses(),

            'recent_fuel_logs' => $this->getRecentFuelLogs(),

            'recent_maintenance' => $this->getRecentMaintenance(),

            'monthly_expenses' => $this->getMonthlyExpenseChart(),

            'monthly_fuel' => $this->getMonthlyFuelChart(),

            'top_vehicles' => $this->getTopVehiclesByDistance(),

            'top_drivers' => $this->getTopDriversByTrips(),
        ];
    }

    public function getVehicleStatistics(): array
    {
        return [

            'total' => Vehicle::count(),

            'available' => Vehicle::where('status', Vehicle::STATUS_AVAILABLE)
                ->count(),

            'on_trip' => Vehicle::where('status', Vehicle::STATUS_ON_TRIP)
                ->count(),

            'in_shop' => Vehicle::where('status', Vehicle::STATUS_IN_SHOP)
                ->count(),

            'retired' => Vehicle::where('status', Vehicle::STATUS_RETIRED)
                ->count(),
        ];
    }

    public function getDriverStatistics(): array
    {
        return [

            'total' => Driver::count(),

            'available' => Driver::where('status', Driver::STATUS_AVAILABLE)
                ->count(),

            'on_trip' => Driver::where('status', Driver::STATUS_ON_TRIP)
                ->count(),

            'off_duty' => Driver::where('status', Driver::STATUS_OFF_DUTY)
                ->count(),

            'suspended' => Driver::where('status', Driver::STATUS_SUSPENDED)
                ->count(),
        ];
    }

    public function getTripStatistics(): array
    {
        return [

            'total' => Trip::count(),

            'draft' => Trip::where('status', Trip::STATUS_DRAFT)
                ->count(),

            'dispatched' => Trip::where('status', Trip::STATUS_DISPATCHED)
                ->count(),

            'completed' => Trip::where('status', Trip::STATUS_COMPLETED)
                ->count(),

            'cancelled' => Trip::where('status', Trip::STATUS_CANCELLED)
                ->count(),
        ];
    }

    public function getFinancialStatistics(): array
    {
        $fuel = Trip::sum('fuel_cost');

        $expense = Trip::sum('expense_cost');

        $maintenance = MaintenanceLog::sum('cost');

        return [

            'fuel_cost' => round($fuel,2),

            'expense_cost' => round($expense,2),

            'maintenance_cost' => round($maintenance,2),

            'total_cost' => round(
                $fuel + $expense + $maintenance,
                2
            ),
        ];
    }

    public function getRecentTrips(int $limit = 10)
    {
        return Trip::newQuery()
            ->with([
                'vehicle',
                'driver',
            ])
            ->latest()
            ->take($limit)
            ->get();
    }

    public function getRecentExpenses(int $limit = 10)
    {
        return Expense::newQuery()
            ->with([
                'vehicle',
                'trip',
            ])
            ->latest('expense_date')
            ->take($limit)
            ->get();
    }

    public function getRecentFuelLogs(int $limit = 10)
    {
        return FuelLog::newQuery()
            ->with([
                'vehicle',
                'trip',
            ])
            ->latest('fuel_date')
            ->take($limit)
            ->get();
    }

    public function getRecentMaintenance(int $limit = 10)
    {
        return MaintenanceLog::newQuery()
            ->with('vehicle')
            ->latest()
            ->take($limit)
            ->get();
    }

    public function getMonthlyExpenseChart()
    {
        return Expense::newQuery()
            ->selectRaw('MONTH(expense_date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    public function getMonthlyFuelChart()
    {
        return FuelLog::newQuery()
            ->selectRaw('MONTH(fuel_date) as month, SUM(total_cost) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    public function getTopVehiclesByDistance(int $limit = 5)
    {
        return Vehicle::newQuery()
            ->withSum('trips', 'actual_distance')
            ->orderByDesc('trips_sum_actual_distance')
            ->take($limit)
            ->get();
    }

    public function getTopDriversByTrips(int $limit = 5)
    {
        return Driver::newQuery()
            ->withCount([
                'trips as completed_trips' => function ($query) {
                    $query->where('status', Trip::STATUS_COMPLETED);
                }
            ])
            ->orderByDesc('completed_trips')
            ->take($limit)
            ->get();
    }
}
