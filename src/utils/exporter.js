import * as XLSX from 'xlsx';

/**
 * Format angka ke format Rupiah (contoh: Rp 150.000 atau -Rp 177.200)
 */
export function formatRupiah(value) {
  if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
  const num = Number(value);
  if (num < 0) {
    return '-Rp ' + Math.abs(num).toLocaleString('id-ID');
  }
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Format angka ribuan biasa tanpa 'Rp' (contoh: 150.000)
 */
export function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return Number(value).toLocaleString('id-ID');
}

/**
 * Export data ringkasan ke file Excel (.xlsx) dengan SheetJS
 */
export function exportToExcel(reportData, customFileName = '') {
  if (!reportData || !reportData.summary) return;

  const dateStr = reportData.metadata?.tanggal || 'Rekap';
  const outlet = reportData.metadata?.outlet || 'HuyCha';
  const defaultFileName = `HuyCha_Rekap_Penjualan_${outlet}_${dateStr}.xlsx`;
  const fileName = customFileName || defaultFileName;

  // Siapkan baris header dan metadata
  const wsData = [
    ['LAPORAN RANGKUMAN PENJUALAN PRODUK - HUYCHA'],
    [`Outlet: ${outlet}`, '', '', `Tanggal: ${dateStr}`],
    [`Dibuat pada: ${new Date().toLocaleString('id-ID')}`],
    [], // Baris kosong
    [
      'No',
      'Nama Produk (Bersih)',
      'Ukuran',
      'Kategori',
      'Jumlah Terjual (Cup)',
      'Penjualan Kotor (Rp)',
      'Diskon (Rp)',
      'Penjualan Bersih / Total (Rp)',
      'Harga Rata-rata / Cup (Rp)',
      'Kontribusi Penjualan (%)',
      'Jumlah Varian Rasa Asal'
    ]
  ];

  // Masukkan data produk
  reportData.summary.forEach((item, index) => {
    wsData.push([
      index + 1,
      item.productName,
      item.size || '-',
      item.category || 'Minuman',
      item.qty,
      item.grossSales,
      item.discount,
      item.netSales,
      item.avgPrice,
      `${item.contributionPct}%`,
      item.variations ? item.variations.length : 1
    ]);
  });

  // Baris Total Akumulasi Produk
  wsData.push([]);
  wsData.push([
    'TOTAL AKUMULASI PRODUK',
    '',
    '',
    '',
    reportData.totals.qty,
    reportData.totals.gross,
    reportData.totals.discount,
    reportData.totals.net,
    reportData.totals.qty > 0 ? Math.round(reportData.totals.net / reportData.totals.qty) : 0,
    '100%',
    reportData.metadata?.totalRawItems || ''
  ]);

  // Tambahkan catatan rekonsiliasi jika ada perbedaan dengan baris Grand Total asli POS
  if (reportData.reconciliation && reportData.reconciliation.hasDifference) {
    const rec = reportData.reconciliation;
    wsData.push([]);
    wsData.push(['CATATAN REKONSILIASI DENGAN FILE POS ASLI:']);
    wsData.push([
      '• Baris Grand Total bawaan file POS:',
      '',
      '',
      '',
      rec.posRecorded.qty,
      rec.posRecorded.gross,
      rec.posRecorded.discount,
      rec.posRecorded.net,
      '',
      '',
      'Data Nota Kasir POS'
    ]);
    wsData.push([
      '• Selisih Transaksi / Diskon Nota Global:',
      '',
      '',
      '',
      rec.diff.qty,
      rec.diff.gross,
      rec.diff.discount,
      rec.diff.net,
      '',
      '',
      'Diskon/Penyesuaian Nota'
    ]);
  }

  // Buat Worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Atur lebar kolom agar rapi
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 38 }, // Nama Produk
    { wch: 10 }, // Ukuran
    { wch: 15 }, // Kategori
    { wch: 20 }, // Terjual
    { wch: 22 }, // Penjualan Kotor
    { wch: 16 }, // Diskon
    { wch: 28 }, // Penjualan Bersih
    { wch: 25 }, // Rata-rata / Cup
    { wch: 24 }, // Kontribusi
    { wch: 26 }  // Varian Asal
  ];

  // Buat Workbook dan simpan
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rangkuman Produk');
  XLSX.writeFile(wb, fileName);
}

/**
 * Export data ringkasan ke CSV
 */
export function exportToCSV(reportData, customFileName = '') {
  if (!reportData || !reportData.summary) return;

  const dateStr = reportData.metadata?.tanggal || 'Rekap';
  const outlet = reportData.metadata?.outlet || 'HuyCha';
  const defaultFileName = `HuyCha_Rekap_Penjualan_${outlet}_${dateStr}.csv`;
  const fileName = customFileName || defaultFileName;

  const headers = [
    'No',
    'Nama Produk',
    'Ukuran',
    'Kategori',
    'Terjual',
    'Penjualan Kotor',
    'Diskon',
    'Total Bersih',
    'Rata-rata Cup',
    'Kontribusi %'
  ];

  const rows = reportData.summary.map((item, index) => [
    index + 1,
    `"${item.productName.replace(/"/g, '""')}"`,
    `"${item.size || '-'}"`,
    `"${item.category || '-'}"`,
    item.qty,
    item.grossSales,
    item.discount,
    item.netSales,
    item.avgPrice,
    `${item.contributionPct}%`
  ]);

  // Grand Total
  rows.push([
    'TOTAL',
    'TOTAL AKUMULASI PRODUK',
    '-',
    '-',
    reportData.totals.qty,
    reportData.totals.gross,
    reportData.totals.discount,
    reportData.totals.net,
    reportData.totals.qty > 0 ? Math.round(reportData.totals.net / reportData.totals.qty) : 0,
    '100%'
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Format ringkasan ke teks pesan WhatsApp yang rapi
 */
export function formatWhatsAppMessage(reportData, notes = '') {
  if (!reportData || !reportData.summary) return '';

  const outlet = reportData.metadata?.outlet || 'HuyCha';
  const tanggal = reportData.metadata?.tanggal || 'Hari Ini';
  const totals = reportData.totals;
  const summary = reportData.summary;

  let msg = `📊 *LAPORAN PENJUALAN HUYCHA*\n`;
  msg += `🏪 *Outlet:* ${outlet}\n`;
  msg += `📅 *Tanggal:* ${tanggal}\n`;
  if (notes) {
    msg += `📝 *Catatan:* ${notes}\n`;
  }
  msg += `------------------------------------\n\n`;

  // Top 5 Best Sellers
  msg += `🏆 *PRODUK TERLARIS (TOP 5):*\n`;
  const topList = summary.slice(0, 5);
  topList.forEach((p, idx) => {
    msg += `${idx + 1}. *${p.productName}*: ${formatNumber(p.qty)} cup (${formatRupiah(p.netSales)})\n`;
  });

  msg += `\n📋 *DAFTAR LENGKAP PRODUK:*\n`;
  summary.forEach((p, idx) => {
    msg += `${idx + 1}. ${p.productName} 👉 ${formatNumber(p.qty)} cup | ${formatRupiah(p.netSales)}\n`;
  });

  msg += `\n------------------------------------\n`;
  msg += `💰 *RINGKASAN TOTAL PENJUALAN:*\n`;
  msg += `• Total Terjual: *${formatNumber(totals.qty)} cup*\n`;
  msg += `• Penjualan Kotor: ${formatRupiah(totals.gross)}\n`;
  msg += `• Total Diskon: ${formatRupiah(totals.discount)}\n`;
  msg += `• Penjualan Bersih (Net): *${formatRupiah(totals.net)}*\n`;
  const avgCup = totals.qty > 0 ? Math.round(totals.net / totals.qty) : 0;
  msg += `• Rata-rata per Cup: ${formatRupiah(avgCup)}\n`;
  msg += `• Ringkasan: Dari ${reportData.metadata?.totalRawItems || '-'} baris kustomisasi disederhanakan menjadi *${summary.length} produk*\n`;

  // Catatan rekonsiliasi jika file POS asli memiliki perbedaan nota
  if (reportData.reconciliation && reportData.reconciliation.hasDifference) {
    const rec = reportData.reconciliation;
    msg += `\n📌 *Audit POS:* Penjumlahan riil item = ${formatNumber(rec.productSum.qty)} cup (${formatRupiah(rec.productSum.net)}). Baris Grand Total nota POS = ${formatNumber(rec.posRecorded.qty)} cup (${formatRupiah(rec.posRecorded.net)}), selisih nota = ${formatNumber(rec.diff.qty)} cup (${formatRupiah(rec.diff.net)}).\n`;
  }

  msg += `------------------------------------\n`;
  msg += `_Laporan dibuat otomatis dengan HuyCha Sales Summarizer_ 🧋`;

  return msg;
}
