const STORAGE_KEY = 'huycha_sales_reports_v1';

/**
 * Mengambil semua catatan laporan yang tersimpan di browser
 */
export function getSavedReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Gagal mengambil data dari LocalStorage:', err);
    return [];
  }
}

/**
 * Menyimpan laporan baru ke catatan riwayat
 */
export function saveReportToHistory(reportData, notes = '') {
  try {
    const current = getSavedReports();
    const newEntry = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      savedAt: new Date().toISOString(),
      notes: notes.trim(),
      fileName: reportData.fileName,
      metadata: reportData.metadata,
      totals: reportData.totals,
      summary: reportData.summary
    };

    // Cek apakah tanggal & outlet yang sama sudah ada
    const existingIndex = current.findIndex(
      r => r.metadata?.tanggal === reportData.metadata?.tanggal && 
           r.metadata?.outlet === reportData.metadata?.outlet
    );

    let updated;
    if (existingIndex >= 0) {
      // Perbarui catatan yang sudah ada
      updated = [...current];
      updated[existingIndex] = {
        ...newEntry,
        id: current[existingIndex].id, // pertahankan id
        notes: notes.trim() || current[existingIndex].notes || ''
      };
    } else {
      updated = [newEntry, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (err) {
    console.error('Gagal menyimpan laporan:', err);
    throw err;
  }
}

/**
 * Memperbarui catatan/notes untuk laporan tertentu
 */
export function updateReportNotes(reportId, newNotes) {
  try {
    const current = getSavedReports();
    const updated = current.map(item => {
      if (item.id === reportId) {
        return { ...item, notes: newNotes };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Gagal memperbarui catatan:', err);
    return false;
  }
}

/**
 * Menghapus laporan dari riwayat
 */
export function deleteSavedReport(reportId) {
  try {
    const current = getSavedReports();
    const filtered = current.filter(item => item.id !== reportId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Gagal menghapus laporan:', err);
    return [];
  }
}

/**
 * Menghapus semua riwayat laporan
 */
export function clearAllSavedReports() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Gagal menghapus semua data:', err);
    return false;
  }
}

/**
 * Export backup data riwayat ke file JSON
 */
export function exportBackupJSON() {
  const data = getSavedReports();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HuyCha_Backup_Riwayat_Laporan_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import backup data riwayat dari file JSON
 */
export function importBackupJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error('Format backup tidak valid (harus array).');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (err) {
    console.error('Gagal mengimpor backup:', err);
    throw err;
  }
}
