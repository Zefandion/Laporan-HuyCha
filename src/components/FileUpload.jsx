import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Sparkles, Settings2, AlertCircle } from 'lucide-react';
import { parseSalesReportFile } from '../utils/parser';

export default function FileUpload({ onDataParsed, cleaningOptions, setCleaningOptions, isLoading, setIsLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setErrorMsg('');
    setIsLoading(true);

    try {
      const parsed = await parseSalesReportFile(file, cleaningOptions);
      onDataParsed(parsed);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal membaca file: ' + (err.message || 'Format file tidak didukung atau rusak.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Muat contoh laporan Pawoon yang disediakan
  const handleLoadSample = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await fetch('/sample-report.xls');
      if (!res.ok) throw new Error('Gagal memuat file contoh bawaan');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'Laporan_Penjualan_HuyCha_15-10-2026.xls', { type: blob.type });
      const parsed = await parseSalesReportFile(sampleFile, cleaningOptions);
      onDataParsed(parsed);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat file contoh: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
      {/* Opsi Pembersihan Produk */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60">
        <div className="flex items-center gap-2 mb-2 text-stone-800 font-semibold text-sm">
          <Settings2 className="w-4 h-4 text-amber-700" />
          <span>Aturan Pembersihan Nama Produk</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cleaningOptions.stripModifiers}
              disabled
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4 accent-amber-600"
            />
            <div>
              <span className="font-medium text-stone-900">Hapus Sugar & Ice Level (%)</span>
              <p className="text-stone-500 text-xs mt-0.5">
                Contoh: <code className="bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-900">...- 16 oz - 100% - 70%</code> &rarr; <code className="bg-white px-1 py-0.5 rounded border border-emerald-300 text-emerald-800 font-semibold">...- 16 oz</code>
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cleaningOptions.stripSize}
              onChange={(e) => setCleaningOptions({ ...cleaningOptions, stripSize: e.target.checked })}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4 accent-amber-600"
            />
            <div>
              <span className="font-medium text-stone-900">Gabungkan Ukuran Cup (16 oz & 22 oz)</span>
              <p className="text-stone-500 text-xs mt-0.5">
                Menggabungkan semua ukuran menjadi satu nama pokok produk tanpa membedakan cup.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Area Drag & Drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
            : 'border-stone-300 hover:border-amber-400 hover:bg-stone-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-base font-semibold text-stone-800">
              Tarik & Lepaskan File Laporan Penjualan di Sini
            </p>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Mendukung format file <span className="font-semibold text-stone-700">.xls</span> (Pawoon POS), <span className="font-semibold text-stone-700">.xlsx</span> (Excel), dan <span className="font-semibold text-stone-700">.csv</span>
            </p>
          </div>

          <button
            type="button"
            className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium transition shadow-xs"
          >
            Pilih File dari Komputer
          </button>
        </div>
      </div>

      {/* Tombol Contoh Laporan */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
        <span className="text-xs text-stone-500">
          Ingin mencoba langsung tanpa upload file sendiri?
        </span>
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Muat Contoh Laporan HuyCha (15-10-2026)</span>
        </button>
      </div>

      {/* Pesan Error */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
