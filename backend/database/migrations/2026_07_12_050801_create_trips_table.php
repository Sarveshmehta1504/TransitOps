<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id');
            $table->foreignId('driver_id');

            $table->string('source');
            $table->string('destination');

            $table->decimal('cargo_weight');
            $table->decimal('planned_distance');

            $table->decimal('final_odometer')->nullable();
            $table->decimal('fuel_consumed')->nullable();

            $table->enum('status',[
                'draft',
                'dispatched',
                'completed',
                'cancelled'
            ]);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
