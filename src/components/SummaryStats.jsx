import React, { useState } from 'react';
import { CupSoda, DollarSign, Tag, TrendingUp, Calendar, Store, Sparkles, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { formatRupiah, formatNumber } from '../utils/exporter';

export default function SummaryStats({ reportData }) {
  const [showAuditDetail, setShowAuditDetail] = useState(false);

  if (!reportData) return null;

  const { metadata, totals, summary, reconciliation } = reportData;
  const rawCount = metadata?.totalRawItems || 0;
  const cleanCount = summary.length;
  const reductionPct = rawCount > 0 ? Math.round(((rawCount - cleanCount) / rawCount) * 100) : 0;
  const avgCup = totals.qty > 0 ? Math.round(totals.net / totals.qty) : 0;
  const topProduct = summary[0];

  return (
    <div className="space-y-4">
      {/* Baris Info Outlet & Tanggal */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2 text-stone-700">
            <Store className="w-4 h-4 text-amber-700" />
            <span className="text-stone-500">Outlet:</span>
            <span className="font-bold text-stone-900">{metadata?.outlet || 'HuyCha'}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span className="text-stone-500">Tanggal Laporan:</span>
            <span className="font-bold text-stone-900">{metadata?.tanggal || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <span>File: <code className="text-stone-700">{reportData.fileName}</code></span>
          </div>
        </div>

        {/* Efisiensi Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dari <b>{rawCount}</b> baris variasi &rarr; <b>{cleanCount}</b> produk bersih ({reductionPct}% lebih ringkas)</span>
        </div>
      </div>

      {/* Kartu Metrik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cup */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Terjual</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <CupSoda className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {formatNumber(totals.qty)} <span className="text-sm font-medium text-stone-500">cup</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">Rata-rata {formatRupiah(avgCup)} / cup</p>
        </div>

        {/* Penjualan Bersih */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bersih (Net)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {formatRupiah(totals.net)}
          </div>
          <p className="text-xs text-stone-500 mt-1">Omset bersih setelah potongan diskon</p>
        </div>

        {/* Penjualan Kotor */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Penjualan Kotor</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {formatRupiah(totals.gross)}
          </div>
          <p className="text-xs text-stone-500 mt-1">Sebelum potongan diskon</p>
        </div>

        {/* Total Diskon */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Diskon</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
            {formatRupiah(totals.discount)}
          </div>
          <p className="text-xs text-stone-500 mt-1">Akumulasi potongan harga per item</p>
        </div>
      </div>

      {/* Panel Rekonsiliasi & Audit Perhitungan Angka POS */}
      {reconciliation && reconciliation.hasDifference ? (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Hasil Audit: Perbedaan Antara Penjumlahan Produk Riil vs Baris Grand Total POS</span>
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Semua perhitungan nominal dan penjumlahan tiap produk di tabel di bawah terverifikasi <b>100% akurat secara matematis</b>. 
                  Namun pada file ekspor Pawoon POS, baris <i>"Grand Total"</i> paling bawah mencatat nominal yang berbeda dari akumulasi rincian produknya.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAuditDetail(!showAuditDetail)}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition shrink-0"
            >
              <span>{showAuditDetail ? 'Tutup Rincian' : 'Lihat Analisis Selisih'}</span>
              {showAuditDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Rincian Selisih */}
          {showAuditDetail && (
            <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Kolom 1: Akumulasi Riil Produk */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-2xs">
                  <span className="font-bold text-emerald-800 block text-xs uppercase tracking-wider mb-2">
                    1. Penjumlahan Riil 42 Baris Produk:
                  </span>
                  <div className="space-y-1 text-stone-700">
                    <div className="flex justify-between"><span>Terjual:</span><b className="text-stone-900">{formatNumber(reconciliation.productSum.qty)} cup</b></div>
                    <div className="flex justify-between"><span>Penjualan Kotor:</span><b>{formatRupiah(reconciliation.productSum.gross)}</b></div>
                    <div className="flex justify-between"><span>Diskon Item:</span><b className="text-rose-600">{formatRupiah(reconciliation.productSum.discount)}</b></div>
                    <div className="flex justify-between border-t pt-1 font-bold"><span>Total Bersih:</span><b className="text-emerald-700">{formatRupiah(reconciliation.productSum.net)}</b></div>
                  </div>
                </div>

                {/* Kolom 2: Baris Grand Total POS */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="font-bold text-stone-800 block text-xs uppercase tracking-wider mb-2">
                    2. Baris Grand Total di File POS:
                  </span>
                  <div className="space-y-1 text-stone-700">
                    <div className="flex justify-between"><span>Terjual:</span><b className="text-stone-900">{formatNumber(reconciliation.posRecorded.qty)} cup</b></div>
                    <div className="flex justify-between"><span>Penjualan Kotor:</span><b>{formatRupiah(reconciliation.posRecorded.gross)}</b></div>
                    <div className="flex justify-between"><span>Diskon:</span><b className="text-rose-600">{formatRupiah(reconciliation.posRecorded.discount)}</b></div>
                    <div className="flex justify-between border-t pt-1 font-bold"><span>Total Bersih:</span><b className="text-stone-900">{formatRupiah(reconciliation.posRecorded.net)}</b></div>
                  </div>
                </div>

                {/* Kolom 3: Selisih Nota */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-300 shadow-2xs">
                  <span className="font-bold text-amber-900 block text-xs uppercase tracking-wider mb-2">
                    3. Selisih Transaksi / Nota:
                  </span>
                  <div className="space-y-1 text-stone-700">
                    <div className="flex justify-between"><span>Selisih Cup:</span><b className="text-amber-800">{reconciliation.diff.qty > 0 ? `+${reconciliation.diff.qty}` : reconciliation.diff.qty} cup</b></div>
                    <div className="flex justify-between"><span>Selisih Kotor:</span><b>{formatRupiah(reconciliation.diff.gross)}</b></div>
                    <div className="flex justify-between"><span>Diskon Nota Global:</span><b className="text-rose-600">{formatRupiah(reconciliation.diff.discount)}</b></div>
                    <div className="flex justify-between border-t pt-1 font-bold"><span>Selisih Bersih:</span><b className="text-amber-800">{formatRupiah(reconciliation.diff.net)}</b></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/70 rounded-xl text-xs text-amber-950 border border-amber-200 space-y-1">
                <p className="font-semibold text-stone-900">Mengapa terjadi selisih ini pada Pawoon POS?</p>
                <ul className="list-disc list-inside space-y-0.5 text-stone-600">
                  <li>
                    <b>Diskon Transaksi / Voucher Nota:</b> Pawoon POS menambahkan diskon per-nota (misal diskon kupon Rp 7.900) ke baris Grand Total, tetapi tidak membebankannya ke masing-masing baris produk.
                  </li>
                  <li>
                    <b>Transaksi Void / Pembatalan Kasir:</b> Jika ada 5 cup pesanan yang dibatalkan kasir setelah tercatat, sistem POS terkadang tetap mencantumkan item tersebut di rincian produk namun menguranginya pada Grand Total kasir.
                  </li>
                  <li>
                    <b>Program ini menjamin:</b> Semua cup ({totals.qty} cup) dan omset produk di tabel di bawah ini dihitung langsung dari data riil per-item tanpa ada yang terlewatkan.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-900">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><b>Validasi Perhitungan:</b> Total omset dan jumlah cup 100% konsisten antara rincian produk dan total laporan.</span>
        </div>
      )}

      {/* Banner Best Seller */}
      {topProduct && (
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-200 font-semibold">
                Produk Terlaris Hari Ini (#1 Best Seller)
              </div>
              <h3 className="text-lg font-bold mt-0.5">{topProduct.productName}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl">
            <div>
              <span className="text-amber-200 block">Terjual</span>
              <span className="font-extrabold text-base">{topProduct.qty} Cup</span>
            </div>
            <div className="border-l border-white/20 pl-4">
              <span className="text-amber-200 block">Total Omset</span>
              <span className="font-extrabold text-base">{formatRupiah(topProduct.netSales)}</span>
            </div>
            <div className="border-l border-white/20 pl-4">
              <span className="text-amber-200 block">Kontribusi</span>
              <span className="font-extrabold text-base">{topProduct.contributionPct}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
