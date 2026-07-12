<?php

namespace App\Http\Requests\FuelLog;

use Illuminate\Foundation\Http\FormRequest;

class StoreFuelLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => 'required|exists:vehicles,id',

            'trip_id' => 'nullable|exists:trips,id',
            
            'quantity' => 'required|numeric|min:0.01',

            'price_per_liter' => 'required|numeric|min:0',

            'odometer_reading' => 'required|numeric|min:0',

            'fuel_date' => 'required|date',

            'remarks' => 'nullable|string',
        ];
    }
}