<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'license_number' => $this->license_number,
            'license_category' => $this->license_category,
            'license_expiry' => $this->license_expiry,
            'contact_number' => $this->contact_number,
            'email' => $this->email,
            'address' => $this->address,
            'date_of_birth' => $this->date_of_birth,
            'joining_date' => $this->joining_date,
            'safety_score' => $this->safety_score,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}