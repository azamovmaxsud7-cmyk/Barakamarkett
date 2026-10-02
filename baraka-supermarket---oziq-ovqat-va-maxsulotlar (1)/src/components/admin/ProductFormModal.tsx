import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  Layers, 
  DollarSign, 
  Boxes 
} from 'lucide-react';
import { Product, CategoryId } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { useStore } from '../../context/StoreContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const SAMPLE_IMAGE_PRESETS = [
  { label: 'Sut', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { label: 'Go‘sht', url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80' },
  { label: 'Meva', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Non', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { label: 'Sharbat', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80' },
  { label: 'Guruch/Don', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' }
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { addProduct, updateProduct } = useStore();

  const [name, setName] = useState(productToEdit?.name || '');
  const [categoryId, setCategoryId] = useState<CategoryId>(productToEdit?.categoryId || 'sut');
  const [subcategoryId, setSubcategoryId] = useState(productToEdit?.subcategoryId || 'sut_qatiq');
  const [price, setPrice] = useState<number | string>(productToEdit?.price || '');
  const [oldPrice, setOldPrice] = useState<number | string>(productToEdit?.oldPrice || '');
  const [costPrice, setCostPrice] = useState<number | string>(
    productToEdit?.costPrice !== undefined 
      ? productToEdit.costPrice 
      : productToEdit?.price ? Math.round(productToEdit.price * 0.72) : ''
  );
  const [sku, setSku] = useState(productToEdit?.sku || (productToEdit ? `SKU-${productToEdit.id.padStart(4, '0')}` : ''));
  const [unit, setUnit] = useState<Product['unit']>(productToEdit?.unit || 'dona');
  const [weightOrVolume, setWeightOrVolume] = useState(productToEdit?.weightOrVolume || '1 kg');
  const [stock, setStock] = useState<number | string>(productToEdit?.stock ?? 30);
  const [image, setImage] = useState(productToEdit?.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [origin, setOrigin] = useState(productToEdit?.origin || 'O‘zbekiston');
  const [shelfLife, setShelfLife] = useState(productToEdit?.shelfLife || '10 kun');
  const [brand, setBrand] = useState(productToEdit?.brand || '');
  const [isHalal, setIsHalal] = useState(productToEdit?.isHalal ?? true);
  const [isFresh, setIsFresh] = useState(productToEdit?.isFresh ?? true);
  const [isPopular, setIsPopular] = useState(productToEdit?.isPopular ?? false);
  const [discountPercent, setDiscountPercent] = useState<number | string>(productToEdit?.discountPercent || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentCategoryObj = CATEGORIES.find(c => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Mahsulot nomini kiriting');
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      setError('To‘g‘ri sotish narxi kiriting');
      return;
    }

    const numCost = costPrice !== '' ? Number(costPrice) : Math.round(numPrice * 0.72);
    if (numCost > numPrice) {
      if (!window.confirm('DIQQAT: Tan narxi sotish narxidan yuqori! Bu zarar keltirishi mumkin. Davom etasizmi?')) {
        return;
      }
    }

    const payload = {
      name: name.trim(),
      categoryId,
      subcategoryId: subcategoryId || currentCategoryObj?.subcategories[0]?.id || 'other',
      price: numPrice,
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      costPrice: numCost,
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      unit,
      weightOrVolume: weightOrVolume.trim() || '1 dona',
      stock: Number(stock) || 0,
      image: image.trim() || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      description: description.trim() || `${name} — yuqori sifatli va tabiiy mahsulot.`,
      origin: origin.trim() || 'O‘zbekiston',
      shelfLife: shelfLife.trim() || 'Kafolatlangan',
      brand: brand.trim() || 'Baraka Tanlovi',
      isHalal,
      isFresh,
      isPopular,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      rating: productToEdit?.rating || 5.0,
      reviewCount: productToEdit?.reviewCount || 1
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#0d0d12] text-white rounded-3xl sm:rounded-4xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold shrink-0">
              {productToEdit ? '✏️' : '➕'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {productToEdit ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo‘shish'}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Supermarket katalogiga mahsulot ma’lumotlarini kiriting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-xs">
              {error}
            </div>
          )}

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Mahsulot nomi *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masalan: Tabiiy Samarqand Qaymog'i 350g"
                className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden focus:border-orange-400 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Kategoriya *
              </label>
              <select
                value={categoryId}
                onChange={e => {
                  const newCat = e.target.value as CategoryId;
                  setCategoryId(newCat);
                  const matched = CATEGORIES.find(c => c.id === newCat);
                  if (matched && matched.subcategories.length > 0) {
                    setSubcategoryId(matched.subcategories[0].id);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-stone-900 text-white focus:outline-hidden focus:border-orange-400 text-sm cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Ichki toifa (Subkategoriya)
              </label>
              <select
                value={subcategoryId}
                onChange={e => setSubcategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-stone-900 text-white focus:outline-hidden focus:border-orange-400 text-sm cursor-pointer"
              >
                {currentCategoryObj?.subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing, Cost Price & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Sotish narxi (so‘m) *
              </label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="25000"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 font-mono placeholder:text-stone-500 focus:outline-hidden focus:border-emerald-400 text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Tan narxi *</span>
                <span className="text-[10px] lowercase text-stone-400 font-normal">kelish</span>
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                placeholder="18000"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-300 font-mono placeholder:text-stone-500 focus:outline-hidden focus:border-amber-400 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Eski narxi (so‘m)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={e => setOldPrice(e.target.value)}
                placeholder="30000"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono placeholder:text-stone-500 focus:outline-hidden focus:border-orange-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                SKU / Shtrix-kod
              </label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="SKU-0012"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-stone-200 font-mono placeholder:text-stone-500 focus:outline-hidden focus:border-orange-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                O‘lchov birligi
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as Product['unit'])}
                className="w-full px-3 py-2.5 rounded-2xl border border-white/10 bg-stone-900 text-white focus:outline-hidden focus:border-orange-400 text-sm cursor-pointer"
              >
                <option value="dona">dona</option>
                <option value="kg">kg</option>
                <option value="litr">litr</option>
                <option value="qadoq">qadoq</option>
                <option value="gramm">gramm</option>
                <option value="bog'">bog'</option>
              </select>
            </div>
          </div>

          {/* Stock and Profit Margin Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Ombordagi soni (Qoldiq) *
              </label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="50"
                className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white font-mono placeholder:text-stone-500 focus:outline-hidden focus:border-orange-400 text-sm"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Avtomatik Foyda va Marja ko‘rsatkichi
              </label>
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs h-[42px]">
                <span className="text-stone-400 text-[11px]">1 donadan yalpi foyda:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className={`font-black ${Number(price) - Number(costPrice) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Number(price) - Number(costPrice) >= 0 ? '+' : ''}{(Number(price) - Number(costPrice)).toLocaleString()} so‘m
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-300 font-bold text-[10px]">
                    {Number(price) > 0 ? (((Number(price) - Number(costPrice)) / Number(price)) * 100).toFixed(1) : 0}% marja
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details (Weight, Origin, Brand, Shelf life, Discount) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Hajm / Og‘irlik
              </label>
              <input
                type="text"
                value={weightOrVolume}
                onChange={e => setWeightOrVolume(e.target.value)}
                placeholder="500 g yoki 1 L"
                className="w-full px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Ishlab chiqarilgan joy
              </label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="Samarqand"
                className="w-full px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Brend nomi
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Masalan: Musaffo, Nestle"
                className="w-full px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Yaroqlilik muddati
              </label>
              <input
                type="text"
                value={shelfLife}
                onChange={e => setShelfLife(e.target.value)}
                placeholder="10 kun, +2..+4°C"
                className="w-full px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Chegirma foizi (%)
              </label>
              <input
                type="number"
                value={discountPercent}
                onChange={e => setDiscountPercent(e.target.value)}
                placeholder="15"
                className="w-full px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-white font-mono placeholder:text-stone-500 focus:outline-hidden text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Image URL & Quick Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
              Mahsulot rasmi URL manzili *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-white text-xs focus:outline-hidden"
                required
              />
              {image && (
                <img
                  src={image}
                  alt="Preview"
                  className="w-10 h-10 rounded-xl object-cover border border-white/15 shrink-0"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-stone-400">Tezkor rasmlar:</span>
              {SAMPLE_IMAGE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-stone-300 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
              Tavsifi / Ma’lumot
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mahsulot haqida qisqacha ma’lumot..."
              className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-stone-500 focus:outline-hidden text-xs sm:text-sm"
            />
          </div>

          {/* Badges & Checkboxes */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={isHalal}
                onChange={e => setIsHalal(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Halol
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={isFresh}
                onChange={e => setIsFresh(e.target.checked)}
                className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-orange-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Yangi keltirilgan (Fresh)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={e => setIsPopular(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-amber-400">🔥 Ommabop (Hit)</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-white/10 text-stone-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-xs shadow-lg shadow-orange-500/20 hover:scale-105 transition-all cursor-pointer uppercase tracking-wider"
            >
              {productToEdit ? 'Saqlash' : 'Mahsulotni qo‘shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
