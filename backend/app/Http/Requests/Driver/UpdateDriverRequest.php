<?php

namespace App\Http\Requests\Driver;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $driverId = $this->route('driver')->id;

        return [
            'name' => 'required|string|max:255',
            Rule::unique('drivers','license_number')->ignore($driverId),
            'license_category' => 'required|string|max:50',
            'license_expiry' => 'required|date',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|email|unique:drivers,email,' . $driverId,
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'nullable|date|after_or_equal:date_of_birth',
            'safety_score' => 'nullable|integer|min:0|max:100',
            'status' => 'required|in:available,on_trip,off_duty,suspended',
        ];
    }
}
