<?php

namespace App\Http\Requests\Maintenance;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => 'required|exists:vehicles,id',

            'maintenance_type' => 'required|in:preventive,corrective,inspection,emergency',

            'title' => 'required|string|max:255',

            'description' => 'nullable|string',

            'cost' => 'required|numeric|min:0',

            'start_date' => 'required|date',

            'status' => 'required|in:scheduled',

            'remarks' => 'nullable|string',
        ];
    }
}
