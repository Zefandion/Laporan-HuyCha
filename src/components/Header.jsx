import React from 'react';
import { Coffee, History, FileSpreadsheet, HelpCircle, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, savedCount }) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <span className="text-xl">🧋</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-stone-900 tracking-tight">HuyCha</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Sales Summarizer
                </span>
              </div>
              <p className="text-xs text-stone-500">Rangkuman Penjualan & Pembersih Varian POS</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('summarize')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'summarize'
                  ? 'bg-amber-50 text-amber-800 shadow-xs border border-amber-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span>Rangkuman</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'history'
                  ? 'bg-amber-50 text-amber-800 shadow-xs border border-amber-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <History className="w-4 h-4 text-amber-600" />
              <span>Catatan Riwayat</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-amber-600 text-white font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-50 text-amber-800 shadow-xs border border-amber-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Panduan & Vercel</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
