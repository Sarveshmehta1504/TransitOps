<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\Trip;
use App\Models\Vehicle;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
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
            throw new \RuntimeException('Seed vehicles before seeding expenses.');
        }

        $expenseTypes = [
            Expense::TYPE_TOLL,
            Expense::TYPE_PARKING,
            Expense::TYPE_INSURANCE,
            Expense::TYPE_REGISTRATION,
            Expense::TYPE_DRIVER_ALLOWANCE,
            Expense::TYPE_FINE,
            Expense::TYPE_TAX,
            Expense::TYPE_MISC,
        ];

        $paymentMethods = [
            Expense::PAYMENT_CASH,
            Expense::PAYMENT_CARD,
            Expense::PAYMENT_UPI,
            Expense::PAYMENT_BANK,
        ];

        $usedReceiptNumbers = [];

        $amountRanges = [
            Expense::TYPE_TOLL => [150, 3500],
            Expense::TYPE_PARKING => [50, 1200],
            Expense::TYPE_INSURANCE => [5000, 75000],
            Expense::TYPE_REGISTRATION => [2000, 30000],
            Expense::TYPE_DRIVER_ALLOWANCE => [300, 4000],
            Expense::TYPE_FINE => [200, 15000],
            Expense::TYPE_TAX => [1000, 40000],
            Expense::TYPE_MISC => [200, 10000],
        ];

        $titles = [
            Expense::TYPE_TOLL => ['Highway Toll', 'Expressway Toll', 'Bridge Toll'],
            Expense::TYPE_PARKING => ['Parking Charges', 'Truck Parking', 'Loading Dock Parking'],
            Expense::TYPE_INSURANCE => ['Vehicle Insurance Premium', 'Annual Insurance Renewal'],
            Expense::TYPE_REGISTRATION => ['Registration Renewal', 'Permit Renewal'],
            Expense::TYPE_DRIVER_ALLOWANCE => ['Driver Allowance', 'Trip Allowance'],
            Expense::TYPE_FINE => ['Traffic Fine', 'Overload Fine', 'Permit Penalty'],
            Expense::TYPE_TAX => ['Road Tax', 'State Permit Tax', 'Commercial Tax'],
            Expense::TYPE_MISC => ['Miscellaneous Expense', 'Operational Expense', 'Unplanned Expense'],
        ];

        for ($i = 0; $i < 100; $i++) {
            $vehicle = $vehicles->random();
            $trip = $trips->isNotEmpty() && $faker->boolean(65) ? $trips->random() : null;
            $expenseType = $faker->randomElement($expenseTypes);
            [$minAmount, $maxAmount] = $amountRanges[$expenseType];
            $amount = round($faker->randomFloat(2, $minAmount, $maxAmount), 2);

            do {
                $receiptNumber = sprintf('RCPT-%s-%05d', now()->format('Ymd'), random_int(10000, 99999));
            } while (in_array($receiptNumber, $usedReceiptNumbers, true));

            $usedReceiptNumbers[] = $receiptNumber;

            $expenseDate = Carbon::now()->subMonths($faker->numberBetween(0, 12))->subDays($faker->numberBetween(0, 30));

            Expense::create([
                'vehicle_id' => $vehicle->id,
                'trip_id' => $trip?->id,
                'expense_type' => $expenseType,
                'title' => $faker->randomElement($titles[$expenseType]),
                'amount' => $amount,
                'expense_date' => $expenseDate,
                'paid_by' => $faker->name(),
                'payment_method' => $faker->randomElement($paymentMethods),
                'receipt_number' => $receiptNumber,
                'remarks' => $faker->optional()->sentence(),
            ]);
        }
    }
}
