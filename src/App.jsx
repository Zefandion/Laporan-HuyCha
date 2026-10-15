import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SummaryStats from './components/SummaryStats';
import ProductTable from './components/ProductTable';
import ActionToolbar from './components/ActionToolbar';
import SavedRecords from './components/SavedRecords';
import Guide from './components/Guide';
import WhatsAppModal from './components/WhatsAppModal';
import { getSavedReports, saveReportToHistory } from './utils/storage';
import { reAggregateReportData } from './utils/parser';

export default function App() {
  const [activeTab, setActiveTab] = useState('summarize');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // Opsi Pembersihan
  const [cleaningOptions, setCleaningOptions] = useState({
    stripModifiers: true,
    stripSize: false
  });

  // Muat riwayat saat awal aplikasi dibuka
  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = () => {
    setSavedReports(getSavedReports());
  };

  // Re-agregasi jika pengguna mengubah opsi pembersihan ketika file sedang aktif
  useEffect(() => {
    if (reportData && reportData.rawItems) {
      const updated = reAggregateReportData(reportData, cleaningOptions);
      setReportData(updated);
    }
  }, [cleaningOptions.stripSize]);

  const handleDataParsed = (data) => {
    setReportData(data);
  };

  const handleSaveReport = (noteText) => {
    if (!reportData) return;
    saveReportToHistory(reportData, noteText);
    refreshHistory();
  };

  const handleLoadSavedReport = (savedItem) => {
    setReportData(savedItem);
    setActiveTab('summarize');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setReportData(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedReports.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: RANGKUMAN PENJUALAN */}
        {activeTab === 'summarize' && (
          <div className="space-y-6">
            {!reportData ? (
              <FileUpload
                onDataParsed={handleDataParsed}
                cleaningOptions={cleaningOptions}
                setCleaningOptions={setCleaningOptions}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : (
              <>
                <ActionToolbar
                  reportData={reportData}
                  onSaveReport={handleSaveReport}
                  onReset={handleReset}
                  onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
                />

                <SummaryStats reportData={reportData} />

                <ProductTable
                  summary={reportData.summary}
                  totals={reportData.totals}
                />
              </>
            )}
          </div>
        )}

        {/* TAB 2: CATATAN RIWAYAT */}
        {activeTab === 'history' && (
          <SavedRecords
            savedReports={savedReports}
            onRefreshHistory={refreshHistory}
            onLoadReport={handleLoadSavedReport}
          />
        )}

        {/* TAB 3: PANDUAN & DEPLOY VERCEL */}
        {activeTab === 'guide' && <Guide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-4 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HuyCha Sales Summarizer &bull; Dibuat khusus untuk pengelompokan produk POS</span>
          <span>Siap deploy ke Vercel &bull; 100% Client-Side Safe</span>
        </div>
      </footer>

      {/* Modal Format WhatsApp */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        reportData={reportData}
      />
    </div>
  );
}
