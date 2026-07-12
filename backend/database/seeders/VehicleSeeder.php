<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vehicles = [
            ['MH12AB1234', 'Tata Signa 5530.S', 'Truck', 'available'],
            ['DL01CD5678', 'Ashok Leyland 4220', 'Container', 'on_trip'],
            ['KA05EF2468', 'Eicher Pro 3015', 'Mini Truck', 'available'],
            ['TN10GH1357', 'BharatBenz 1617R', 'Truck', 'in_shop'],
            ['GJ01JK9098', 'Mahindra Bolero Pik-Up', 'Pickup', 'available'],
            ['UP16LM1122', 'Volvo FM 370', 'Container', 'available'],
            ['RJ14NP3344', 'Tata LPT 3118', 'Truck', 'on_trip'],
            ['WB24QR5566', 'Force Traveller Cargo', 'Mini Truck', 'available'],
            ['HR26ST7788', 'Ashok Leyland 3520', 'Trailer', 'available'],
            ['PB10UV9900', 'Tata Ultra T.7', 'Mini Truck', 'in_shop'],
            ['TS09WX1213', 'BharatBenz 3528C', 'Container', 'available'],
            ['MP09YZ1415', 'Mahindra Furio 16', 'Truck', 'available'],
            ['AP16AA1718', 'Tata 407 Gold', 'Pickup', 'on_trip'],
            ['KL07BB1920', 'Eicher Pro 6028', 'Truck', 'available'],
            ['CH01CC2122', 'Scania G 410', 'Trailer', 'available'],
            ['OD02DD2324', 'Tata Intra V30', 'Pickup', 'available'],
            ['AS03EE2526', 'Ashok Leyland Dost Strong', 'Mini Truck', 'in_shop'],
            ['JK04FF2728', 'BharatBenz 1923C', 'Container', 'available'],
            ['BR05GG2930', 'Tata Prima 5530.S', 'Trailer', 'available'],
            ['PN06HH3132', 'Eicher Pro 2095XP', 'Mini Truck', 'on_trip'],
        ];

        foreach ($vehicles as [$registrationNumber, $name, $type, $status]) {
            Vehicle::create([
                'registration_number' => $registrationNumber,
                'name' => $name,
                'type' => $type,
                'max_load_capacity' => random_int(1000, 30000),
                'odometer' => random_int(1000, 500000),
                'acquisition_cost' => random_int(500000, 5000000),
                'status' => $status,
            ]);
        }
    }
}
