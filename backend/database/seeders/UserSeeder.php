<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@transitops.com',
                'password' => Hash::make('password'),
                'role' => 'Admin',
            ],

            [
                'name' => 'Fleet Manager',
                'email' => 'fleet@transitops.com',
                'password' => Hash::make('password'),
                'role' => 'Fleet Manager',
            ],

            [
                'name' => 'Dispatcher',
                'email' => 'dispatcher@transitops.com',
                'password' => Hash::make('password'),
                'role' => 'Dispatcher',
            ],

            [
                'name' => 'Safety Officer',
                'email' => 'safety@transitops.com',
                'password' => Hash::make('password'),
                'role' => 'Safety Officer',
            ],

            [
                'name' => 'Financial Analyst',
                'email' => 'finance@transitops.com',
                'password' => Hash::make('password'),
                'role' => 'Financial Analyst',
            ],

        ];

        foreach ($users as $userData) {

            $role = $userData['role'];

            unset($userData['role']);

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            $user->syncRoles([$role]);
        }
    }
}
