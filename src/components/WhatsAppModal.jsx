import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react';
import { formatWhatsAppMessage } from '../utils/exporter';

export default function WhatsAppModal({ isOpen, onClose, reportData }) {
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (reportData) {
      setMessageText(formatWhatsAppMessage(reportData, customNote));
    }
  }, [reportData, customNote]);

  if (!isOpen || !reportData) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span>Format Pesan WhatsApp</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-4 overflow-y-auto space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tambah Catatan Tambahan (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Omset meningkat 20%, promo lancar..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-green-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Pratinjau Pesan yang Siap Dikirim:
            </label>
            <textarea
              readOnly
              rows={12}
              value={messageText}
              className="w-full p-3 text-xs font-mono bg-stone-900 text-stone-100 rounded-xl resize-none focus:outline-hidden leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Tombol */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-200/60 transition"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-xs transition"
              title="Buka langsung di WhatsApp"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka WA Web</span>
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
