<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bill;
use App\Models\Recovery;
use App\Models\Customer;
use App\Models\OrderBooker;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'bills' => Bill::orderBy('date', 'desc')->get(),
            'recoveries' => Recovery::orderBy('recoveryDate', 'desc')->get(),
            'customers' => Customer::orderBy('name', 'asc')->get(),
            'obs' => OrderBooker::orderBy('name', 'asc')->get(),
        ]);
    }

    public function storeBill(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'customerCode' => 'required|string',
            'obCode' => 'required|string',
            'billNumber' => 'required|string|unique:bills',
            'shopName' => 'required|string',
            'shopAddress' => 'required|string',
            'billType' => 'required|string',
            'billAmount' => 'required|numeric',
        ]);

        $bill = Bill::create(array_merge($validated, [
            'recovery' => 0,
            'balance' => $validated['billAmount']
        ]));

        return response()->json($bill);
    }

    public function storeRecovery(Request $request)
    {
        $validated = $request->validate([
            'billNumber' => 'required|string|exists:bills,billNumber',
            'recoveryDate' => 'required|date',
            'type' => 'required|string',
            'recoveryAmount' => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($validated) {
            $bill = Bill::where('billNumber', $validated['billNumber'])->first();
            
            if ($validated['recoveryAmount'] > $bill->balance) {
                return response()->json(['error' => 'Recovery amount exceeds balance'], 422);
            }

            $recovery = Recovery::create([
                'billNumber' => $bill->billNumber,
                'billDate' => $bill->date,
                'recoveryDate' => $validated['recoveryDate'],
                'type' => $validated['type'],
                'billAmountAtRecovery' => $bill->balance,
                'recoveryAmount' => $validated['recoveryAmount'],
                'remainingAmount' => $bill->balance - $validated['recoveryAmount']
            ]);

            $bill->increment('recovery', $validated['recoveryAmount']);
            $bill->decrement('balance', $validated['recoveryAmount']);

            return response()->json($recovery);
        });
    }

    public function deleteBill($id)
    {
        return DB::transaction(function () use ($id) {
            $bill = Bill::findOrFail($id);
            Recovery::where('billNumber', $bill->billNumber)->delete();
            $bill->delete();
            return response()->json(['status' => 'success']);
        });
    }

    public function storeCustomer(Request $request) {
        $data = $request->validate([
            'code' => 'required|unique:customers',
            'name' => 'required',
            'address' => 'required',
            'obCode' => 'required'
        ]);
        return response()->json(Customer::create($data));
    }

    public function storeOB(Request $request) {
        $data = $request->validate([
            'code' => 'required|unique:order_bookers',
            'name' => 'required',
            'phone' => 'required'
        ]);
        return response()->json(OrderBooker::create($data));
    }
}
