<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
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
            'expense_type' => $this->expense_type,
            'title' => $this->title,
            'amount' => $this->amount,
            'expense_date' => $this->expense_date,
            'paid_by' => $this->paid_by,
            'payment_method' => $this->payment_method,
            'receipt_number' => $this->receipt_number,
            'remarks' => $this->remarks,
            'vehicle' => $this->whenLoaded('vehicle'),
            'trip' => $this->whenLoaded('trip'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}