import React from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  Phone, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  User, 
  ShoppingBag,
  FileText
} from 'lucide-react';
import { OrderDetails, OrderStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface OrderInvoiceModalProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0e0e12] text-white rounded-3xl sm:rounded-4xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Buyurtma #{order.orderId}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                  order.status === 'Tayyorlanmoqda'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : order.status === "Kuryer yo'lda"
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : order.status === 'Yetkazildi'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">{order.createdAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Chekni chop etish"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Chop etish</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Invoice printable contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 text-xs sm:text-sm">
          {/* Customer & Delivery card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Mijoz Ma’lumotlari
              </span>
              <p className="font-bold text-stone-100 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" />
                {order.fullName}
              </p>
              <a href={`tel:${order.phone}`} className="text-amber-400 font-mono flex items-center gap-1.5 mt-1 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                {order.phone}
              </a>
            </div>

            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Yetkazish Manzili
              </span>
              <p className="text-stone-200 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{order.address}</span>
              </p>
              {order.landmark && (
                <p className="text-[11px] text-stone-400 mt-1 pl-5">
                  Mo‘ljal: {order.landmark}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Yetkazish Vaqti
              </span>
              <p className="text-stone-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {order.timeSlot}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                To‘lov Usuli
              </span>
              <p className="text-stone-200 font-bold uppercase flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                {order.paymentMethod}
              </p>
            </div>

            {order.comment && (
              <div className="sm:col-span-2 pt-2 border-t border-white/5 bg-amber-500/5 p-2 rounded-xl">
                <span className="text-[11px] font-bold text-amber-400 block mb-0.5">
                  Mijoz izohi:
                </span>
                <p className="text-stone-300 italic text-xs">{order.comment}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
              Buyurtma qilingan mahsulotlar ({order.items.length} ta xil)
            </h3>

            <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
              <div className="bg-white/5 px-4 py-2.5 grid grid-cols-12 text-[11px] font-bold text-stone-400 uppercase">
                <span className="col-span-6">Mahsulot</span>
                <span className="col-span-2 text-center">Narx</span>
                <span className="col-span-2 text-center">Soni</span>
                <span className="col-span-2 text-right">Jami</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="px-4 py-3 grid grid-cols-12 items-center text-xs">
                  <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-stone-100 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-stone-400">{item.product.weightOrVolume || item.product.unit}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center font-mono text-stone-300">
                    {formatCurrency(item.product.price)}
                  </div>
                  <div className="col-span-2 text-center font-mono font-bold text-white">
                    × {item.quantity}
                  </div>
                  <div className="col-span-2 text-right font-mono font-black text-stone-100">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Mahsulotlar jami summasi:</span>
              <span className="font-mono text-stone-200">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-400 font-semibold">
                <span>Promokod chegirmasi:</span>
                <span className="font-mono">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-400">
              <span>Yetkazib berish narxi:</span>
              <span className={`font-mono ${order.deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'text-stone-200'}`}>
                {order.deliveryFee === 0 ? 'BEPUL' : formatCurrency(order.deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-black">
              <span className="text-sm text-white uppercase tracking-wider">Umumiy to‘lov:</span>
              <span className="text-xl font-mono text-emerald-400">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Status Changer Actions */}
          <div className="pt-2 border-t border-white/10">
            <span className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
              Buyurtma holatini yangilash:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Tayyorlanmoqda', "Kuryer yo'lda", 'Yetkazildi', 'Bekor qilindi'] as OrderStatus[]).map(st => (
                <button
                  key={st}
                  onClick={() => onStatusChange(order.orderId, st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    order.status === st
                      ? 'bg-emerald-500 text-stone-950 font-black shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
