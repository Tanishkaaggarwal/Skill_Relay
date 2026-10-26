import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Gift, History } from 'lucide-react';

export const TransactionHistoryTable = ({ transactions = [] }) => {
  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">No transactions logged yet</h4>
        <p className="text-xs text-slate-400 mt-1">
          Complete help sessions to earn and exchange campus credits.
        </p>
      </div>
    );
  }

  const getTypeInfo = (type) => {
    switch (type) {
      case 'credit':
        return {
          label: 'Credit Earned',
          icon: ArrowDownLeft,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          amountPrefix: '+',
          amountColor: 'text-emerald-600 font-bold',
        };
      case 'debit':
        return {
          label: 'Credit Spent',
          icon: ArrowUpRight,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          amountPrefix: '',
          amountColor: 'text-rose-600 font-bold',
        };
      case 'initial_bonus':
        return {
          label: 'Welcome Bonus',
          icon: Gift,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          amountPrefix: '+',
          amountColor: 'text-amber-600 font-bold',
        };
      default:
        return {
          label: 'Adjustment',
          icon: History,
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          amountPrefix: '',
          amountColor: 'text-slate-700 font-bold',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Credit Ledger & Transaction History
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {transactions.length} record{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Transaction / Event</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Balance After</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {transactions.map((tx) => {
              const info = getTypeInfo(tx.type);
              const Icon = info.icon;

              return (
                <tr key={tx._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 max-w-xs font-medium text-slate-800">
                    <p className="line-clamp-2">{tx.description}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${info.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {info.label}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 whitespace-nowrap text-sm ${info.amountColor}`}>
                    {info.amountPrefix}
                    {tx.amount} credits
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800">
                    🪙 {tx.balanceAfter}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                    {new Date(tx.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    ·{' '}
                    {new Date(tx.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
