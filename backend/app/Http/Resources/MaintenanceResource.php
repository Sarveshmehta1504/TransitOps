<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceResource extends JsonResource
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
            'vehicle_id' => $this->vehicle_id,
            'maintenance_type' => $this->maintenance_type,
            'title' => $this->title,
            'description' => $this->description,
            'cost' => $this->cost,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'remarks' => $this->remarks,
            'vehicle' => $this->whenLoaded('vehicle'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}