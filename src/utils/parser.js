import * as XLSX from 'xlsx';

/**
 * Membersihkan nama produk dari atribut kustomisasi seperti sugar level dan ice level.
 * Contoh:
 * "Roasted Smoky Oolong Milk Tea - 16 oz - 100% - 70%" -> "Roasted Smoky Oolong Milk Tea - 16 oz"
 * "Osmanthus Oolong Milk Tea - 16 oz - 100% - 0%"     -> "Osmanthus Oolong Milk Tea - 16 oz"
 */
export function cleanProductName(rawName, options = {}) {
  if (!rawName || typeof rawName !== 'string') return '';
  let cleaned = rawName.trim();

  // 1. Bersihkan akhiran persentase berantai (misal: " - 100% - 70%", " - 50% - 30%")
  // Bisa disertai teks opsional seperti Sugar / Ice / Es / Gula
  cleaned = cleaned.replace(/(\s*[-/|]\s*\d+%\s*(sugar|ice|es|gula)?\s*)+$/i, '');

  // 2. Bersihkan format kurung persentase (misal: "(100% - 70%)" atau "(100%, 70%)")
  cleaned = cleaned.replace(/\s*\(\s*(\d+%\s*(sugar|ice|es|gula)?\s*[,/-]?\s*)+\)$/i, '');

  // 3. Bersihkan sisa persentase di ujung jika ada
  cleaned = cleaned.replace(/\s*[-/|]\s*\d+%\s*$/i, '');

  // 4. Opsi tambahan jika ingin menggabungkan ukuran (16 oz / 22 oz)
  if (options.stripSize) {
    cleaned = cleaned.replace(/\s*[-/|]\s*\d+\s*(oz|ml|l|cup|medium|large|regular|small)\b/i, '');
  }

  return cleaned.trim();
}

/**
 * Mengekstrak informasi ukuran (oz, ml, dll) jika ada di nama produk
 */
export function extractProductSize(rawName) {
  if (!rawName) return null;
  const match = rawName.match(/\b(\d+\s*(oz|ml|l))\b/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Mengagregasi ulang array rawItems berdasarkan opsi pembersihan terbaru
 */
export function reAggregateReportData(existingReport, options) {
  if (!existingReport || !existingReport.rawItems) return existingReport;

  const aggregatedMap = new Map();
  const rawItems = existingReport.rawItems;
  const totalNet = existingReport.totals.net;
  const totalQty = existingReport.totals.qty;

  for (const item of rawItems) {
    const cleanName = cleanProductName(item.originalName, options);
    const size = extractProductSize(cleanName);

    if (!aggregatedMap.has(cleanName)) {
      aggregatedMap.set(cleanName, {
        id: `prod-${aggregatedMap.size + 1}`,
        productName: cleanName,
        category: item.category,
        size: size || '-',
        qty: 0,
        grossSales: 0,
        discount: 0,
        netSales: 0,
        avgPrice: 0,
        variations: []
      });
    }

    const agg = aggregatedMap.get(cleanName);
    agg.qty += item.qty;
    agg.grossSales += item.gross;
    agg.discount += item.discount;
    agg.netSales += item.net;
    agg.variations.push({
      originalName: item.originalName,
      qty: item.qty,
      gross: item.gross,
      discount: item.discount,
      net: item.net
    });
  }

  const summaryList = Array.from(aggregatedMap.values()).map(item => {
    const avgPrice = item.qty > 0 ? Math.round(item.netSales / item.qty) : 0;
    const contributionPct = totalNet > 0 ? ((item.netSales / totalNet) * 100) : 0;
    const qtyPct = totalQty > 0 ? ((item.qty / totalQty) * 100) : 0;
    return {
      ...item,
      avgPrice,
      contributionPct: Number(contributionPct.toFixed(2)),
      qtyPct: Number(qtyPct.toFixed(2))
    };
  });

  summaryList.sort((a, b) => b.qty - a.qty);

  return {
    ...existingReport,
    metadata: {
      ...existingReport.metadata,
      uniqueProductsCount: summaryList.length
    },
    summary: summaryList
  };
}

/**
 * Membaca ArrayBuffer atau File dan mengembalikan struktur data terurai
 */
export async function parseSalesReportFile(file, options = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Baca sebagai array 2D
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rows || rows.length === 0) {
          throw new Error('File excel kosong atau tidak memiliki data yang valid.');
        }

        // Cari metadata (Outlet, Tanggal, dll.)
        let outlet = 'HuyCha';
        let tanggal = '';
        let headerRowIndex = -1;

        for (let i = 0; i < Math.min(15, rows.length); i++) {
          const row = rows[i];
          const firstCol = String(row[0] || '').trim().toLowerCase();

          if (firstCol === 'outlet' && row[1]) {
            outlet = String(row[1]).trim();
          } else if (firstCol === 'tanggal' && row[1]) {
            tanggal = String(row[1]).trim();
          }

          // Cari baris header tabel penjualan
          const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
          if (rowStr.includes('nama produk') || (rowStr.includes('produk') && rowStr.includes('terjual'))) {
            headerRowIndex = i;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = rows.findIndex(r => r.some(c => String(c).toLowerCase().includes('terjual')));
          if (headerRowIndex === -1) headerRowIndex = 0;
        }

        const headers = rows[headerRowIndex].map(h => String(h || '').trim());
        
        // Pemetaan indeks kolom
        let idxName = headers.findIndex(h => /nama produk|produk|item/i.test(h));
        let idxCategory = headers.findIndex(h => /kategori|category/i.test(h));
        let idxQty = headers.findIndex(h => /terjual|qty|kuantitas|jumlah/i.test(h));
        let idxGross = headers.findIndex(h => /penjualan kotor|kotor|gross/i.test(h));
        let idxDiscount = headers.findIndex(h => /diskon|discount|potongan/i.test(h));
        let idxTotal = headers.findIndex(h => /total|net|bersih/i.test(h));

        // Fallback default jika pos Pawoon standar
        if (idxName === -1) idxName = 0;
        if (idxCategory === -1) idxCategory = 2;
        if (idxQty === -1) idxQty = 4;
        if (idxGross === -1) idxGross = 5;
        if (idxDiscount === -1) idxDiscount = 6;
        if (idxTotal === -1) idxTotal = 7;

        const rawItems = [];
        let totalRawQty = 0;
        let totalRawGross = 0;
        let totalRawDiscount = 0;
        let totalRawNet = 0;

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          const rawName = String(row[idxName] || '').trim();

          if (!rawName || /grand total|total keseluruhan/i.test(rawName)) {
            continue;
          }

          const category = String(row[idxCategory] || 'Minuman').trim() || 'Minuman';
          const qty = Number(row[idxQty]) || 0;
          const gross = Number(row[idxGross]) || 0;
          const discount = Number(row[idxDiscount]) || 0;
          const net = Number(row[idxTotal]) || (gross + discount);

          totalRawQty += qty;
          totalRawGross += gross;
          totalRawDiscount += discount;
          totalRawNet += net;

          rawItems.push({
            id: `raw-${i}`,
            originalName: rawName,
            category,
            qty,
            gross,
            discount,
            net
          });
        }

        // Jika tanggal tidak ditemukan di baris, coba ekstrak dari nama file
        if (!tanggal) {
          const fileDateMatch = file.name.match(/(\d{2}[-_.]\d{2}[-_.]\d{2,4})/);
          if (fileDateMatch) {
            tanggal = fileDateMatch[1].replace(/_/g, '-');
          } else {
            tanggal = new Date().toISOString().split('T')[0];
          }
        }

        const baseReport = {
          fileName: file.name,
          fileSize: file.size,
          lastModified: file.lastModified,
          metadata: {
            outlet,
            tanggal,
            totalRawItems: rawItems.length,
            uniqueProductsCount: 0
          },
          totals: {
            qty: totalRawQty,
            gross: totalRawGross,
            discount: totalRawDiscount,
            net: totalRawNet
          },
          summary: [],
          rawItems
        };

        // Agregasi
        const finalized = reAggregateReportData(baseReport, options);
        resolve(finalized);
      } catch (err) {
        console.error('Error parsing sales report:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
