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
        Schema::create('fuel_logs', function (Blueprint $table) {

            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('trip_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->decimal('quantity',10,2);

            $table->decimal('price_per_liter',10,2);

            $table->decimal('total_cost',12,2);

            $table->decimal('odometer_reading',12,2);

            $table->timestamp('fuel_date');

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
        Schema::dropIfExists('fuel_logs');
    }
};
