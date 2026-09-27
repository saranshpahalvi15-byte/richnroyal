import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Table } from '../../types';
import { Download, Printer, Copy, Check, Sparkles, ExternalLink, X } from 'lucide-react';
import { Modal } from '../common/Modal';

interface TableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

export const TableQRModal: React.FC<TableQRModalProps> = ({
  isOpen,
  onClose,
  table,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const tableCode = table ? (table.tableNumber ? `T${table.tableNumber.padStart(2, '0')}` : table.id) : '';
  const menuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu?table=${tableCode}`
    : `https://richnroyal.cafe/menu?table=${tableCode}`;

  useEffect(() => {
    if (!isOpen || !table) return;

    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(menuUrl, {
          width: 512,
          margin: 2,
          color: {
            dark: '#241A18',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setQrDataUrl(url);

        if (canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, menuUrl, {
            width: 260,
            margin: 2,
            color: {
              dark: '#241A18',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H',
          });
        }
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    };

    generateQR();
  }, [isOpen, table, menuUrl]);

  if (!isOpen || !table) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `Rich-N-Royal-${table.tableName.replace(/\s+/g, '-')}-QR.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Modal Dialog for Admin Screen */}
      <Modal isOpen={isOpen} onClose={onClose} title={`${table.tableName} QR Code`} maxWidth="max-w-md">
        <div className="flex flex-col items-center text-center">
          {/* Printable Card Preview */}
          <div className="w-full bg-[#FFFDF9] border-2 border-[#C99A3D]/40 rounded-3xl p-6 shadow-md relative overflow-hidden mb-5">
            {/* Royal Top Border */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5A1724] via-[#C99A3D] to-[#5A1724]" />

            {/* Cafe Branding Header */}
            <div className="mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#5A1724] text-[#C99A3D] text-[11px] font-bold font-royal tracking-widest uppercase">
                <Sparkles size={12} />
                <span>Rich 'N' Royal Cafe</span>
              </div>
              <h2 className="text-2xl font-black text-[#5A1724] font-royal mt-2 tracking-wide">
                {table.tableName.toUpperCase()}
              </h2>
              <p className="text-xs text-[#735A53] font-medium mt-0.5">
                Scan with your smartphone camera to view menu & place order
              </p>
            </div>

            {/* QR Canvas */}
            <div className="bg-white p-3 rounded-2xl border border-[#EADBCA] shadow-inner inline-block mx-auto my-2">
              <canvas ref={canvasRef} className="w-48 h-48 mx-auto" />
            </div>

            {/* Footer Tag */}
            <div className="mt-3 pt-3 border-t border-[#F0E4D3] text-[11px] text-[#735A53]">
              <p className="font-semibold text-[#5A1724]">No app download required</p>
              <p className="text-[10px] text-[#93786F] mt-0.5">Sector 8, Ambala, Haryana</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-4 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download size={15} className="text-[#C99A3D]" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-[#FFFDF9] hover:bg-[#F3E7D5] text-[#5A1724] border-2 border-[#5A1724] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-all"
            >
              <Printer size={15} />
              <span>Print Table Card</span>
            </button>
          </div>

          {/* URL Copy link */}
          <div className="w-full mt-4 pt-3 border-t border-[#F0E4D3] flex items-center justify-between text-xs text-[#735A53] bg-[#FFF8ED] p-2.5 rounded-xl border border-[#EADBCA]">
            <span className="truncate max-w-[240px] text-[11px] font-mono text-left">{menuUrl}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="text-[#5A1724] hover:text-[#C99A3D] p-1 flex items-center gap-1 font-semibold"
                title="Copy URL"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#5A1724] hover:text-[#C99A3D] p-1"
                title="Open menu"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden container specifically for Browser Print Layout */}
      <div id="printable-qr-card" className="hidden print:flex flex-col items-center justify-center text-center p-8 bg-white max-w-md mx-auto border-4 border-[#5A1724] rounded-3xl">
        <div className="inline-block px-6 py-1.5 rounded-full bg-[#5A1724] text-[#C99A3D] text-lg font-black font-royal tracking-widest uppercase mb-4">
          RICH 'N' ROYAL CAFE
        </div>
        <h1 className="text-4xl font-black text-[#5A1724] font-royal my-2 tracking-wider">
          {table.tableName.toUpperCase()}
        </h1>
        <p className="text-base text-[#241A18] font-semibold mb-6">
          Scan to View Menu & Place Your Order
        </p>
        
        {qrDataUrl && (
          <div className="p-4 border-2 border-dashed border-[#5A1724] rounded-2xl inline-block bg-white my-2">
            <img src={qrDataUrl} alt={`${table.tableName} QR`} className="w-72 h-72 mx-auto" />
          </div>
        )}

        <div className="mt-6 text-sm text-[#241A18] space-y-1">
          <p className="font-bold text-[#5A1724]">No login or app required • Instant Table Ordering</p>
          <p className="text-xs text-stone-600">Huda Ground, near HP Petrol Pump, Sector 8, Ambala, Haryana</p>
        </div>
      </div>
    </>
  );
};
