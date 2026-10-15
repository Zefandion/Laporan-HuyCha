import React from 'react';
import { Sparkles, Globe, Terminal, ShieldCheck, CheckCircle2, FileSpreadsheet, ArrowRight, Layers } from 'lucide-react';

export default function Guide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-stone-800">
      {/* Kartu Penjelasan Fitur Pembersihan */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 text-amber-800 font-bold text-lg mb-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h2>Bagaimana Program Ini Merangkum Produk?</h2>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          Pada laporan asli mesin kasir Pawoon POS, satu jenis minuman yang sama dipecah menjadi puluhan baris terpisah karena kustomisasi <b>sugar level</b> dan <b>ice level</b> (contoh: <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded">100% - 70%</code>, <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded">50% - 70%</code>, <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded">30% - 70%</code>).
        </p>

        <div className="my-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs space-y-1 w-full md:w-5/12 bg-white p-3 rounded-lg border border-amber-200">
            <span className="font-bold text-rose-700 block">Laporan Asal POS (Terpecah 42 Baris):</span>
            <div className="text-stone-500 font-mono text-[11px] truncate">• Roasted Smoky... - 16 oz - 100% - 70% (10)</div>
            <div className="text-stone-500 font-mono text-[11px] truncate">• Roasted Smoky... - 16 oz - 50% - 70% (3)</div>
            <div className="text-stone-500 font-mono text-[11px] truncate">• Roasted Smoky... - 16 oz - 30% - 70% (2)</div>
          </div>

          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white shadow-xs">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="text-xs space-y-1 w-full md:w-5/12 bg-white p-3 rounded-lg border border-emerald-300">
            <span className="font-bold text-emerald-700 block">Hasil Rangkuman Bersih (15 Jenis):</span>
            <div className="text-stone-800 font-semibold font-mono text-xs">
              • Roasted Smoky Oolong Milk Tea - 16 oz
            </div>
            <div className="text-emerald-700 font-bold text-xs mt-1">
              &rarr; Terjual: 19 Cup | Omset: Rp 323.100
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600">
          Semua nominal kuantitas (cup), omset kotor, potongan diskon, dan total bersih dijumlahkan secara otomatis tanpa ada nilai yang hilang atau selisih. Anda juga dapat mengklik baris produk kapan saja untuk melihat rincian varian gula/es aslinya.
        </p>
      </div>

      {/* Panduan Deploy ke Vercel */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-stone-900 font-bold text-lg">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h2>Langkah Deploy Online ke Vercel (Gratis & Cepat)</h2>
        </div>
        <p className="text-sm text-stone-600">
          Aplikasi ini dirancang sebagai <i>Zero-Config Single Page Application</i> sehingga dapat langsung dideploy ke platform cloud gratis seperti <b>Vercel</b> dalam waktu kurang dari 2 menit.
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-stone-900 block">Simpan Kode ke GitHub</span>
              <p className="text-stone-600 mt-0.5">
                Inisialisasi git dan unggah repository ini ke akun GitHub Anda:
              </p>
              <pre className="mt-1.5 p-2 bg-stone-900 text-stone-100 rounded-lg text-xs font-mono overflow-x-auto">
git init
git add .
git commit -m "Initial commit HuyCha sales summarizer"
git branch -M main
git remote add origin https://github.com/USERNAME/huycha-sales.git
git push -u origin main
              </pre>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-stone-900 block">Hubungkan ke Vercel</span>
              <p className="text-stone-600 mt-0.5">
                Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-700 font-semibold underline">vercel.com</a>, login dengan GitHub, klik <b>"Add New..."</b> &rarr; <b>"Project"</b>, lalu pilih repository <code>huycha-sales</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-stone-900 block">Deploy dengan Sekali Klik</span>
              <p className="text-stone-600 mt-0.5">
                Vercel akan mendeteksi framework <b>Vite</b> secara otomatis. Cukup klik tombol <b>"Deploy"</b>. Dalam ~30 detik, Anda akan mendapatkan URL web publik gratis (contoh: <code>https://huycha-sales.vercel.app</code>) yang dapat Anda dan staf buka dari HP, tablet kasir, atau laptop kapan saja!
              </p>
            </div>
          </div>
        </div>

        {/* Deploy via Vercel CLI */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-stone-800 text-xs font-semibold mb-1">
            <Terminal className="w-4 h-4 text-stone-500" />
            <span>Atau Deploy Langsung Lewat Terminal / Command Line:</span>
          </div>
          <pre className="p-2.5 bg-stone-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto">
npm i -g vercel
vercel
          </pre>
        </div>
      </div>

      {/* Privasi & Keamanan */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-900">
          <span className="font-bold block">100% Aman & Terlindungi (Client-Side Processing)</span>
          <p className="text-emerald-800/90 mt-0.5">
            Semua pembacaan file Excel dan kalkulasi angka dilakukan secara lokal langsung di peramban web (browser) Anda. Data laporan omset dan keuangan HuyCha Anda tidak pernah dikirim ke server pihak ketiga manapun.
          </p>
        </div>
      </div>
    </div>
  );
}
