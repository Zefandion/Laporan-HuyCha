import React from 'react';
import { CupSoda, DollarSign, Tag, TrendingUp, Layers, Calendar, Store, Sparkles } from 'lucide-react';
import { formatRupiah, formatNumber } from '../utils/exporter';

export default function SummaryStats({ reportData }) {
  if (!reportData) return null;

  const { metadata, totals, summary } = reportData;
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
          <p className="text-xs text-stone-500 mt-1">Omset bersih setelah diskon</p>
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
          <p className="text-xs text-stone-500 mt-1">Potongan harga / promosi</p>
        </div>
      </div>

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
