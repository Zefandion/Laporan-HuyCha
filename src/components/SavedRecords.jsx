import React, { useState } from 'react';
import { History, Calendar, Store, Trash2, Edit3, Eye, FileSpreadsheet, Download, Upload, Check, AlertCircle, Sparkles } from 'lucide-react';
import { formatRupiah, formatNumber, exportToExcel } from '../utils/exporter';
import { updateReportNotes, deleteSavedReport, exportBackupJSON, importBackupJSON, clearAllSavedReports } from '../utils/storage';

export default function SavedRecords({
  savedReports,
  onRefreshHistory,
  onLoadReport
}) {
  const [editingId, setEditingId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const handleStartEdit = (report) => {
    setEditingId(report.id);
    setEditNoteText(report.notes || '');
  };

  const handleSaveEdit = (reportId) => {
    updateReportNotes(reportId, editNoteText);
    setEditingId(null);
    onRefreshHistory();
  };

  const handleDelete = (reportId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan laporan ini?')) {
      deleteSavedReport(reportId);
      onRefreshHistory();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA catatan riwayat laporan?')) {
      clearAllSavedReports();
      onRefreshHistory();
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importBackupJSON(event.target.result);
        setImportStatus('Backup berhasil diimpor!');
        onRefreshHistory();
        setTimeout(() => setImportStatus(''), 3000);
      } catch (err) {
        alert('Gagal mengimpor file backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (!savedReports || savedReports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-3xl">
          🧋
        </div>
        <h3 className="text-lg font-bold text-stone-900">Belum Ada Catatan Riwayat</h3>
        <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
          Setelah Anda merangkum laporan penjualan di tab "Rangkuman", klik tombol <b>"Simpan ke Catatan Riwayat"</b> untuk mencatat dan menyimpan rekap harian Anda di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar Atas Riwayat */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-700" />
          <h2 className="font-bold text-stone-900 text-base">
            Catatan Riwayat Laporan ({savedReports.length} Laporan Tersimpan)
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Backup */}
          <button
            onClick={exportBackupJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition"
            title="Download backup seluruh riwayat catatan ke file JSON"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Backup Data (JSON)</span>
          </button>

          {/* Tombol Restore */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Pulihkan Backup</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          {/* Hapus Semua */}
          <button
            onClick={handleClearAll}
            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Hapus semua riwayat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Grid Kartu Laporan Tersimpan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedReports.map((report) => {
          const isEditing = editingId === report.id;

          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
            >
              <div>
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>{report.metadata?.outlet || 'HuyCha'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-base font-extrabold text-stone-900 mt-0.5">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <span>{report.metadata?.tanggal || 'Tanpa Tanggal'}</span>
                    </div>
                  </div>

                  <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                    {report.summary?.length || 0} Produk
                  </span>
                </div>

                {/* Ringkasan Angka */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div>
                    <span className="text-stone-400 text-xs block">Terjual</span>
                    <span className="text-stone-900 font-extrabold text-base">
                      {formatNumber(report.totals?.qty)} <span className="text-xs font-medium text-stone-500">cup</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-xs block">Total Bersih</span>
                    <span className="text-emerald-700 font-extrabold text-base">
                      {formatRupiah(report.totals?.net)}
                    </span>
                  </div>
                </div>

                {/* Bagian Catatan */}
                <div className="text-xs text-stone-600 mb-4">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <textarea
                        rows={2}
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        placeholder="Tulis catatan untuk hari ini..."
                        className="w-full p-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleSaveEdit(report.id)}
                          className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1 group">
                      <p className="italic text-stone-500">
                        {report.notes ? `"${report.notes}"` : 'Tidak ada catatan harian.'}
                      </p>
                      <button
                        onClick={() => handleStartEdit(report)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-amber-700 p-1 transition"
                        title="Edit Catatan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Bawah */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onLoadReport(report)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Rangkuman</span>
                </button>

                <button
                  onClick={() => exportToExcel(report)}
                  className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition"
                  title="Download Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition"
                  title="Hapus Catatan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
