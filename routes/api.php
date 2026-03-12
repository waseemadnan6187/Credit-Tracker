<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BillingController;

Route::get('/dashboard', [BillingController::class, 'dashboard']);
Route::post('/bills', [BillingController::class, 'storeBill']);
Route::delete('/bills/{id}', [BillingController::class, 'deleteBill']);
Route::post('/recoveries', [BillingController::class, 'storeRecovery']);

// Master Management
Route::post('/customers', [BillingController::class, 'storeCustomer']);
Route::post('/obs', [BillingController::class, 'storeOB']);
