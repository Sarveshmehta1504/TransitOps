<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_ON_TRIP = 'on_trip';
    public const STATUS_IN_SHOP = 'in_shop';
    public const STATUS_RETIRED = 'retired';

    protected $fillable = [
        'registration_number',
        'name',
        'type',
        'max_load_capacity',
        'odometer',
        'acquisition_cost',
        'status',
    ];

    protected $casts = [
        'max_load_capacity' => 'decimal:2',
        'odometer' => 'decimal:2',
        'acquisition_cost' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // One vehicle can have many trips
    public function trips() : HasMany
    {
        return $this->hasMany(Trip::class);
    }

    // One vehicle can have many maintenance records
    public function maintenanceLogs() : HasMany
    {
        return $this->hasMany(MaintenanceLog::class)->latest();
    }

    // One vehicle can have many fuel logs
    public function fuelLogs() : HasMany
    {
        return $this->hasMany(FuelLog::class)->latest();
    }

    // One vehicle can have many expenses
    public function expenses() : HasMany
    {
        return $this->hasMany(Expense::class)->latest();
    }
}
