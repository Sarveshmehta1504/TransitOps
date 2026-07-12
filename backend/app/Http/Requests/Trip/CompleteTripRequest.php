<?php

namespace App\Http\Requests\Trip;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompleteTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actual_distance' => 'required|numeric|min:0',

            'fuel_consumed' => 'required|numeric|min:0.01',

            'ending_odometer' => 'required|numeric|min:0',

            'remarks' => 'nullable|string',
        ];
    }
}