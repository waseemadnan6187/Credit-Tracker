<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recovery extends Model {
    protected $fillable = [
        'billNumber', 'billDate', 'recoveryDate', 'type', 
        'billAmountAtRecovery', 'recoveryAmount', 'remainingAmount'
    ];
}
