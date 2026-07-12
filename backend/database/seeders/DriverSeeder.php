<?php

namespace Database\Seeders;

use App\Models\Driver;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_IN');

        $categories = ['LMV', 'HMV', 'Transport', 'Commercial'];
        $statuses = [
            Driver::STATUS_AVAILABLE,
            Driver::STATUS_ON_TRIP,
            Driver::STATUS_OFF_DUTY,
        ];
        $usedLicenseNumbers = [];

        for ($i = 0; $i < 30; $i++) {
            do {
                $licenseNumber = sprintf(
                    '%s%s%s%04d',
                    $faker->randomElement(['MH', 'DL', 'KA', 'TN', 'GJ', 'RJ', 'UP', 'HR', 'PB', 'TS', 'WB', 'MP']),
                    str_pad((string) $faker->numberBetween(1, 99), 2, '0', STR_PAD_LEFT),
                    strtoupper($faker->bothify('??')),
                    $faker->numberBetween(1000, 9999)
                );
            } while (in_array($licenseNumber, $usedLicenseNumbers, true));

            $usedLicenseNumbers[] = $licenseNumber;

            $licenseExpiry = Carbon::now()->addYears($faker->numberBetween(1, 5))->addDays($faker->numberBetween(0, 365));
            $joiningDate = Carbon::now()->subYears($faker->numberBetween(1, 10))->subDays($faker->numberBetween(0, 365));
            $dateOfBirth = Carbon::parse($faker->dateTimeBetween('-55 years', '-22 years'))->startOfDay();

            Driver::create([
                'name' => $faker->name(),
                'license_number' => $licenseNumber,
                'license_category' => $faker->randomElement($categories),
                'license_expiry' => $licenseExpiry->toDateString(),
                'contact_number' => $faker->numerify('9#########'),
                'email' => $faker->unique()->safeEmail(),
                'address' => $faker->address(),
                'date_of_birth' => $dateOfBirth->toDateString(),
                'joining_date' => $joiningDate->toDateString(),
                'safety_score' => $faker->numberBetween(70, 100),
                'status' => $faker->randomElement($statuses),
            ]);
        }
    }
}
