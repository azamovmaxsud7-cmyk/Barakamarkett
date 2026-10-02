import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  History, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  Building2, 
  Barcode, 
  Zap, 
  Filter, 
  ArrowRight, 
  Download, 
  Sparkles,
  PieChart,
  Layers,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, InventoryAuditItem, InventoryAuditSession } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const InventoryAuditModal: React.FC = () => {
  const {
    isInventoryModalOpen,
    setIsInventoryModalOpen,
    products,
    branches,
    activeBranch,
    setActiveBranch,
    applyInventoryAudit,
    auditHistory,
    deleteAuditRecord,
    financialMetrics
  } = useStore();

  // Navigation & Sub-views
  const [activeView, setActiveView] = useState<'count' | 'history' | 'finance'>('count');
  
  // Auditor header info
  const [auditorName, setAuditorName] = useState('Shaxruz (Rahbar)');
  const [auditorRole, setAuditorRole] = useState('Bosh boshqaruvchi');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'counted' | 'discrepancy' | 'uncounted'>('all');
  const [auditNote, setAuditNote] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Counted actual stock map: { [productId]: number | '' }
  const [actualCounts, setActualCounts] = useState<Record<string, number | ''>>({});
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      };
      setCurrentTime(now.toLocaleDateString('uz-UZ', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isInventoryModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isInventoryModalOpen]);

  if (!isInventoryModalOpen) return null;

  // Process rows data with calculations
  const auditRows = products.map(product => {
    const cost = product.costPrice !== undefined ? product.costPrice : Math.round(product.price * 0.72);
    const sku = product.sku || `SKU-${product.id.padStart(4, '0')}`;
    const expected = product.stock || 0;
    const hasCount = actualCounts[product.id] !== undefined && actualCounts[product.id] !== '';
    const actual = hasCount ? Number(actualCounts[product.id]) : expected;
    const diff = hasCount ? actual - expected : 0;
    const lossOrGain = diff * cost;

    return {
      product,
      sku,
      expected,
      actual,
      hasCount,
      diff,
      cost,
      lossOrGain
    };
  });

  // Filtered rows
  const filteredRows = auditRows.filter(row => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      row.product.name.toLowerCase().includes(q) ||
      (row.product.barcode && row.product.barcode.toLowerCase().includes(q)) ||
      row.sku.toLowerCase().includes(q) ||
      row.product.origin.toLowerCase().includes(q) ||
      (row.product.brand && row.product.brand.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterMode === 'counted') return row.hasCount;
    if (filterMode === 'discrepancy') return row.hasCount && row.diff !== 0;
    if (filterMode === 'uncounted') return !row.hasCount;
    return true;
  });

  // Calculation Metrics
  const countedCount = auditRows.filter(r => r.hasCount).length;
  const totalTypes = auditRows.length;
  const discrepanciesCount = auditRows.filter(r => r.hasCount && r.diff !== 0).length;
  const totalMissingQty = auditRows
    .filter(r => r.hasCount && r.diff < 0)
    .reduce((sum, r) => sum + Math.abs(r.diff), 0);
  const totalSurplusQty = auditRows
    .filter(r => r.hasCount && r.diff > 0)
    .reduce((sum, r) => sum + r.diff, 0);
  const totalFinancialDiff = auditRows
    .filter(r => r.hasCount)
    .reduce((sum, r) => sum + r.lossOrGain, 0);

  // Handle Count Change
  const handleCountChange = (productId: string, val: string) => {
    if (val === '') {
      setActualCounts(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
      setActualCounts(prev => ({
        ...prev,
        [productId]: num
      }));
    }
  };

  // Quick fill all with expected (Hamma to'g'ri deb belgilash)
  const handleQuickFillAll = () => {
    const filled: Record<string, number> = {};
    products.forEach(p => {
      filled[p.id] = p.stock || 0;
    });
    setActualCounts(filled);
  };

  // Reset/Clear counts
  const handleClear = () => {
    if (window.confirm('Barcha sanalgan fakt sonlarini tozalashni xohlaysizmi?')) {
      setActualCounts({});
      setSuccessBanner(null);
    }
  };

  // Finalize & Apply audit (Balanslarni avtomatik to'g'irlash)
  const handleFinalize = () => {
    if (countedCount === 0) {
      alert('Iltimos, kamida bitta mahsulotning faktik sonini kiriting!');
      return;
    }

    setIsFinalizing(true);
    setTimeout(() => {
      const auditItems: InventoryAuditItem[] = auditRows
        .filter(r => r.hasCount)
        .map(r => ({
          productId: r.product.id,
          productName: r.product.name,
          sku: r.sku,
          expectedStock: r.expected,
          actualStock: r.actual,
          difference: r.diff,
          costPrice: r.cost,
          price: r.product.price,
          lossOrGainValue: r.lossOrGain
        }));

      const newAudit: InventoryAuditSession = {
        id: `AUD-${Date.now()}`,
        auditorName,
        auditorRole,
        branchId: activeBranch.id,
        branchName: activeBranch.name,
        createdAt: new Date().toLocaleString('uz-UZ', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        itemsCount: totalTypes,
        countedCount,
        discrepanciesCount,
        totalMissingQty,
        totalSurplusQty,
        totalFinancialDiscrepancy: totalFinancialDiff,
        items: auditItems,
        status: 'applied',
        note: auditNote || 'Muntazam inventarizatsiya yakunlandi va qoldiqlar yangilandi.'
      };

      applyInventoryAudit(newAudit);
      setIsFinalizing(false);
      setSuccessBanner(`Inventarizatsiya muvaffaqiyatli saqlandi! ${countedCount} ta mahsulot ombor qoldig'i avtomatik to‘g‘rilandi.`);
      setActualCounts({});
      setAuditNote('');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-7xl max-h-[94vh] overflow-hidden bg-[#0a0d14] text-stone-100 rounded-3xl sm:rounded-4xl shadow-2xl border border-white/10 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar (Mohishop / Do'kon Boshqaruvi uslubida) */}
        <header className="px-4 sm:px-6 py-3.5 bg-[#0f1422] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Branch Selector */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
              <Building2 className="w-4 h-4 text-orange-400" />
              <select
                value={activeBranch.id}
                onChange={e => {
                  const b = branches.find(item => item.id === e.target.value);
                  if (b) setActiveBranch(b);
                }}
                className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} className="bg-stone-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Inventarizatsiya</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Do‘kon boshqaruvi
                </span>
              </h1>
              <p className="text-[11px] text-stone-400">Qoldiqni sanash, kirim-chiqim nazorati va moliyaviy aniqlik</p>
            </div>
          </div>

          {/* Top navigation tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveView('count')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'count'
                  ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Qoldiqni sanash</span>
            </button>

            <button
              onClick={() => setActiveView('finance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'finance'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md shadow-emerald-500/20'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bankrotlikdan himoya</span>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'history'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit tarixi ({auditHistory.length})</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsInventoryModalOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-all cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-emerald-300 text-xs font-bold">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {successBanner}
            </span>
            <button 
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
            >
              Yopish
            </button>
          </div>
        )}

        {/* VIEW 1: COUNTING & AUDIT (Rasmda aynan keltirilgan interfeys) */}
        {activeView === 'count' && (
          <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-6 space-y-4">
            
            {/* Top Auditor & Time Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-white/10 text-xs">
              <div className="flex items-center gap-3 border-r border-white/5 pr-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Kim sanayapti</span>
                  <input
                    type="text"
                    value={auditorName}
                    onChange={e => setAuditorName(e.target.value)}
                    className="font-bold text-white bg-transparent border-b border-white/10 focus:border-orange-500 focus:outline-hidden text-xs py-0.5"
                  />
                  <span className="text-[10px] text-stone-500 block">{auditorRole}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-r border-white/5 pr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Bugungi kun</span>
                  <span className="font-bold text-white block capitalize">{currentTime.split(',')[0]}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Soat: {currentTime.split(',')[1] || '15:49:00'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-r border-white/5 pr-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Avtomatik hisob</span>
                  <span className="font-bold text-amber-300 block">Bankrotlikdan himoya</span>
                  <span className="text-[10px] text-stone-400">Tan narxi & foyda nazorati</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickFillAll}
                  className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Barcha faktik sonlarni bazadagi qoldiq bilan to'ldirish"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Barchasini to‘g‘ri deb olish</span>
                </button>
              </div>
            </div>

            {/* 5 Big KPI Summary Cards (Exactly like the user's screenshot) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {/* 1. Sanalgan */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1422] border border-white/10 shadow-md flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400">Sanalgan</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">{countedCount}</span>
                  <span className="text-[11px] text-stone-500 font-mono">{totalTypes} tadan</span>
                </div>
              </div>

              {/* 2. Jami turlar */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1422] border border-white/10 shadow-md flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400">Jami turlar</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalTypes}</span>
                  <span className="text-[11px] text-stone-400">Mahsulot</span>
                </div>
              </div>

              {/* 3. Farqlar */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1422] border border-white/10 shadow-md flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400">Farqlar</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-2xl sm:text-3xl font-black font-mono ${
                    discrepanciesCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {discrepanciesCount}
                  </span>
                  <span className="text-[11px] text-stone-400">Turdagi</span>
                </div>
              </div>

              {/* 4. Chiqishi kerak (Kamomad) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1422] border border-rose-500/20 shadow-md flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-rose-400">Chiqishi kerak (Kamomad)</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-rose-500 font-mono">{totalMissingQty}</span>
                  <span className="text-[10px] text-rose-400 font-mono">
                    {totalFinancialDiff < 0 ? `-${formatCurrency(Math.abs(totalFinancialDiff))}` : "0 so'm"}
                  </span>
                </div>
              </div>

              {/* 5. Kirishi kerak (Ortiqcha) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1422] border border-emerald-500/20 shadow-md flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-emerald-400">Kirishi kerak (Ortiqcha)</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalSurplusQty}</span>
                  <span className="text-[10px] text-emerald-400">Dona</span>
                </div>
              </div>
            </div>

            {/* Filter and Action Toolbar */}
            <div className="p-3 bg-[#0f1422] rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
              {/* Search input with Barcode & SKU capability */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Shtrix-kod, SKU yoki nom bo‘yicha qidirish..."
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'all' ? 'bg-white/15 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Barchasi ({totalTypes})
                </button>
                <button
                  onClick={() => setFilterMode('counted')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'counted' ? 'bg-white/15 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Sanalgan ({countedCount})
                </button>
                <button
                  onClick={() => setFilterMode('discrepancy')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'discrepancy' ? 'bg-rose-500/20 text-rose-300' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Farqlar ({discrepanciesCount})
                </button>
                <button
                  onClick={() => setFilterMode('uncounted')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'uncounted' ? 'bg-amber-500/20 text-amber-300' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Sanalmagan ({totalTypes - countedCount})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tozalash</span>
                </button>

                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing || countedCount === 0}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isFinalizing ? 'Yakunlanmoqda...' : 'Yakunlash'}</span>
                </button>
              </div>
            </div>

            {/* Main Products Inventory Table (Exact Screenshot Layout) */}
            <div className="flex-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#0c101c]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0f1424] text-[10px] text-stone-400 font-bold uppercase tracking-wider border-b border-white/10">
                    <th className="py-3 px-4 min-w-[200px]">Mahsulot</th>
                    <th className="py-3 px-3 text-center min-w-[100px]">Nechta bor (Bazada)</th>
                    <th className="py-3 px-3 text-center min-w-[120px]">Fakt (Sanalgan)</th>
                    <th className="py-3 px-3 text-center min-w-[120px]">Chiqim / Kirim</th>
                    <th className="py-3 px-3 text-center min-w-[100px]">Nechta qoladi</th>
                    <th className="py-3 px-4 text-right min-w-[130px]">Moliyaviy Farq (Tan narxda)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-500 text-xs">
                        Hech qanday mahsulot topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map(row => {
                      const isCounted = row.hasCount;
                      const hasDiff = isCounted && row.diff !== 0;

                      return (
                        <tr 
                          key={row.product.id}
                          className={`transition-colors hover:bg-white/[0.02] ${
                            hasDiff ? 'bg-rose-500/[0.03]' : ''
                          }`}
                        >
                          {/* Product Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={row.product.image}
                                alt={row.product.name}
                                className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-white text-xs truncate max-w-[220px]">
                                  {row.product.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">
                                    {row.sku}
                                  </span>
                                  <span className="text-[10px] text-stone-400">
                                    {row.product.brand || row.product.origin}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Nechta bor (Expected in DB) */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-stone-300 text-sm">
                            {row.expected}
                          </td>

                          {/* Fakt (Input to enter actual count) */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center">
                              <input
                                type="number"
                                min="0"
                                value={actualCounts[row.product.id] !== undefined ? actualCounts[row.product.id] : ''}
                                onChange={e => handleCountChange(row.product.id, e.target.value)}
                                placeholder="—"
                                className={`w-20 text-center font-mono font-bold py-1.5 px-2 rounded-xl border text-sm transition-all focus:outline-hidden ${
                                  isCounted 
                                    ? hasDiff 
                                      ? 'bg-rose-500/10 border-rose-500 text-rose-300' 
                                      : 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                                    : 'bg-white/5 border-white/15 text-stone-200 focus:border-orange-500'
                                }`}
                              />
                            </div>
                          </td>

                          {/* Chiqim / Kirim Farq Badge */}
                          <td className="py-3 px-3 text-center">
                            {isCounted ? (
                              row.diff === 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                                  <Check className="w-3 h-3" />
                                  To‘g‘ri (0)
                                </span>
                              ) : row.diff < 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 text-[11px] font-black border border-rose-500/30 font-mono">
                                  <TrendingDown className="w-3 h-3" />
                                  {row.diff} chiqim
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-black border border-cyan-500/30 font-mono">
                                  <TrendingUp className="w-3 h-3" />
                                  +{row.diff} kirim
                                </span>
                              )
                            ) : (
                              <span className="text-stone-500 text-xs">—</span>
                            )}
                          </td>

                          {/* Nechta qoladi (New balance) */}
                          <td className="py-3 px-3 text-center font-mono font-black text-sm text-stone-100">
                            {row.actual}
                          </td>

                          {/* Moliyaviy farq (Loss / Gain sum) */}
                          <td className="py-3 px-4 text-right">
                            {isCounted ? (
                              row.lossOrGain === 0 ? (
                                <span className="text-stone-400 font-mono text-xs">0 so‘m</span>
                              ) : row.lossOrGain < 0 ? (
                                <div className="text-rose-400 font-mono font-black text-xs">
                                  -{formatCurrency(Math.abs(row.lossOrGain))}
                                  <span className="block text-[9px] text-rose-500/80 font-normal">Kamomad zarari</span>
                                </div>
                              ) : (
                                <div className="text-emerald-400 font-mono font-black text-xs">
                                  +{formatCurrency(row.lossOrGain)}
                                  <span className="block text-[9px] text-emerald-500/80 font-normal">Ortiqcha tovar</span>
                                </div>
                              )
                            ) : (
                              <span className="text-stone-500 font-mono text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Audit Note input and footer status */}
            <div className="p-3 bg-[#0f1422] rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-2/3">
                <span className="text-stone-400 whitespace-nowrap">Izoh / Sabab:</span>
                <input
                  type="text"
                  value={auditNote}
                  onChange={e => setAuditNote(e.target.value)}
                  placeholder="Masalan: Rejali oylik sanash, kamomad hisobdan chiqarildi..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="text-stone-400 font-mono text-xs shrink-0">
                Jami kutilayotgan moliyaviy farq:{' '}
                <span className={`font-black ${totalFinancialDiff < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {totalFinancialDiff < 0 ? `-${formatCurrency(Math.abs(totalFinancialDiff))}` : `+${formatCurrency(totalFinancialDiff)}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: FINANCIAL RADAR & ANTI-BANKRUPTCY SYSTEM */}
        {activeView === 'finance' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Bankruptcy Safety Meter */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#12192c] to-[#0a0d18] border border-white/15 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                      Bankrotlikdan Himoya va Moliya Radari
                    </h2>
                  </div>
                  <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                    Ushbu modul do‘kondagi barcha tovarlarning tan narxi (kelish narxi), sotish narxi, sklad qiymati, 
                    aylanmay yotgan o‘lik qoldiqlar va kamomad xavfini real-vaqt rejimida avtomatik hisoblab boradi.
                  </p>
                </div>

                {/* Score badge */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/15 text-center min-w-[180px] shrink-0">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Xavfsizlik Indeksi</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {financialMetrics.bankruptcySafetyScore}%
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300 mt-1 block">
                    {financialMetrics.bankruptcyStatus}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mt-4">
                <div 
                  className={`h-full transition-all duration-500 ${
                    financialMetrics.bankruptcySafetyScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                    financialMetrics.bankruptcySafetyScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                    'bg-gradient-to-r from-rose-600 to-red-500'
                  }`}
                  style={{ width: `${financialMetrics.bankruptcySafetyScore}%` }}
                />
              </div>
            </div>

            {/* Financial Numbers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* 1. Sklad Tan Narxi */}
              <div className="p-4 rounded-2xl bg-[#0f1424] border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 font-semibold block">Sklad Umumiy Tan Narxi</span>
                  <span className="text-xl font-black text-stone-200 font-mono mt-1 block">
                    {formatCurrency(financialMetrics.totalInventoryCostValue)}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 mt-2 block">
                  Tovarlarga tikilgan sof sarmoya qiymati
                </span>
              </div>

              {/* 2. Sklad Sotish Narxi */}
              <div className="p-4 rounded-2xl bg-[#0f1424] border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 font-semibold block">Sotuvdagi Jami Qiymati</span>
                  <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
                    {formatCurrency(financialMetrics.totalInventoryRetailValue)}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 mt-2 block">
                  Barcha mahsulot sotilganda tushadigan summa
                </span>
              </div>

              {/* 3. Kutilayotgan Yalpi Foyda & Marja */}
              <div className="p-4 rounded-2xl bg-[#0f1424] border border-emerald-500/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-emerald-400 font-semibold block">Kutilayotgan Sof Marja (Foyda)</span>
                  <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                    {formatCurrency(financialMetrics.potentialGrossProfit)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-300 mt-2 font-mono">
                  <span>Yalpi rentabellik:</span>
                  <span className="font-bold">+{financialMetrics.grossMarginPercent}%</span>
                </div>
              </div>

              {/* 4. Kamomad va Xavf Summasi */}
              <div className="p-4 rounded-2xl bg-[#0f1424] border border-rose-500/20 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-rose-400 font-semibold block">Kamomad / Zarar Xavfi</span>
                  <span className="text-xl font-black text-rose-400 font-mono mt-1 block">
                    {financialMetrics.lossRiskValue > 0 ? `-${formatCurrency(financialMetrics.lossRiskValue)}` : "0 so'm"}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 mt-2 block">
                  Auditorlik tekshiruvida aniqlangan kamomad
                </span>
              </div>
            </div>

            {/* Smart Risk Prevention Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Avtomatik Moliyaviy Himoya Qoidalari</span>
                </h3>
                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Chegirma Cheklovi:</strong> Mahsulotlarga aksiya yoki Sariq narx qo‘yilganda, sotish narxi tan narxidan pastga tushib ketishi taqiqlangan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Kamomad Nazorati:</strong> Har bir inventarizatsiya sessiyasida sanalgan kamomad xodimlar va kassa balansidan avtomatik ayirib boriladi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>O‘lik Qoldiq Ogohlantirishi:</strong> Omborda aylanmasdan 60 kundan ortiq qolgan tovarlar tezkor 1+1 aksiyasiga chiqariladi.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Kassa va Oylik Prognoz Tahlili</span>
                </h3>
                <div className="space-y-2 text-xs text-stone-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-stone-400">Kunlik joriy tushum:</span>
                    <span className="font-bold font-mono text-white">{formatCurrency(financialMetrics.dailyRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-stone-400">Kutilayotgan oylik sof foyda:</span>
                    <span className="font-bold font-mono text-emerald-400">{formatCurrency(financialMetrics.estimatedMonthlyNetProfit)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-400">Xavfli holatdagi mahsulotlar soni:</span>
                    <span className="font-bold font-mono text-amber-400">{financialMetrics.dangerProductsCount} ta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: AUDIT HISTORY (O'zgarishlar jurnali) */}
        {activeView === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  O‘zgarishlar jurnali va Sanash Tarixi
                </h2>
                <p className="text-xs text-stone-400">Barcha avvalgi inventarizatsiya va qoldiq to‘g‘rilash hisobotlari</p>
              </div>
            </div>

            {auditHistory.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-xs">
                Hali inventarizatsiya tarixi mavjud emas.
              </div>
            ) : (
              <div className="space-y-3">
                {auditHistory.map(audit => (
                  <div
                    key={audit.id}
                    className="p-4 rounded-2xl bg-[#0f1424] border border-white/10 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{audit.branchName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                            {audit.id}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 mt-0.5 block">
                          Auditor: <strong className="text-stone-200">{audit.auditorName}</strong> • {audit.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block">Moliyaviy Farq:</span>
                          <span className={`text-xs font-black font-mono ${
                            audit.totalFinancialDiscrepancy < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {audit.totalFinancialDiscrepancy < 0 
                              ? `-${formatCurrency(Math.abs(audit.totalFinancialDiscrepancy))}` 
                              : `+${formatCurrency(audit.totalFinancialDiscrepancy)}`}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteAuditRecord(audit.id)}
                          className="text-[10px] text-stone-500 hover:text-rose-400 transition-colors cursor-pointer p-1"
                          title="Tarixdan o'chirish"
                        >
                          O‘chirish
                        </button>
                      </div>
                    </div>

                    {audit.note && (
                      <p className="text-xs text-stone-300 italic bg-white/5 p-2 rounded-xl">
                        "{audit.note}"
                      </p>
                    )}

                    {/* Summary badges */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-stone-300 border border-white/10">
                        Sanalgan turlar: <strong>{audit.countedCount}</strong>
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        Kamomad soni: <strong>{audit.totalMissingQty} dona</strong>
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Ortiqcha: <strong>{audit.totalSurplusQty} dona</strong>
                      </span>
                    </div>

                    {/* Items table excerpt */}
                    {audit.items.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-black/30 text-stone-400">
                            <tr>
                              <th className="p-2">Mahsulot</th>
                              <th className="p-2 text-center">Eski qoldiq</th>
                              <th className="p-2 text-center">Fakt</th>
                              <th className="p-2 text-center">Farq</th>
                              <th className="p-2 text-right">Zarar/Foyda</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-stone-300">
                            {audit.items.slice(0, 5).map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-2 font-medium">{item.productName} ({item.sku})</td>
                                <td className="p-2 text-center font-mono">{item.expectedStock}</td>
                                <td className="p-2 text-center font-mono font-bold text-white">{item.actualStock}</td>
                                <td className="p-2 text-center font-mono font-bold">
                                  <span className={item.difference < 0 ? 'text-rose-400' : item.difference > 0 ? 'text-emerald-400' : 'text-stone-400'}>
                                    {item.difference > 0 ? `+${item.difference}` : item.difference}
                                  </span>
                                </td>
                                <td className="p-2 text-right font-mono font-bold">
                                  {item.lossOrGainValue < 0 
                                    ? `-${formatCurrency(Math.abs(item.lossOrGainValue))}` 
                                    : `+${formatCurrency(item.lossOrGainValue)}`}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
