<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class TripSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_IN');

        $vehicles = Vehicle::query()->get();
        $drivers = Driver::query()->get();

        if ($vehicles->isEmpty() || $drivers->isEmpty()) {
            throw new \RuntimeException('Seed vehicles and drivers before seeding trips.');
        }

        $routes = [
            ['Mumbai', 'Pune'],
            ['Mumbai', 'Ahmedabad'],
            ['Delhi', 'Jaipur'],
            ['Bangalore', 'Chennai'],
            ['Chennai', 'Hyderabad'],
            ['Kolkata', 'Bhubaneswar'],
            ['Ahmedabad', 'Rajkot'],
            ['Pune', 'Nagpur'],
            ['Surat', 'Mumbai'],
            ['Delhi', 'Ludhiana'],
            ['Hyderabad', 'Vijayawada'],
            ['Bangalore', 'Mysuru'],
            ['Jaipur', 'Udaipur'],
            ['Lucknow', 'Kanpur'],
            ['Indore', 'Bhopal'],
            ['Nagpur', 'Raipur'],
            ['Coimbatore', 'Madurai'],
            ['Nashik', 'Pune'],
            ['Vadodara', 'Surat'],
            ['Delhi', 'Agra'],
        ];

        $statuses = [
            Trip::STATUS_DRAFT,
            Trip::STATUS_DISPATCHED,
            Trip::STATUS_COMPLETED,
        ];

        $usedTripNumbers = [];

        for ($i = 0; $i < 50; $i++) {
            $vehicle = $vehicles->random();
            $driver = $drivers->random();
            [$source, $destination] = $routes[$i % count($routes)];

            $maxLoad = (float) $vehicle->max_load_capacity;
            $startingOdometer = (float) $vehicle->odometer + random_int(0, 5000);
            $plannedDistance = (float) random_int(80, 1200);
            $actualDistance = max(10, $plannedDistance + random_int(-20, 20));
            $cargoWeight = round(min($maxLoad, max(500, random_int(500, (int) $maxLoad))), 2);
            $fuelConsumed = round($actualDistance / random_int(3, 6), 2);

            do {
                $tripNumber = sprintf('TRIP-%s-%04d', now()->format('Ymd'), random_int(1000, 9999));
            } while (in_array($tripNumber, $usedTripNumbers, true));

            $usedTripNumbers[] = $tripNumber;

            $status = $statuses[$i % count($statuses)];
            $startTime = Carbon::now()->subDays(random_int(1, 365))->subHours(random_int(1, 12));
            $endTime = (clone $startTime)->addHours(random_int(2, 18));
            $endingOdometer = $startingOdometer + $actualDistance;

            Trip::create([
                'vehicle_id' => $vehicle->id,
                'driver_id' => $driver->id,
                'trip_number' => $tripNumber,
                'source' => $source,
                'destination' => $destination,
                'cargo_weight' => $cargoWeight,
                'planned_distance' => $plannedDistance,
                'actual_distance' => $status === Trip::STATUS_DRAFT ? null : $actualDistance,
                'starting_odometer' => $startingOdometer,
                'ending_odometer' => $status === Trip::STATUS_DRAFT ? null : $endingOdometer,
                'fuel_consumed' => $status === Trip::STATUS_DRAFT ? null : $fuelConsumed,
                'start_time' => in_array($status, [Trip::STATUS_DISPATCHED, Trip::STATUS_COMPLETED], true) ? $startTime : null,
                'end_time' => $status === Trip::STATUS_COMPLETED ? $endTime : null,
                'status' => $status,
                'remarks' => $faker->optional()->sentence(),
            ]);
        }
    }
}
