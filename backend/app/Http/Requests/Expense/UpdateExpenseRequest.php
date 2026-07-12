<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => 'required|exists:vehicles,id',

            'trip_id' => 'nullable|exists:trips,id',

            'expense_type' => 'required|in:toll,parking,insurance,registration,driver_allowance,fine,tax,miscellaneous',

            'title' => 'required|string|max:255',

            'amount' => 'required|numeric|min:0.01',

            'expense_date' => 'required|date',

            'paid_by' => 'nullable|string|max:255',

            'payment_method' => 'nullable|in:cash,card,upi,bank_transfer',

            'receipt_number' => 'nullable|string|max:255',

            'remarks' => 'nullable|string',
        ];
    }
}
