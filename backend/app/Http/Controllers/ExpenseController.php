<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExpenseController extends Controller
{
    public function __construct(private readonly ExpenseService $expenseService)
    {
    }

    /**
     * Display a paginated listing of expenses.
     */
    public function index(): AnonymousResourceCollection
    {
        $expenses = Expense::query()
            ->with(['vehicle', 'trip'])
            ->latest()
            ->paginate(15);

        return ExpenseResource::collection($expenses);
    }

    /**
     * Display the specified expense.
     */
    public function show(Expense $expense): ExpenseResource
    {
        $expense->load(['vehicle', 'trip']);

        return new ExpenseResource($expense);
    }

    /**
     * Store a newly created expense.
     */
    public function store(StoreExpenseRequest $request): ExpenseResource
    {
        $expense = $this->expenseService->create($request->validated());
        $expense->load(['vehicle', 'trip']);

        return new ExpenseResource($expense);
    }

    /**
     * Update the specified expense.
     */
    public function update(UpdateExpenseRequest $request, Expense $expense): ExpenseResource
    {
        $expense = $this->expenseService->update($expense, $request->validated());
        $expense->load(['vehicle', 'trip']);

        return new ExpenseResource($expense);
    }

    /**
     * Remove the specified expense.
     */
    public function destroy(Expense $expense): JsonResponse
    {
        $this->expenseService->delete($expense);

        return response()->json(null, 204);
    }
}
