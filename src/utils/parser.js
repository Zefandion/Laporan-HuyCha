import * as XLSX from 'xlsx';

/**
 * Parsing angka secara aman dari berbagai format:
 * - Integer / Float asli
 * - String format Indonesia: "1.828.000", "-177.200", "19.000,50"
 * - String format Akuntansi: "(177.200)" -> -177200
 * - String dengan simbol mata uang: "Rp 19.000", "IDR 50.000"
 */
export function parseSafeNumber(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();

  // Format akuntansi dalam kurung: (177.200) -> -177.200
  if (/^\(.*\)$/.test(str)) {
    str = '-' + str.slice(1, -1).trim();
  }

  // Bersihkan teks mata uang (Rp, IDR, $, dll) dan spasi berlebih
  str = str.replace(/^(Rp\.?|IDR|\$)\s*/i, '').trim();

  // Format ribuan titik Indonesia: 1.828.000 atau -177.200
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(str)) {
    // Format US: 1,828,000.00
    str = str.replace(/,/g, '');
  } else if (/^-?\d+,\d+$/.test(str)) {
    // Format desimal koma tunggal: 19000,5
    str = str.replace(',', '.');
  }

  const num = Number(str);
  return isNaN(num) ? 0 : num;
}

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
  // Bisa disertai kata opsional seperti Sugar / Ice / Es / Gula
  cleaned = cleaned.replace(/(\s*[-/|]\s*\d+%\s*(sugar|ice|es|gula)?\s*)+$/i, '');

  // 2. Bersihkan format kurung persentase (misal: "(100% - 70%)" atau "(100%, 70%)")
  cleaned = cleaned.replace(/\s*\(\s*(\d+%\s*(sugar|ice|es|gula)?\s*[,/-]?\s*)+\)$/i, '');

  // 3. Bersihkan sisa persentase di ujung jika ada
  cleaned = cleaned.replace(/\s*[-/|]\s*\d+%\s*$/i, '');

  // 4. Opsi tambahan jika pengguna ingin menggabungkan ukuran (16 oz / 22 oz)
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
    // Pembulatan harga rata-rata per cup
    const avgPrice = item.qty > 0 ? Math.round(item.netSales / item.qty) : 0;
    // Persentase kontribusi omset dan volume
    const contributionPct = totalNet > 0 ? Number(((item.netSales / totalNet) * 100).toFixed(2)) : 0;
    const qtyPct = totalQty > 0 ? Number(((item.qty / totalQty) * 100).toFixed(2)) : 0;

    return {
      ...item,
      avgPrice,
      contributionPct,
      qtyPct
    };
  });

  // Urutkan default berdasarkan jumlah cup terjual terbanyak (Best seller)
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

        // Fallback default jika posisi Pawoon standar
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

        // Simpan baris Grand Total asli dari file POS jika ada
        let posGrandTotal = null;

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          const rawName = String(row[idxName] || '').trim();

          if (!rawName) continue;

          // Cek apakah ini baris Grand Total bawaan file POS
          if (/grand total|total keseluruhan/i.test(rawName)) {
            posGrandTotal = {
              found: true,
              rowIndex: i + 1,
              label: rawName,
              qty: parseSafeNumber(row[idxQty]),
              gross: parseSafeNumber(row[idxGross]),
              discount: parseSafeNumber(row[idxDiscount]),
              net: parseSafeNumber(row[idxTotal])
            };
            continue;
          }

          const category = String(row[idxCategory] || 'Minuman').trim() || 'Minuman';
          const qty = parseSafeNumber(row[idxQty]);
          const gross = parseSafeNumber(row[idxGross]);
          const discount = parseSafeNumber(row[idxDiscount]);

          // Tentukan Net secara tepat:
          // Jika kolom Total ada di baris, gunakan nilai eksplisit dari kolom tersebut.
          // Jika kosong, hitung gross + discount (karena diskon bernilai negatif pada POS Pawoon).
          let net = 0;
          if (row[idxTotal] !== undefined && row[idxTotal] !== null && String(row[idxTotal]).trim() !== '') {
            net = parseSafeNumber(row[idxTotal]);
          } else {
            net = gross + discount;
          }

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

        // Hitung rekonsiliasi jika file memiliki baris Grand Total bawaan POS
        let reconciliation = null;
        if (posGrandTotal) {
          const qtyDiff = totalRawQty - posGrandTotal.qty;
          const grossDiff = totalRawGross - posGrandTotal.gross;
          const discountDiff = totalRawDiscount - posGrandTotal.discount;
          const netDiff = totalRawNet - posGrandTotal.net;

          reconciliation = {
            hasDifference: (qtyDiff !== 0 || grossDiff !== 0 || discountDiff !== 0 || netDiff !== 0),
            posRecorded: posGrandTotal,
            productSum: {
              qty: totalRawQty,
              gross: totalRawGross,
              discount: totalRawDiscount,
              net: totalRawNet
            },
            diff: {
              qty: qtyDiff,
              gross: grossDiff,
              discount: discountDiff,
              net: netDiff
            }
          };
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
          reconciliation,
          summary: [],
          rawItems
        };

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
