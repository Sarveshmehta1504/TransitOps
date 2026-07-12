<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Driver;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class DriverService
{
	public function __construct(private readonly Driver $driver)
	{
	}

	/**
	 * Create a new driver record.
	 *
	 * @param array<string, mixed> $data
	 * @return Driver
	 *
	 * @throws BusinessRuleException
	 */
	public function create(array $data): Driver
	{
		return DB::transaction(function () use ($data): Driver {
			$this->ensureLicenseExpiryIsValid($data['license_expiry'] ?? null);
			$this->ensureSafetyScoreIsValid($data['safety_score'] ?? null);
			$this->ensureLicenseAllowsAvailability($data['license_expiry'] ?? null, $data['status'] ?? Driver::STATUS_AVAILABLE);
			$this->ensureLicenseNumberIsUnique($data['license_number']);

			$driver = $this->driver->newInstance();
			$driver->fill($data);

			if (! array_key_exists('status', $data) || $driver->status === null) {
				$driver->status = Driver::STATUS_AVAILABLE;
			}

			$driver->save();

			return $driver
                ->refresh()
                ->load('trips');
		});
	}

	/**
	 * Update an existing driver record.
	 *
	 * @param array<string, mixed> $data
	 * @return Driver
	 *
	 * @throws BusinessRuleException
	 */
	public function update(Driver $driver, array $data): Driver
	{
		return DB::transaction(function () use ($driver, $data): Driver {
			if (array_key_exists('license_number', $data)
				&& $data['license_number'] !== $driver->license_number
			) {
				$this->ensureLicenseNumberIsUnique($data['license_number'], $driver->getKey());
			}

			$licenseExpiry = $data['license_expiry'] ?? $driver->license_expiry;
			$nextStatus = array_key_exists('status', $data) ? (string) $data['status'] : $driver->status;

			$this->ensureLicenseExpiryIsValid($licenseExpiry);
			$this->ensureSafetyScoreIsValid($data['safety_score'] ?? $driver->safety_score);
			$this->ensureLicenseAllowsAvailability($licenseExpiry, $nextStatus);

			$driver->fill($data);
			$driver->save();

			return $driver
                ->refresh()
                ->load('trips');
		});
	}

	/**
	 * Delete a driver record.
	 *
	 * @return bool
	 */
	public function delete(Driver $driver): bool
	{
        if ($driver->status === Driver::STATUS_ON_TRIP) {
            throw new BusinessRuleException(
                'Driver currently on trip cannot be deleted.'
            );
        }

		return DB::transaction(static fn (): bool => (bool) $driver->delete());
	}

	/**
	 * Suspend a driver.
	 *
	 * @return Driver
	 *
	 * @throws BusinessRuleException
	 */
	public function suspend(Driver $driver): Driver
	{
		return DB::transaction(function () use ($driver): Driver {
			if ($driver->status === Driver::STATUS_ON_TRIP) {
				throw new BusinessRuleException('Drivers on trip cannot be suspended.');
			}

			if ($driver->status === Driver::STATUS_SUSPENDED) {
				return $driver
                    ->refresh()
                    ->load('trips');
			}

			$driver->status = Driver::STATUS_SUSPENDED;
			$driver->save();

			return $driver
                ->refresh()
                ->load('trips');
		});
	}

	/**
	 * Activate a suspended or inactive driver.
	 *
	 * @return Driver
	 *
	 * @throws BusinessRuleException
	 */
	public function activate(Driver $driver): Driver
	{
		return DB::transaction(function () use ($driver): Driver {
			$this->ensureLicenseExpiryIsValid($driver->license_expiry);

			if (! $this->isLicenseValid($driver)) {
				throw new BusinessRuleException('Expired license drivers cannot become available.');
			}

			$driver->status = Driver::STATUS_AVAILABLE;
			$driver->save();

			return $driver
                ->refresh()
                ->load('trips');
		});
	}

	/**
	 * Determine whether the driver's license is currently valid.
	 */
	public function isLicenseValid(Driver $driver): bool
	{
		return Carbon::parse($driver->license_expiry)->startOfDay()->greaterThanOrEqualTo(Carbon::today());
	}

	/**
	 * Get all drivers currently available for assignment.
	 *
	 * @return Collection<int, Driver>
	 */
	public function getAvailableDrivers(): Collection
	{
		return $this->driver->newQuery()
			->where('status', Driver::STATUS_AVAILABLE)
			->whereDate('license_expiry', '>=', Carbon::today())
			->orderBy('name')
			->get();
	}

	/**
	 * Ensure a license number is unique across drivers.
	 *
	 * @param mixed $licenseNumber
	 * @throws BusinessRuleException
	 */
	private function ensureLicenseNumberIsUnique(mixed $licenseNumber, mixed $ignoreId = null): void
	{
		$query = $this->driver->newQuery()->where('license_number', $licenseNumber);

		if ($ignoreId !== null) {
			$query->whereKeyNot($ignoreId);
		}

		if ($query->exists()) {
			throw new BusinessRuleException('License number must be unique.');
		}
	}

	/**
	 * Validate and normalize the license expiry date.
	 *
	 * @param mixed $licenseExpiry
	 * @throws BusinessRuleException
	 */
	private function ensureLicenseExpiryIsValid(mixed $licenseExpiry): void
	{
		if ($licenseExpiry === null || $licenseExpiry === '') {
			throw new BusinessRuleException('License expiry is required.');
		}

		try {
			Carbon::parse($licenseExpiry);
		} catch (\Throwable) {
			throw new BusinessRuleException('License expiry must be a valid date.');
		}
	}

	/**
	 * Validate the safety score range.
	 *
	 * @param mixed $safetyScore
	 * @throws BusinessRuleException
	 */
	private function ensureSafetyScoreIsValid(mixed $safetyScore): void
	{
		if ($safetyScore === null || $safetyScore === '') {
			return;
		}

		$score = (int) $safetyScore;

		if ($score < 0 || $score > 100) {
			throw new BusinessRuleException('Safety score must be between 0 and 100.');
		}
	}

	/**
	 * Prevent invalid availability transitions for expired licenses.
	 *
	 * @param mixed $licenseExpiry
	 * @throws BusinessRuleException
	 */
	private function ensureLicenseAllowsAvailability(mixed $licenseExpiry, mixed $status): void
	{
		if ($status !== Driver::STATUS_AVAILABLE) {
			return;
		}

		if (! $this->isLicenseValidForValue($licenseExpiry)) {
			throw new BusinessRuleException('Expired license drivers cannot become available.');
		}
	}

	/**
	 * Check license validity for a raw expiry value.
	 */
	private function isLicenseValidForValue(mixed $licenseExpiry): bool
	{
		if ($licenseExpiry === null || $licenseExpiry === '') {
			return false;
		}

		return Carbon::parse($licenseExpiry)->startOfDay()->greaterThanOrEqualTo(Carbon::today());
	}
}
