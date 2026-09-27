import React from 'react';
import { AlertCircle, QrCode, Sparkles, HelpCircle } from 'lucide-react';

interface InvalidTableProps {
  reason?: 'not_found' | 'inactive' | 'missing';
  tableParam?: string;
  onSelectDemoTable?: (tableId: string) => void;
}

export const InvalidTable: React.FC<InvalidTableProps> = ({
  reason = 'not_found',
  tableParam,
  onSelectDemoTable,
}) => {
  return (
    <div className="min-h-screen bg-[#FFF8ED] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5A1724] via-[#C99A3D] to-[#5A1724]" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <AlertCircle size={32} />
        </div>

        {/* Cafe Brand */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] border border-[#C99A3D]/40 text-[#8C6517] text-xs font-bold font-royal mb-2">
          <Sparkles size={12} className="text-[#C99A3D]" />
          <span>RICH 'N' ROYAL CAFE</span>
        </div>

        {/* Error Headline & Copy */}
        {reason === 'inactive' ? (
          <>
            <h2 className="text-xl font-black text-[#5A1724] font-royal mt-2">
              Table Currently Unavailable
            </h2>
            <p className="text-xs text-[#735A53] mt-2 leading-relaxed">
              This table is currently reserved or not in service. Please ask our cafe staff for assistance or seating re-assignment.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-black text-[#5A1724] font-royal mt-2">
              Invalid Table QR Code
            </h2>
            <p className="text-xs text-[#735A53] mt-2 leading-relaxed">
              This QR code ({tableParam || 'Unknown'}) does not belong to an active cafe table. Please scan the QR code sticker placed on your table.
            </p>
          </>
        )}

        {/* Quick Demo Table selector if in development/preview */}
        {onSelectDemoTable && (
          <div className="mt-6 pt-5 border-t border-[#F0E4D3] text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#735A53] block mb-2">
              Or Choose a Dining Table to Test:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {['T01', 'T02', 'T03', 'T04', 'T05', 'T06'].map((tId) => (
                <button
                  key={tId}
                  onClick={() => onSelectDemoTable(tId)}
                  className="px-2.5 py-2 rounded-xl bg-[#FFF8ED] hover:bg-[#5A1724] hover:text-[#FFF8ED] text-[#5A1724] border border-[#EADBCA] text-xs font-bold transition-all shadow-2xs text-center"
                >
                  Table {tId.replace('T', '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Staff Help */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#93786F]">
          <HelpCircle size={14} />
          <span>Need help? Ask any cafe team member.</span>
        </div>
      </div>
    </div>
  );
};
