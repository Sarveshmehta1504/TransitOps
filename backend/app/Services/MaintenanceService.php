<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class MaintenanceService
{
	public function __construct(
		private readonly MaintenanceLog $maintenanceLog,
		private readonly Vehicle $vehicle,
	) {
	}

	/**
	 * Create a new maintenance record and move the vehicle into the shop.
	 *
	 * @param array<string, mixed> $data
	 * @return MaintenanceLog
	 *
	 * @throws BusinessRuleException
	 */
	public function create(array $data): MaintenanceLog
	{
		return DB::transaction(function () use ($data): MaintenanceLog {
			$vehicle = $this->resolveVehicle($data['vehicle_id'] ?? null);
			$this->ensureVehicleCanEnterMaintenance($vehicle);
			$this->ensureNoActiveMaintenanceExists($vehicle->getKey());

			$maintenance = $this->maintenanceLog->newInstance();
			$maintenance->fill($data);
			$maintenance->status = MaintenanceLog::STATUS_SCHEDULED;
			$maintenance->vehicle()->associate($vehicle);
			$maintenance->save();

			$vehicle->status = Vehicle::STATUS_IN_SHOP;
			$vehicle->save();

			return $maintenance->refresh();
		});
	}

	/**
	 * Update an existing maintenance record.
	 *
	 * @param array<string, mixed> $data
	 * @return MaintenanceLog
	 *
	 * @throws BusinessRuleException
	 */
	public function update(MaintenanceLog $maintenance, array $data): MaintenanceLog
	{
		return DB::transaction(function () use ($maintenance, $data): MaintenanceLog {
			if (array_key_exists('vehicle_id', $data) && (int) $data['vehicle_id'] !== (int) $maintenance->vehicle_id) {
				throw new BusinessRuleException('Changing the maintenance vehicle is not allowed during update.');
			}

			$maintenance->fill($data);
			$maintenance->save();

			return $maintenance->refresh();
		});
	}

	/**
	 * Start maintenance work.
	 *
	 * @return MaintenanceLog
	 *
	 * @throws BusinessRuleException
	 */
	public function start(MaintenanceLog $maintenance): MaintenanceLog
	{
		return DB::transaction(function () use ($maintenance): MaintenanceLog {
			$vehicle = $this->resolveMaintenanceVehicle($maintenance);
			$this->ensureMaintenanceCanTransition($maintenance, [MaintenanceLog::STATUS_SCHEDULED]);

			if ($vehicle->status === Vehicle::STATUS_RETIRED) {
				throw new BusinessRuleException('Maintenance on retired vehicles is not allowed.');
			}

			$vehicle->status = Vehicle::STATUS_IN_SHOP;
			$vehicle->save();

			$maintenance->status = MaintenanceLog::STATUS_IN_PROGRESS;
			$maintenance->save();

			return $maintenance->refresh();
		});
	}

	/**
	 * Complete maintenance work and return the vehicle to service unless retired.
	 *
	 * @return MaintenanceLog
	 *
	 * @throws BusinessRuleException
	 */
	public function complete(MaintenanceLog $maintenance): MaintenanceLog
	{
		return DB::transaction(function () use ($maintenance): MaintenanceLog {
			$vehicle = $this->resolveMaintenanceVehicle($maintenance);
			$this->ensureMaintenanceCanTransition($maintenance, [
				MaintenanceLog::STATUS_SCHEDULED,
				MaintenanceLog::STATUS_IN_PROGRESS,
			]);

			$maintenance->status = MaintenanceLog::STATUS_COMPLETED;
			$maintenance->save();

			if ($vehicle->status !== Vehicle::STATUS_RETIRED) {
				$vehicle->status = Vehicle::STATUS_AVAILABLE;
				$vehicle->save();
			}

			return $maintenance->refresh();
		});
	}

	/**
	 * Cancel maintenance and return the vehicle to service unless retired.
	 *
	 * @return MaintenanceLog
	 *
	 * @throws BusinessRuleException
	 */
	public function cancel(MaintenanceLog $maintenance): MaintenanceLog
	{
		return DB::transaction(function () use ($maintenance): MaintenanceLog {
			$vehicle = $this->resolveMaintenanceVehicle($maintenance);
			$this->ensureMaintenanceCanTransition($maintenance, [
				MaintenanceLog::STATUS_SCHEDULED,
				MaintenanceLog::STATUS_IN_PROGRESS,
			]);

			$maintenance->status = MaintenanceLog::STATUS_CANCELLED;
			$maintenance->save();

			if ($vehicle->status !== Vehicle::STATUS_RETIRED) {
				$vehicle->status = Vehicle::STATUS_AVAILABLE;
				$vehicle->save();
			}

			return $maintenance->refresh();
		});
	}

	/**
	 * Delete a maintenance record.
	 *
	 * @return bool
	 */
	public function delete(MaintenanceLog $maintenance): bool
	{
		return DB::transaction(static fn (): bool => (bool) $maintenance->delete());
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
	 * Resolve the vehicle associated with a maintenance record.
	 *
	 * @throws BusinessRuleException
	 */
	private function resolveMaintenanceVehicle(MaintenanceLog $maintenance): Vehicle
	{
		$vehicle = $maintenance->vehicle;

		if ($vehicle === null) {
			$vehicle = $this->vehicle->newQuery()->find($maintenance->vehicle_id);
		}

		if ($vehicle === null) {
			throw new BusinessRuleException('Vehicle must exist.');
		}

		return $vehicle;
	}

	/**
	 * Ensure a vehicle can be placed into maintenance.
	 *
	 * @throws BusinessRuleException
	 */
	private function ensureVehicleCanEnterMaintenance(Vehicle $vehicle): void
	{
		if ($vehicle->status === Vehicle::STATUS_RETIRED) {
			throw new BusinessRuleException('Maintenance on retired vehicles is not allowed.');
		}

		if ($vehicle->status === Vehicle::STATUS_ON_TRIP) {
			throw new BusinessRuleException('Maintenance while vehicle is on trip is not allowed.');
		}
	}

	/**
	 * Ensure no active maintenance exists for the vehicle.
	 *
	 * @throws BusinessRuleException
	 */
	private function ensureNoActiveMaintenanceExists(int|string $vehicleId): void
	{
		$hasActiveMaintenance = $this->maintenanceLog->newQuery()
			->where('vehicle_id', $vehicleId)
			->whereIn('status', [
				MaintenanceLog::STATUS_SCHEDULED,
				MaintenanceLog::STATUS_IN_PROGRESS,
			])
			->exists();

		if ($hasActiveMaintenance) {
			throw new BusinessRuleException('Multiple active maintenance records for the same vehicle are not allowed.');
		}
	}

	/**
	 * Ensure a maintenance record is in a transitionable state.
	 *
	 * @param array<int, string> $allowedStatuses
	 * @throws BusinessRuleException
	 */
	private function ensureMaintenanceCanTransition(MaintenanceLog $maintenance, array $allowedStatuses): void
	{
		if (! in_array($maintenance->status, $allowedStatuses, true)) {
			throw new BusinessRuleException('The maintenance record cannot be changed from its current status.');
		}
	}
}
