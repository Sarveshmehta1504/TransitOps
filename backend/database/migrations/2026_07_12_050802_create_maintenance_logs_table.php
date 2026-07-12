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
        Schema::create('maintenance_logs', function (Blueprint $table) {

            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('maintenance_type', [
                'preventive',
                'corrective',
                'emergency',
                'inspection',
            ]);

            $table->string('title');

            $table->text('description')->nullable();

            $table->decimal('cost', 12, 2)->default(0);

            $table->date('start_date');

            $table->date('end_date')->nullable();

            $table->enum('status', [
                'scheduled',
                'in_progress',
                'completed',
                'cancelled',
            ])->default('scheduled');

            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
