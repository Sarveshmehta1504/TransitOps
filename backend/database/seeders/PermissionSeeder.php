<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [

            'view vehicles',
            'manage vehicles',

            'view drivers',
            'manage drivers',

            'view trips',
            'manage trips',

            'view maintenance',
            'manage maintenance',

            'view fuel logs',
            'manage fuel logs',

            'view expenses',
            'manage expenses',

            'view dashboard',

            'view reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        Role::findByName('Admin')->syncPermissions(Permission::all());

        Role::findByName('Fleet Manager')
            ->syncPermissions([
                'view dashboard',
                'view reports',

                'view vehicles',
                'manage vehicles',

                'view drivers',
                'manage drivers',

                'view maintenance',
                'manage maintenance',

                'view trips',
            ]);

        Role::findByName('Dispatcher')
            ->syncPermissions([
                'view dashboard',

                'view vehicles',

                'view drivers',

                'view trips',
                'manage trips',

                'view fuel logs',
                'manage fuel logs',
            ]);

        Role::findByName('Safety Officer')
            ->syncPermissions([
                'view dashboard',
                'view reports',

                'view drivers',
                'manage drivers',

                'view trips',

                'view maintenance',
            ]);

        Role::findByName('Financial Analyst')
            ->syncPermissions([
                'view dashboard',
                'view reports',

                'view vehicles',

                'view fuel logs',

                'view expenses',
                'manage expenses',
            ]);
    }
}
