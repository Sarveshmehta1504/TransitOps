<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'trip_id',
        'quantity',
        'price_per_liter',
        'total_cost',
        'odometer_reading',
        'fuel_date',
        'remarks',
    ];

    protected $casts = [
        'quantity'          => 'decimal:2',
        'price_per_liter'   => 'decimal:2',
        'total_cost'        => 'decimal:2',
        'odometer_reading'  => 'decimal:2',
        'fuel_date'         => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Each fuel log belongs to one vehicle
    public function vehicle() : BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    // A fuel log may belong to a trip
    public function trip() : BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}
