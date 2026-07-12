<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    use HasFactory;

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_ON_TRIP = 'on_trip';
    public const STATUS_OFF_DUTY = 'off_duty';
    public const STATUS_SUSPENDED = 'suspended';

    protected $fillable = [
        'name',
        'license_number',
        'license_category',
        'license_expiry',
        'contact_number',
        'email',
        'address',
        'date_of_birth',
        'joining_date',
        'safety_score',
        'status',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'date_of_birth'  => 'date',
        'joining_date'   => 'date',
        'safety_score'   => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // A driver can complete many trips
    public function trips() : HasMany
    {
        return $this->hasMany(Trip::class)->latest();
    }
}
