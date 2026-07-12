<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\FuelLog;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class FuelLogService
{
	public function __construct(
		private readonly FuelLog $fuelLog,
		private readonly Vehicle $vehicle,
		private readonly Trip $trip,
	) {
	}

	/**
	 * Create a new fuel log and update the vehicle odometer when required.
	 *
	 * @param array<string, mixed> $data
	 * @return FuelLog
	 *
	 * @throws BusinessRuleException
	 */
	public function create(array $data): FuelLog
	{
		return DB::transaction(function () use ($data): FuelLog {
			$vehicle = $this->resolveVehicle($data['vehicle_id'] ?? null);
			$trip = $this->resolveTrip($data['trip_id'] ?? null);

            if ($trip !== null && $trip->vehicle_id !== $vehicle->id) {
                throw new BusinessRuleException(
                    'The selected trip does not belong to the selected vehicle.'
                );
            }

			$quantity = $this->requirePositiveFloat($data['quantity'] ?? null, 'Quantity must be greater than 0.');
			$pricePerLiter = $this->requirePositiveFloat($data['price_per_liter'] ?? null, 'Price per liter must be greater than 0.');
			$odometerReading = $this->requireNumericFloat($data['odometer_reading'] ?? null, 'Odometer reading is required.');

			$this->ensureOdometerIsNotLowerThanVehicle($vehicle, $odometerReading);

			$fuelLog = $this->fuelLog->newInstance();
			$fuelLog->fill($data);
			$fuelLog->vehicle()->associate($vehicle);

			if ($trip !== null) {
				$fuelLog->trip()->associate($trip);
			}

			$fuelLog->quantity = $quantity;
			$fuelLog->price_per_liter = $pricePerLiter;
			$fuelLog->total_cost = $this->calculateTotalCost($quantity, $pricePerLiter);
			$fuelLog->odometer_reading = $odometerReading;
			$fuelLog->save();

			$this->updateVehicleOdometerIfHigher($vehicle, $odometerReading);

			return $fuelLog
                ->refresh()
                ->load([
                    'vehicle',
                    'trip',
                ]);
		});
	}

	/**
	 * Update an existing fuel log and synchronize vehicle odometer state.
	 *
	 * @param array<string, mixed> $data
	 * @return FuelLog
	 *
	 * @throws BusinessRuleException
	 */
	public function update(FuelLog $fuelLog, array $data): FuelLog
	{
		return DB::transaction(function () use ($fuelLog, $data): FuelLog {
			$vehicle = $this->resolveVehicle($data['vehicle_id'] ?? $fuelLog->vehicle_id);
			$trip = $this->resolveTrip($data['trip_id'] ?? $fuelLog->trip_id);

            if ($trip !== null && $trip->vehicle_id !== $vehicle->id) {
                throw new BusinessRuleException(
                    'The selected trip does not belong to the selected vehicle.'
                );
            }

			$quantity = $this->requirePositiveFloat($data['quantity'] ?? $fuelLog->quantity, 'Quantity must be greater than 0.');
			$pricePerLiter = $this->requirePositiveFloat($data['price_per_liter'] ?? $fuelLog->price_per_liter, 'Price per liter must be greater than 0.');
			$odometerReading = $this->requireNumericFloat($data['odometer_reading'] ?? $fuelLog->odometer_reading, 'Odometer reading is required.');

			$this->ensureOdometerIsNotLowerThanVehicle($vehicle, $odometerReading);

			$fuelLog->fill($data);
			$fuelLog->vehicle()->associate($vehicle);

			if ($trip !== null) {
				$fuelLog->trip()->associate($trip);
			} else {
				$fuelLog->trip()->dissociate();
			}

			$fuelLog->quantity = $quantity;
			$fuelLog->price_per_liter = $pricePerLiter;
			$fuelLog->total_cost = $this->calculateTotalCost($quantity, $pricePerLiter);
			$fuelLog->odometer_reading = $odometerReading;
			$fuelLog->save();

			$this->updateVehicleOdometerIfHigher($vehicle, $odometerReading);

			return $fuelLog
                ->refresh()
                ->load([
                    'vehicle',
                    'trip',
                ]);
		});
	}

	/**
	 * Delete a fuel log.
	 *
	 * @return bool
	 */
	public function delete(FuelLog $fuelLog): bool
	{
		return DB::transaction(static fn (): bool => (bool) $fuelLog->delete());
	}

	/**
	 * Calculate total fuel cost.
	 */
	public function calculateTotalCost(float $quantity, float $pricePerLiter): float
	{
		return round($quantity * $pricePerLiter, 2);
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
	 * Ensure the odometer reading is not below the vehicle odometer.
	 *
	 * @throws BusinessRuleException
	 */
	private function ensureOdometerIsNotLowerThanVehicle(Vehicle $vehicle, float $reading): void
	{
		if ($reading < (float) $vehicle->odometer) {
			throw new BusinessRuleException('Odometer reading cannot be lower than the vehicle odometer.');
		}
	}

	/**
	 * Update the vehicle odometer if the new reading is higher.
	 */
	private function updateVehicleOdometerIfHigher(Vehicle $vehicle, float $reading): void
	{
		if ($reading > (float) $vehicle->odometer) {
			$vehicle->odometer = $reading;
			$vehicle->save();
		}
	}

	/**
	 * Ensure a value is present and numeric.
	 *
	 * @param mixed $value
	 * @throws BusinessRuleException
	 */
	private function requireNumericFloat(mixed $value, string $message): float
	{
		if (! is_numeric($value)) {
			throw new BusinessRuleException($message);
		}

		return (float) $value;
	}

	/**
	 * Ensure a numeric value is greater than zero.
	 *
	 * @param mixed $value
	 * @throws BusinessRuleException
	 */
	private function requirePositiveFloat(mixed $value, string $message): float
	{
		$numericValue = $this->requireNumericFloat($value, $message);

		if ($numericValue <= 0) {
			throw new BusinessRuleException($message);
		}

		return $numericValue;
	}
}
