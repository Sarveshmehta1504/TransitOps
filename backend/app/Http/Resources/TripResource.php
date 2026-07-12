<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
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
            'driver_id' => $this->driver_id,
            'trip_number' => $this->trip_number,
            'source' => $this->source,
            'destination' => $this->destination,
            'cargo_weight' => $this->cargo_weight,
            'planned_distance' => $this->planned_distance,
            'actual_distance' => $this->actual_distance,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'fuel_consumed' => $this->fuel_consumed,
            'starting_odometer' => $this->starting_odometer,
            'ending_odometer' => $this->ending_odometer,
            'status' => $this->status,
            'remarks' => $this->remarks,
            'vehicle' => $this->whenLoaded('vehicle'),
            'driver' => $this->whenLoaded('driver'),
            'fuel_logs' => $this->whenLoaded('fuelLogs'),
            'expenses' => $this->whenLoaded('expenses'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}