<?php

namespace App\Http\Requests\Driver;

use Illuminate\Foundation\Http\FormRequest;

class StoreDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'license_number' => 'required|string|max:255|unique:drivers,license_number',
            'license_category' => 'required|string|max:50',
            'license_expiry' => 'required|date',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'nullable|date',
            'safety_score' => 'nullable|integer|min:0|max:100',
            'status' => 'required|in:available,on_trip,off_duty,suspended',
        ];
    }
}