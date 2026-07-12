<?php

namespace App\Http\Requests\Trip;

use Illuminate\Foundation\Http\FormRequest;

class StoreTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:drivers,id',

            'source' => 'required|string|max:255',
            'destination' => 'required|string|max:255',

            'cargo_weight' => 'required|numeric|min:0',

            'planned_distance' => 'required|numeric|min:0',
            'starting_odometer' => 'required|numeric|min:0',

            'remarks' => 'nullable|string',
        ];
    }
}
