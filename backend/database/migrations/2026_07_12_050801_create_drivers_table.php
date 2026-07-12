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
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->string('license_number')->unique();

            $table->string('license_category');

            $table->date('license_expiry');

            $table->string('contact_number');

            $table->string('email')->nullable()->unique();

            $table->text('address')->nullable();

            $table->date('date_of_birth');

            $table->date('joining_date');

            $table->integer('safety_score')->default(100);

            $table->enum('status', [
                'available',
                'on_trip',
                'off_duty',
                'suspended',
            ])->default('available');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
