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
        Schema::create('expenses', function (Blueprint $table) {

            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('trip_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->enum('expense_type', [
                'toll',
                'parking',
                'insurance',
                'registration',
                'driver_allowance',
                'fine',
                'tax',
                'miscellaneous',
            ]);

            $table->string('title');

            $table->decimal('amount', 12, 2);

            $table->timestamp('expense_date');

            $table->string('paid_by')->nullable();

            $table->enum('payment_method', [
                'cash',
                'card',
                'upi',
                'bank_transfer',
            ])->nullable();

            $table->string('receipt_number')->nullable();

            $table->text('remarks')->nullable();

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
