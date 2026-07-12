<?php

namespace Database\Seeders;

use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class MaintenanceLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_IN');

        $vehicles = Vehicle::query()->get();

        if ($vehicles->isEmpty()) {
            throw new \RuntimeException('Seed vehicles before seeding maintenance logs.');
        }

        $maintenanceTypes = [
            MaintenanceLog::STATUS_SCHEDULED => null,
            'preventive',
            'corrective',
            'emergency',
            'inspection',
        ];

        $statuses = [
            MaintenanceLog::STATUS_SCHEDULED,
            MaintenanceLog::STATUS_IN_PROGRESS,
            MaintenanceLog::STATUS_COMPLETED,
        ];

        $titles = [
            'Engine Oil Replacement',
            'Brake Pad Inspection',
            'Tyre Alignment and Balancing',
            'Clutch Assembly Check',
            'Battery Replacement',
            'Coolant System Flush',
            'Suspension Repair',
            'Air Filter Replacement',
            'Periodic Safety Inspection',
            'Electrical Wiring Repair',
            'Gearbox Servicing',
            'Wheel Hub Greasing',
        ];

        $descriptions = [
            'Routine maintenance carried out to keep the vehicle in optimal operating condition.',
            'Inspection and replacement performed to ensure safe long-distance operations.',
            'Minor corrective work completed after identifying wear during the last trip cycle.',
            'Emergency repair performed due to unexpected mechanical failure during operations.',
            'Scheduled workshop activity covering lubrication, inspection, and component tightening.',
            'Comprehensive checkup completed to maintain roadworthiness and reduce breakdown risk.',
        ];

        $remarks = [
            'Vehicle returned to service after workshop clearance.',
            'Follow-up inspection recommended after 500 km.',
            'Parts replaced with OEM approved components.',
            'Maintenance completed within planned downtime window.',
            'Driver reported improved performance after service.',
        ];

        for ($i = 0; $i < 30; $i++) {
            $vehicle = $vehicles->random();
            $status = $statuses[$i % count($statuses)];

            $maintenanceType = $faker->randomElement([
                'preventive',
                'corrective',
                'emergency',
                'inspection',
            ]);

            $startDate = Carbon::now()->subMonths($faker->numberBetween(0, 12))->subDays($faker->numberBetween(0, 30));
            $endDate = $status === MaintenanceLog::STATUS_COMPLETED
                ? (clone $startDate)->addDays($faker->numberBetween(1, 14))
                : null;

            MaintenanceLog::create([
                'vehicle_id' => $vehicle->id,
                'maintenance_type' => $maintenanceType,
                'title' => $faker->randomElement($titles),
                'description' => $faker->randomElement($descriptions),
                'cost' => round($faker->randomFloat(2, 1000, 100000), 2),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate?->toDateString(),
                'status' => $status,
                'remarks' => $faker->randomElement($remarks),
            ]);
        }
    }
}
