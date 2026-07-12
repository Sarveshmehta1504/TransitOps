<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    use HasFactory;

    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'vehicle_id',
        'maintenance_type',
        'title',
        'description',
        'cost',
        'start_date',
        'end_date',
        'status',
        'remarks',
    ];

    protected $casts = [
        'cost'              => 'decimal:2',
        'start_date'        => 'date',
        'end_date'          => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Each maintenance record belongs to one vehicle
    public function vehicle() : BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
