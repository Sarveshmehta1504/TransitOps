<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_DISPATCHED = 'dispatched';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'trip_number',
        'source',
        'destination',
        'cargo_weight',
        'planned_distance',
        'actual_distance',
        'start_time',
        'end_time',
        'fuel_consumed',
        'starting_odometer',
        'ending_odometer',
        'status',
        'remarks',
    ];

    protected $casts = [
        'cargo_weight'      => 'decimal:2',
        'planned_distance'  => 'decimal:2',
        'actual_distance'   => 'decimal:2',
        'fuel_consumed'     => 'decimal:2',
        'starting_odometer' => 'decimal:2',
        'ending_odometer'   => 'decimal:2',
        'start_time'        => 'immutable_datetime',
        'end_time'          => 'immutable_datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Each trip belongs to one vehicle
    public function vehicle() : BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    // Each trip belongs to one driver
    public function driver() : BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    // A trip can have many fuel logs
    public function fuelLogs() : HasMany
    {
        return $this->hasMany(FuelLog::class);
    }

    // A trip can have many expenses
    public function expenses() : HasMany
    {
        return $this->hasMany(Expense::class);
    }
}
