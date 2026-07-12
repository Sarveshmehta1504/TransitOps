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

            $table->foreignId('vehicle_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('driver_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('trip_number')->unique();

            $table->string('source');

            $table->string('destination');

            $table->decimal('cargo_weight', 10, 2);

            $table->decimal('planned_distance', 10, 2);

            $table->decimal('actual_distance', 10, 2)
                ->nullable();

            $table->decimal('starting_odometer', 12, 2);

            $table->decimal('ending_odometer', 12, 2)
                ->nullable();

            $table->decimal('fuel_consumed', 10, 2)
                ->nullable();

            $table->timestamp('start_time')
                ->nullable();

            $table->timestamp('end_time')
                ->nullable();

            $table->enum('status', [
                'draft',
                'dispatched',
                'completed',
                'cancelled',
            ])->default('draft');

            $table->text('remarks')
                ->nullable();

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
