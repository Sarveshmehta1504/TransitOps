<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VehicleService
{
	public function __construct(private readonly Vehicle $vehicle)
	{
	}

	/**
	 * Create a new vehicle record.
	 *
	 * @param array<string, mixed> $data
	 * @return Vehicle
	 *
	 * @throws BusinessRuleException
	 */
	public function create(array $data): Vehicle
	{
		return DB::transaction(function () use ($data): Vehicle {
			$this->ensureRegistrationNumberIsUnique($data['registration_number']);

			$vehicle = $this->vehicle->newInstance();
			$vehicle->fill($data);

			if (! array_key_exists('status', $data) || $vehicle->status === null) {
				$vehicle->status = Vehicle::STATUS_AVAILABLE;
			}

			$vehicle->save();

			return $vehicle->refresh();
		});
	}

	/**
	 * Update an existing vehicle record.
	 *
	 * @param array<string, mixed> $data
	 * @return Vehicle
	 *
	 * @throws BusinessRuleException
	 */
	public function update(Vehicle $vehicle, array $data): Vehicle
	{
		return DB::transaction(function () use ($vehicle, $data): Vehicle {
			if (array_key_exists('registration_number', $data)
				&& $data['registration_number'] !== $vehicle->registration_number
			) {
				$this->ensureRegistrationNumberIsUnique($data['registration_number'], $vehicle->getKey());
			}

			if ($vehicle->status === Vehicle::STATUS_RETIRED && array_key_exists('status', $data)) {
				$this->ensureRetiredVehicleCannotChangeToAvailable((string) $data['status']);
			}

			$vehicle->fill($data);
			$vehicle->save();

			return $vehicle->refresh();
		});
	}

	/**
	 * Delete a vehicle record.
	 *
	 * @return bool
	 */
	public function delete(Vehicle $vehicle): bool
	{
		return DB::transaction(static fn (): bool => (bool) $vehicle->delete());
	}

	/**
	 * Retire a vehicle from active service.
	 *
	 * @return Vehicle
	 *
	 * @throws BusinessRuleException
	 */
	public function retire(Vehicle $vehicle): Vehicle
	{
		return DB::transaction(function () use ($vehicle): Vehicle {
			if ($vehicle->status === Vehicle::STATUS_RETIRED) {
				throw new BusinessRuleException('This vehicle is already retired.');
			}

			$vehicle->status = Vehicle::STATUS_RETIRED;
			$vehicle->save();

			return $vehicle->refresh();
		});
	}

	/**
	 * Update the vehicle odometer reading.
	 *
	 * @throws BusinessRuleException
	 */
	public function updateOdometer(Vehicle $vehicle, float $reading): Vehicle
	{
		return DB::transaction(function () use ($vehicle, $reading): Vehicle {
			if ($reading < (float) $vehicle->odometer) {
				throw new BusinessRuleException('Odometer reading cannot decrease.');
			}

			$vehicle->odometer = $reading;
			$vehicle->save();

			return $vehicle->refresh();
		});
	}

	/**
	 * Ensure the vehicle may be assigned to a trip.
	 *
	 * @throws BusinessRuleException
	 */
	public function assertAssignableToTrip(Vehicle $vehicle): void
	{
		if ($vehicle->status === Vehicle::STATUS_RETIRED) {
			throw new BusinessRuleException('Retired vehicles cannot be assigned to trips.');
		}

		if ($vehicle->status === Vehicle::STATUS_IN_SHOP) {
			throw new BusinessRuleException('In-shop vehicles cannot be assigned to trips.');
		}
	}

	/**
	 * Get all vehicles currently available for assignment.
	 *
	 * @return Collection<int, Vehicle>
	 */
	public function getAvailableVehicles(): Collection
	{
		return $this->vehicle->newQuery()
			->where('status', Vehicle::STATUS_AVAILABLE)
			->orderBy('registration_number')
			->get();
	}

	/**
	 * Ensure a registration number is unique across vehicles.
	 *
	 * @param mixed $registrationNumber
	 * @throws BusinessRuleException
	 */
	private function ensureRegistrationNumberIsUnique(mixed $registrationNumber, mixed $ignoreId = null): void
	{
		$query = $this->vehicle->newQuery()->where('registration_number', $registrationNumber);

		if ($ignoreId !== null) {
			$query->whereKeyNot($ignoreId);
		}

		if ($query->exists()) {
			throw new BusinessRuleException('Registration number must be unique.');
		}
	}

	/**
	 * Prevent a retired vehicle from being returned to service.
	 *
	 * @throws BusinessRuleException
	 */
	private function ensureRetiredVehicleCannotChangeToAvailable(string $status): void
	{
		if ($status === Vehicle::STATUS_AVAILABLE) {
			throw new BusinessRuleException('Retired vehicles cannot become available again.');
		}
	}
}
