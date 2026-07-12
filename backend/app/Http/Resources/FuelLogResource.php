<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FuelLogResource extends JsonResource
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
            'trip_id' => $this->trip_id,
            'quantity' => $this->quantity,
            'price_per_liter' => $this->price_per_liter,
            'total_cost' => $this->total_cost,
            'odometer_reading' => $this->odometer_reading,
            'fuel_date' => $this->fuel_date,
            'remarks' => $this->remarks,
            'vehicle' => $this->whenLoaded('vehicle'),
            'trip' => $this->whenLoaded('trip'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}