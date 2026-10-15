import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronRight, Layers, Coffee } from 'lucide-react';
import { formatRupiah, formatNumber } from '../utils/exporter';

export default function ProductTable({ summary, totals }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('qty_desc');
  const [expandedId, setExpandedId] = useState(null);

  // Daftar kategori unik
  const categories = useMemo(() => {
    if (!summary) return [];
    const set = new Set(summary.map(item => item.category).filter(Boolean));
    return Array.from(set);
  }, [summary]);

  // Filter & Urutan
  const filteredAndSortedList = useMemo(() => {
    if (!summary) return [];

    let list = summary.filter(item => {
      const matchSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'qty_desc':
          return b.qty - a.qty;
        case 'qty_asc':
          return a.qty - b.qty;
        case 'net_desc':
          return b.netSales - a.netSales;
        case 'net_asc':
          return a.netSales - b.netSales;
        case 'name_asc':
          return a.productName.localeCompare(b.productName);
        case 'name_desc':
          return b.productName.localeCompare(a.productName);
        default:
          return b.qty - a.qty;
      }
    });

    return list;
  }, [summary, searchQuery, selectedCategory, sortBy]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (!summary || summary.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
      {/* Header Tabel & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-stone-50/60 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <span>Daftar Rangkuman Produk</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-semibold">
                {filteredAndSortedList.length} dari {summary.length} jenis
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Klik nama produk atau ikon panah untuk melihat rincian varian gula/es asli.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Input Pencarian */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            {/* Filter Kategori */}
            {categories.length > 1 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-stone-700"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Pengurutan */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-stone-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-stone-700"
              >
                <option value="qty_desc">Terjual Terbanyak</option>
                <option value="qty_asc">Terjual Tersedikit</option>
                <option value="net_desc">Omset Tertinggi</option>
                <option value="net_asc">Omset Terendah</option>
                <option value="name_asc">Nama (A - Z)</option>
                <option value="name_desc">Nama (Z - A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">No</th>
              <th className="py-3 px-4">Nama Produk (Bersih)</th>
              <th className="py-3 px-3 text-center">Ukuran</th>
              <th className="py-3 px-3 text-center">Kategori</th>
              <th className="py-3 px-3 text-right">Terjual (Cup)</th>
              <th className="py-3 px-3 text-right">Penjualan Kotor</th>
              <th className="py-3 px-3 text-right">Diskon</th>
              <th className="py-3 px-4 text-right">Total Bersih</th>
              <th className="py-3 px-3 text-right">Rata-rata</th>
              <th className="py-3 px-4 text-center">Kontribusi</th>
              <th className="py-3 px-3 text-center no-print">Varian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {filteredAndSortedList.map((item, index) => {
              const isExpanded = expandedId === item.id;
              const hasVariations = item.variations && item.variations.length > 0;

              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => hasVariations && toggleExpand(item.id)}
                    className={`hover:bg-amber-50/40 transition cursor-pointer ${
                      isExpanded ? 'bg-amber-50/50 font-medium' : index % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'
                    }`}
                  >
                    {/* Nomor */}
                    <td className="py-3 px-3 text-center text-xs text-stone-400 font-mono">
                      {index + 1}
                    </td>

                    {/* Nama Produk Bersih */}
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-2">
                        {hasVariations && (
                          <span className="text-stone-400 hover:text-amber-700 no-print">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-600" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        )}
                        <span>{item.productName}</span>
                      </div>
                    </td>

                    {/* Ukuran */}
                    <td className="py-3 px-3 text-center">
                      {item.size !== '-' ? (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-mono font-medium border border-stone-200">
                          {item.size}
                        </span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-3 text-center text-xs text-stone-500">
                      {item.category}
                    </td>

                    {/* Terjual */}
                    <td className="py-3 px-3 text-right font-bold text-stone-900 font-mono">
                      {formatNumber(item.qty)}
                    </td>

                    {/* Kotor */}
                    <td className="py-3 px-3 text-right text-stone-500 text-xs font-mono">
                      {formatRupiah(item.grossSales)}
                    </td>

                    {/* Diskon */}
                    <td className="py-3 px-3 text-right text-rose-500 text-xs font-mono">
                      {item.discount !== 0 ? formatRupiah(item.discount) : '-'}
                    </td>

                    {/* Total Bersih */}
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700 font-mono text-sm">
                      {formatRupiah(item.netSales)}
                    </td>

                    {/* Rata-rata */}
                    <td className="py-3 px-3 text-right text-stone-500 text-xs font-mono">
                      {formatRupiah(item.avgPrice)}
                    </td>

                    {/* Kontribusi Pct */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-stone-700">{item.contributionPct}%</span>
                        <div className="w-16 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, item.contributionPct * 3)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Tombol Varian */}
                    <td className="py-3 px-3 text-center no-print">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100/80 text-amber-800">
                        <Layers className="w-3 h-3" />
                        <span>{item.variations.length}</span>
                      </span>
                    </td>
                  </tr>

                  {/* Baris Rincian Varian ketika Diklik */}
                  {isExpanded && (
                    <tr className="bg-amber-50/70 border-y border-amber-200">
                      <td colSpan={11} className="p-4 pl-12">
                        <div className="bg-white rounded-xl border border-amber-200/80 p-3 shadow-xs">
                          <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-100">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-amber-600" />
                              <span>Rincian {item.variations.length} Varian Gula & Es Asal POS yang Digabungkan:</span>
                            </span>
                            <span className="text-xs text-stone-500">
                              Total varian di bawah ini menghasilkan {item.qty} cup
                            </span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            {item.variations.map((v, vIdx) => (
                              <div
                                key={vIdx}
                                className="flex items-center justify-between py-1 px-2 rounded-lg bg-stone-50 hover:bg-stone-100/80 transition"
                              >
                                <span className="font-mono text-stone-700 font-medium">
                                  {v.originalName}
                                </span>
                                <div className="flex items-center gap-4 text-stone-600">
                                  <span className="font-bold text-stone-900">{v.qty} Cup</span>
                                  <span className="text-emerald-700 font-semibold">{formatRupiah(v.net)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Baris Total Footer */}
          <tfoot>
            <tr className="border-t-2 border-stone-300 bg-stone-100 font-bold text-stone-900">
              <td colSpan={4} className="py-4 px-4 text-left uppercase tracking-wider text-xs font-extrabold">
                TOTAL KESELURUHAN ({filteredAndSortedList.length} Produk)
              </td>
              <td className="py-4 px-3 text-right font-extrabold text-stone-900 font-mono text-base">
                {formatNumber(totals.qty)}
              </td>
              <td className="py-4 px-3 text-right text-stone-600 font-mono text-xs">
                {formatRupiah(totals.gross)}
              </td>
              <td className="py-4 px-3 text-right text-rose-600 font-mono text-xs">
                {formatRupiah(totals.discount)}
              </td>
              <td className="py-4 px-4 text-right font-extrabold text-emerald-700 font-mono text-base">
                {formatRupiah(totals.net)}
              </td>
              <td className="py-4 px-3 text-right text-stone-600 font-mono text-xs">
                {totals.qty > 0 ? formatRupiah(Math.round(totals.net / totals.qty)) : '-'}
              </td>
              <td className="py-4 px-4 text-center font-bold text-xs text-stone-600">
                100%
              </td>
              <td className="py-4 px-3 no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
