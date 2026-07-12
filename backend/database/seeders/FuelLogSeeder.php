<?php

namespace Database\Seeders;

use App\Models\FuelLog;
use App\Models\Trip;
use App\Models\Vehicle;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class FuelLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_IN');

        $vehicles = Vehicle::query()->get();
        $trips = Trip::query()->get();

        if ($vehicles->isEmpty()) {
            throw new \RuntimeException('Seed vehicles before seeding fuel logs.');
        }

        for ($i = 0; $i < 100; $i++) {
            $vehicle = $vehicles->random();
            $trip = $trips->isNotEmpty() && $faker->boolean(60) ? $trips->random() : null;

            $quantity = round($faker->randomFloat(2, 20, 300), 2);
            $pricePerLiter = round($faker->randomFloat(2, 85, 110), 2);
            $totalCost = round($quantity * $pricePerLiter, 2);

            $vehicleOdometer = (float) $vehicle->odometer;
            $odometerReading = round($vehicleOdometer + $faker->randomFloat(2, 0, 5000), 2);

            $fuelDate = Carbon::now()->subMonths($faker->numberBetween(0, 12))->subDays($faker->numberBetween(0, 30));

            FuelLog::create([
                'vehicle_id' => $vehicle->id,
                'trip_id' => $trip?->id,
                'quantity' => $quantity,
                'price_per_liter' => $pricePerLiter,
                'total_cost' => $totalCost,
                'odometer_reading' => $odometerReading,
                'fuel_date' => $fuelDate,
                'remarks' => $faker->optional()->sentence(),
            ]);
        }
    }
}
