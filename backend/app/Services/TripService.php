<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Trip;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;

class TripService
{
    public function createTrip(array $data): Trip
    {
        return DB::transaction(function () use ($data) {

            $vehicle = Vehicle::query()
                ->lockForUpdate()
                ->findOrFail($data['vehicle_id']);

            $driver = Driver::query()
                ->lockForUpdate()
                ->findOrFail($data['driver_id']);

            $this->validateVehicle($vehicle, $data['cargo_weight']);

            $this->validateDriver($driver);

            if ($data['starting_odometer'] != $vehicle->odometer) {
                throw new BusinessRuleException('Starting odometer must match vehicle\'s current odometer.');
            }

            $trip = Trip::create([
                'vehicle_id'         => $vehicle->id,
                'driver_id'          => $driver->id,
                'trip_number'        => $this->generateTripNumber(),
                'source'             => $data['source'],
                'destination'        => $data['destination'],
                'cargo_weight'       => $data['cargo_weight'],
                'planned_distance'   => $data['planned_distance'],
                'starting_odometer'  => $data['starting_odometer'],
                'remarks'            => $data['remarks'] ?? null,
                'status'             => Trip::STATUS_DRAFT,
            ]);

            return $this->loadTripRelations($trip);
        });
    }

    public function updateTrip(Trip $trip, array $data): Trip
    {
        if ($trip->status !== Trip::STATUS_DRAFT) {
            throw new BusinessRuleException('Only draft trips can be updated.');
        }

        return DB::transaction(function () use ($trip, $data) {

            $vehicle = Vehicle::query()
                ->lockForUpdate()
                ->findOrFail($data['vehicle_id']);

            $driver = Driver::query()
                ->lockForUpdate()
                ->findOrFail($data['driver_id']);

            $this->validateVehicle($vehicle, $data['cargo_weight']);

            $this->validateDriver($driver);

            if ($data['starting_odometer'] != $vehicle->odometer) {
                throw new BusinessRuleException(
                    'Starting odometer must match vehicle current odometer.'
                );
            }

            $trip->update([
                'vehicle_id'        => $vehicle->id,
                'driver_id'         => $driver->id,
                'source'            => $data['source'],
                'destination'       => $data['destination'],
                'cargo_weight'      => $data['cargo_weight'],
                'planned_distance'  => $data['planned_distance'],
                'starting_odometer' => $data['starting_odometer'],
                'remarks'           => $data['remarks'] ?? null,
            ]);

            return $this->loadTripRelations($trip);
        });
    }

    public function deleteTrip(Trip $trip): bool
    {
        return DB::transaction(static fn (): bool => (bool) $trip->delete());
    }

    public function delete(Trip $trip): bool
    {
        return $this->deleteTrip($trip);
    }

    public function dispatchTrip(Trip $trip): Trip
    {
        if ($trip->status !== Trip::STATUS_DRAFT) {
            throw new BusinessRuleException('Only draft trips can be dispatched.');
        }

        return DB::transaction(function () use ($trip) {

            $trip->load(['vehicle', 'driver']);

            $vehicle = $trip->vehicle;
            $driver = $trip->driver;

            $this->validateVehicle($vehicle, $trip->cargo_weight);
            $this->validateDriver($driver);

            $vehicle->update([
                'status' => Vehicle::STATUS_ON_TRIP,
            ]);

            $driver->update([
                'status' => Driver::STATUS_ON_TRIP,
            ]);

            $trip->update([
                'status' => Trip::STATUS_DISPATCHED,
                'start_time' => now(),
            ]);

            return $this->loadTripRelations($trip);
        });
    }

    public function completeTrip(Trip $trip, array $data): Trip
    {
        if ($trip->status !== Trip::STATUS_DISPATCHED) {
            throw new BusinessRuleException('Only dispatched trips can be completed.');
        }

        if ($data['ending_odometer'] < $trip->starting_odometer) {
            throw new BusinessRuleException('Ending odometer cannot be less than starting odometer.');
        }

        return DB::transaction(function () use ($trip, $data) {

            $trip->load(['vehicle', 'driver']);

            $vehicle = $trip->vehicle;
            $driver = $trip->driver;

            if ($data['ending_odometer'] < $vehicle->odometer) {
                throw new BusinessRuleException('Ending odometer cannot be less than vehicle\'s current odometer.');
            }

            $trip->update([
                'actual_distance' => $data['actual_distance'],
                'fuel_consumed' => $data['fuel_consumed'],
                'ending_odometer' => $data['ending_odometer'],
                'remarks' => $data['remarks'] ?? $trip->remarks,
                'status' => Trip::STATUS_COMPLETED,
                'end_time' => now(),
            ]);

            $vehicle->update([
                'status' => Vehicle::STATUS_AVAILABLE,
                'odometer' => $data['ending_odometer'],
            ]);

            $driver->update([
                'status' => Driver::STATUS_AVAILABLE,
            ]);

            return $this->loadTripRelations($trip);
        });
    }

    public function cancelTrip(Trip $trip): Trip
    {
        if ($trip->status === Trip::STATUS_COMPLETED) {
            throw new BusinessRuleException('Completed trips cannot be cancelled.');
        }

        if ($trip->status === Trip::STATUS_CANCELLED) {
            throw new BusinessRuleException('Trip is already cancelled.');
        }

        return DB::transaction(function () use ($trip) {

            if ($trip->status === Trip::STATUS_DISPATCHED) {

                $trip->vehicle->update([
                    'status' => Vehicle::STATUS_AVAILABLE,
                ]);

                $trip->driver->update([
                    'status' => Driver::STATUS_AVAILABLE,
                ]);
            }

            $trip->update([
                'status' => Trip::STATUS_CANCELLED,
            ]);

            return $this->loadTripRelations($trip);
        });
    }

    private function validateVehicle(Vehicle $vehicle, float $cargoWeight): void
    {
        if ($vehicle->status === Vehicle::STATUS_RETIRED) {
            throw new BusinessRuleException('This vehicle has been retired.');
        }

        if ($vehicle->status === Vehicle::STATUS_IN_SHOP) {
            throw new BusinessRuleException('Vehicle is currently under maintenance.');
        }

        if ($vehicle->status === Vehicle::STATUS_ON_TRIP) {
            throw new BusinessRuleException('Vehicle is already assigned to another trip.');
        }

        if ($cargoWeight > $vehicle->max_load_capacity) {
            throw new BusinessRuleException('Cargo weight exceeds vehicle capacity.');
        }
    }

    private function validateDriver(Driver $driver): void
    {
        if ($driver->status === Driver::STATUS_SUSPENDED) {
            throw new BusinessRuleException('Driver is suspended.');
        }

        if ($driver->status === Driver::STATUS_ON_TRIP) {
            throw new BusinessRuleException('Driver is already assigned to another trip.');
        }

        if ($driver->status !== Driver::STATUS_AVAILABLE) {
            throw new BusinessRuleException('Driver is currently unavailable.');
        }

        if ($driver->license_expiry->isPast()) {
            throw new BusinessRuleException('Driver license has expired.');
        }
    }

    private function generateTripNumber(): string
    {
        do {

            $tripNumber = sprintf(
                'TRIP-%s-%04d',
                now()->format('Ymd'),
                random_int(1,9999)
            );

        } while (Trip::where('trip_number',$tripNumber)->exists());

        return $tripNumber;
    }

    private function loadTripRelations(Trip $trip): Trip
    {
        return $trip->fresh([
            'vehicle',
            'driver',
            'fuelLogs',
            'expenses',
        ]);
    }
}
