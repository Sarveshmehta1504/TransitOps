<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    public const TYPE_TOLL = 'toll';
    public const TYPE_PARKING = 'parking';
    public const TYPE_INSURANCE = 'insurance';
    public const TYPE_REGISTRATION = 'registration';
    public const TYPE_DRIVER_ALLOWANCE = 'driver_allowance';
    public const TYPE_FINE = 'fine';
    public const TYPE_TAX = 'tax';
    public const TYPE_MISC = 'miscellaneous';

    public const PAYMENT_CASH = 'cash';
    public const PAYMENT_CARD = 'card';
    public const PAYMENT_UPI = 'upi';
    public const PAYMENT_BANK = 'bank_transfer';

    protected $fillable = [
        'vehicle_id',
        'trip_id',
        'expense_type',
        'title',
        'amount',
        'expense_date',
        'paid_by',
        'payment_method',
        'receipt_number',
        'remarks',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'expense_date' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Each expense belongs to one vehicle
    public function vehicle() : BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    // Expense may belong to a trip
    public function trip() : BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}
