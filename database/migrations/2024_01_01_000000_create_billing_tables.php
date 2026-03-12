<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('order_bookers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('phone');
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('address');
            $table->string('obCode');
            $table->timestamps();
        });

        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('customerCode');
            $table->string('obCode');
            $table->string('billNumber')->unique();
            $table->string('shopName');
            $table->text('shopAddress');
            $table->string('billType');
            $table->decimal('billAmount', 15, 2);
            $table->decimal('recovery', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            $table->timestamps();
        });

        Schema::create('recoveries', function (Blueprint $table) {
            $table->id();
            $table->string('billNumber');
            $table->date('billDate');
            $table->date('recoveryDate');
            $table->string('type');
            $table->decimal('billAmountAtRecovery', 15, 2);
            $table->decimal('recoveryAmount', 15, 2);
            $table->decimal('remainingAmount', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('recoveries');
        Schema::dropIfExists('bills');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('order_bookers');
    }
};
