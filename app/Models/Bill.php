<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model {
    protected $fillable = [
        'date', 'customerCode', 'obCode', 'billNumber', 
        'shopName', 'shopAddress', 'billType', 'billAmount', 
        'recovery', 'balance'
    ];
}
