import React, { useState } from 'react';
import { Download, FileSpreadsheet, Share2, Printer, BookmarkPlus, RefreshCw, Check, MessageSquare } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../utils/exporter';

export default function ActionToolbar({
  reportData,
  onSaveReport,
  onReset,
  onOpenWhatsAppModal
}) {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [dailyNote, setDailyNote] = useState('');

  if (!reportData) return null;

  const handleSave = () => {
    onSaveReport(dailyNote);
    setSaveSuccess(true);
    setShowNoteInput(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs no-print space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Grup Tombol Simpan & Catat */}
        <div className="flex items-center gap-2">
          {!showNoteInput ? (
            <button
              onClick={() => setShowNoteInput(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan di Riwayat!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Simpan ke Catatan Riwayat</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Tambah catatan harian (misal: Hujan, Promo 20%, dll)..."
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 w-64 sm:w-80 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowNoteInput(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs sm:text-sm transition"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        {/* Grup Export & Aksi */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Download Excel */}
          <button
            onClick={() => exportToExcel(reportData)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium transition shadow-xs"
            title="Download file Excel .xlsx yang sudah rapi dan bersih"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={() => exportToCSV(reportData)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-medium transition"
            title="Download dalam format CSV"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>CSV</span>
          </button>

          {/* Salin WA */}
          <button
            onClick={onOpenWhatsAppModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium transition shadow-xs"
            title="Salin rekap siap kirim ke grup WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Format WhatsApp</span>
          </button>

          {/* Cetak */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-medium transition"
            title="Cetak laporan langsung atau simpan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Cetak / PDF</span>
          </button>

          {/* Reset / Ganti File */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-medium transition"
            title="Muat laporan baru"
          >
            <RefreshCw className="w-4 h-4 text-stone-500" />
            <span>Upload File Lain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
