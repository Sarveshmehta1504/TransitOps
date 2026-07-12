<?php

namespace App\Http\Requests\Maintenance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMaintenanceRequest extends FormRequest
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

            'service_provider' => 'nullable|string|max:255',

            'cost' => 'required|numeric|min:0',

            'start_date' => 'required|date',

            'end_date' => 'nullable|date|after_or_equal:start_date',

            'status' => 'required|in:scheduled,in_progress,completed,cancelled',

            'remarks' => 'nullable|string',
        ];
    }
}
