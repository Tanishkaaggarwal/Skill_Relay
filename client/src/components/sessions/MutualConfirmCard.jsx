import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { CheckCircle2, Clock, Coins, ShieldCheck, Star } from 'lucide-react';
import api from '../../api/client';

export const MutualConfirmCard = ({ session, onSessionUpdated, onOpenRatingModal }) => {
  const { user, refreshUser } = useAuth();
  const { notifySessionUpdate } = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRequester = session.requester?._id === user?._id;
  const isHelper = session.helper?._id === user?._id;

  const hasMyConfirmation = isRequester
    ? session.confirmedByRequester
    : session.confirmedByHelper;

  const hasPartnerConfirmation = isRequester
    ? session.confirmedByHelper
    : session.confirmedByRequester;

  const isCompleted = session.status === 'completed';

  const partnerUser = isRequester ? session.helper : session.requester;
  const partnerRole = isRequester ? 'Helper' : 'Requester';

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.put(`/sessions/${session._id}/confirm-complete`);
      if (res.data.success) {
        if (onSessionUpdated) {
          onSessionUpdated(res.data.session);
        }
        notifySessionUpdate(session._id, res.data.session);
        refreshUser();

        // If completed, prompt review modal
        if (res.data.isFullySettled && onOpenRatingModal) {
          onOpenRatingModal();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record confirmation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h4 className="font-bold text-slate-800 text-sm sm:text-base">
            Mutual Completion & Credit Escrow
          </h4>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isCompleted ? '✓ Completed & Settled' : '⏳ In Progress'}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Credit Transfer Explanation Box */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-950 flex items-start gap-2.5">
        <Coins className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-900">{session.creditAmount} Credits</span>{' '}
          {isCompleted ? (
            <span>
              have been atomically transferred from{' '}
              <strong>{session.requester?.name}</strong> to{' '}
              <strong>{session.helper?.name}</strong>.
            </span>
          ) : (
            <span>
              will be atomically transferred from{' '}
              <strong>{session.requester?.name}</strong> (Requester) to{' '}
              <strong>{session.helper?.name}</strong> (Helper) once <strong>both</strong> participants confirm completion below.
            </span>
          )}
        </div>
      </div>

      {/* Mutual Confirmation Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Requester Status */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between ${
            session.confirmedByRequester
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={
                session.requester?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  session.requester?.name || 'R'
                )}&background=6366f1&color=fff`
              }
              alt={session.requester?.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">
                {session.requester?.name}
                {isRequester && <span className="text-indigo-600 font-normal"> (You)</span>}
              </p>
              <p className="text-[11px] text-slate-500">Requester (Pays credits)</p>
            </div>
          </div>

          <div>
            {session.confirmedByRequester ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5" /> Pending
              </span>
            )}
          </div>
        </div>

        {/* Helper Status */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between ${
            session.confirmedByHelper
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={
                session.helper?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  session.helper?.name || 'H'
                )}&background=10b981&color=fff`
              }
              alt={session.helper?.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">
                {session.helper?.name}
                {isHelper && <span className="text-indigo-600 font-normal"> (You)</span>}
              </p>
              <p className="text-[11px] text-slate-500">Helper (Earns credits)</p>
            </div>
          </div>

          <div>
            {session.confirmedByHelper ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5" /> Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons & Status Notice */}
      <div className="pt-2">
        {isCompleted ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Session confirmed complete by both parties! Credits transferred.</span>
            </div>
            {onOpenRatingModal && (
              <button
                onClick={onOpenRatingModal}
                className="w-full sm:w-auto text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center justify-center gap-1"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Rate & Review Partner</span>
              </button>
            )}
          </div>
        ) : hasMyConfirmation ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              ✓ <strong>You have confirmed completion.</strong> Waiting for {partnerUser?.name} ({partnerRole}) to confirm on their side.
            </span>
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {loading
                ? 'Submitting Confirmation...'
                : hasPartnerConfirmation
                ? `Confirm & Finalize Credit Settlement (${session.creditAmount} Credits)`
                : 'Mark Session Complete'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
