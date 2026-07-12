<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'registration_number' => 'required|string|max:255|unique:vehicles,registration_number',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'max_load_capacity' => 'required|numeric|min:1',
            'odometer' => 'required|numeric|min:0',
            'acquisition_cost' => 'required|numeric|min:0',
            'status' => 'required|in:available,in_shop',
        ];
    }
}
