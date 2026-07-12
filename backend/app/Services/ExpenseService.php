<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Expense;
use App\Models\Trip;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
	public function __construct(
		private readonly Expense $expense,
		private readonly Vehicle $vehicle,
		private readonly Trip $trip,
	) {
	}

	/**
	 * Create a new expense record.
	 *
	 * @param array<string, mixed> $data
	 * @return Expense
	 *
	 * @throws BusinessRuleException
	 */
	public function create(array $data): Expense
	{
		return DB::transaction(function () use ($data): Expense {
			$vehicle = $this->resolveVehicle($data['vehicle_id'] ?? null);
			$trip = $this->resolveTrip($data['trip_id'] ?? null);
			$amount = $this->requirePositiveAmount($data['amount'] ?? null);
			$expenseDate = $this->requireValidExpenseDate($data['expense_date'] ?? null);
			$paymentMethod = $this->requireValidPaymentMethod($data['payment_method'] ?? null);

			$expense = $this->expense->newInstance();
			$expense->fill($data);
			$expense->vehicle()->associate($vehicle);

			if ($trip !== null) {
				$expense->trip()->associate($trip);
			}

			$expense->amount = $amount;
			$expense->expense_date = $expenseDate;
			$expense->payment_method = $paymentMethod;
			$expense->save();

			return $expense->refresh();
		});
	}

	/**
	 * Update an existing expense record.
	 *
	 * @param array<string, mixed> $data
	 * @return Expense
	 *
	 * @throws BusinessRuleException
	 */
	public function update(Expense $expense, array $data): Expense
	{
		return DB::transaction(function () use ($expense, $data): Expense {
			$vehicle = $this->resolveVehicle($data['vehicle_id'] ?? $expense->vehicle_id);
			$trip = $this->resolveTrip($data['trip_id'] ?? $expense->trip_id);
			$amount = $this->requirePositiveAmount($data['amount'] ?? $expense->amount);
			$expenseDate = $this->requireValidExpenseDate($data['expense_date'] ?? $expense->expense_date);
			$paymentMethod = $this->requireValidPaymentMethod($data['payment_method'] ?? $expense->payment_method);

			$expense->fill($data);
			$expense->vehicle()->associate($vehicle);

			if ($trip !== null) {
				$expense->trip()->associate($trip);
			} else {
				$expense->trip()->dissociate();
			}

			$expense->amount = $amount;
			$expense->expense_date = $expenseDate;
			$expense->payment_method = $paymentMethod;
			$expense->save();

			return $expense->refresh();
		});
	}

	/**
	 * Delete an expense record.
	 *
	 * @return bool
	 */
	public function delete(Expense $expense): bool
	{
		return DB::transaction(static fn (): bool => (bool) $expense->delete());
	}

	/**
	 * Get all expenses for a vehicle.
	 *
	 * @return Collection<int, Expense>
	 *
	 * @throws BusinessRuleException
	 */
	public function getVehicleExpenses(Vehicle $vehicle): Collection
	{
		$this->ensureVehicleExists($vehicle);

		return $this->expense->newQuery()
			->where('vehicle_id', $vehicle->getKey())
			->orderByDesc('expense_date')
			->get();
	}

	/**
	 * Get the total expenses for a vehicle.
	 *
	 * @throws BusinessRuleException
	 */
	public function getVehicleExpenseTotal(Vehicle $vehicle): float
	{
		$this->ensureVehicleExists($vehicle);

		return (float) $this->expense->newQuery()
			->where('vehicle_id', $vehicle->getKey())
			->sum('amount');
	}

	/**
	 * Resolve a vehicle by id.
	 *
	 * @param mixed $vehicleId
	 * @throws BusinessRuleException
	 */
	private function resolveVehicle(mixed $vehicleId): Vehicle
	{
		if ($vehicleId === null || $vehicleId === '') {
			throw new BusinessRuleException('Vehicle must exist.');
		}

		$vehicle = $this->vehicle->newQuery()->find($vehicleId);

		if ($vehicle === null) {
			throw new BusinessRuleException('Vehicle must exist.');
		}

		return $vehicle;
	}

	/**
	 * Resolve a trip by id when provided.
	 *
	 * @param mixed $tripId
	 * @throws BusinessRuleException
	 */
	private function resolveTrip(mixed $tripId): ?Trip
	{
		if ($tripId === null || $tripId === '') {
			return null;
		}

		$trip = $this->trip->newQuery()->find($tripId);

		if ($trip === null) {
			throw new BusinessRuleException('Trip must exist when provided.');
		}

		return $trip;
	}

	/**
	 * Ensure the amount is positive.
	 *
	 * @param mixed $amount
	 * @throws BusinessRuleException
	 */
	private function requirePositiveAmount(mixed $amount): float
	{
		if (! is_numeric($amount)) {
			throw new BusinessRuleException('Amount must be positive.');
		}

		$value = (float) $amount;

		if ($value <= 0) {
			throw new BusinessRuleException('Amount must be positive.');
		}

		return $value;
	}

	/**
	 * Ensure the expense date is valid and not in the future.
	 *
	 * @param mixed $expenseDate
	 * @throws BusinessRuleException
	 */
	private function requireValidExpenseDate(mixed $expenseDate): Carbon
	{
		if ($expenseDate === null || $expenseDate === '') {
			throw new BusinessRuleException('Expense date is required.');
		}

		try {
			$date = Carbon::parse($expenseDate);
		} catch (\Throwable) {
			throw new BusinessRuleException('Expense date must be a valid date.');
		}

		if ($date->isAfter(Carbon::now())) {
			throw new BusinessRuleException('Expense date cannot be a future date.');
		}

		return $date;
	}

	/**
	 * Ensure the payment method is valid.
	 *
	 * @param mixed $paymentMethod
	 * @throws BusinessRuleException
	 */
	private function requireValidPaymentMethod(mixed $paymentMethod): string
	{
		$validMethods = [
			Expense::PAYMENT_CASH,
			Expense::PAYMENT_CARD,
			Expense::PAYMENT_UPI,
			Expense::PAYMENT_BANK,
		];

		if (! is_string($paymentMethod) || ! in_array($paymentMethod, $validMethods, true)) {
			throw new BusinessRuleException('Payment method must be valid.');
		}

		return $paymentMethod;
	}

	/**
	 * Ensure a vehicle model is present.
	 *
	 * @throws BusinessRuleException
	 */
	private function ensureVehicleExists(Vehicle $vehicle): void
	{
		if (! $vehicle->exists) {
			throw new BusinessRuleException('Vehicle must exist.');
		}
	}
}
