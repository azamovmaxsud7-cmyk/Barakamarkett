import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'sut',
    name: 'Sut mahsulotlari',
    tagline: 'Tabiiy va yangi sut, qatiq, pishloq va qaymoqlar',
    description: 'Fermer xo‘jaliklaridan har kuni keltiriladigan 100% tabiiy sut, qatiq, qaymoq, sariyog‘, tvorog va sifatli pishloq turlari.',
    icon: '🥛',
    color: 'from-blue-500 to-cyan-400',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    borderColor: 'border-blue-300 hover:border-blue-500',
    badge: 'Har kuni yangi',
    image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
    itemCount: 14,
    subcategories: [
      { id: 'all', name: 'Barchasi' },
      { id: 'sut_qatiq', name: 'Sut va Qatiq' },
      { id: 'qaymoq_smetana', name: 'Qaymoq & Smetana' },
      { id: 'tvorog_suzma', name: 'Tvorog & Suzma' },
      { id: 'pishloq', name: 'Pishloqlar (Sir)' },
      { id: 'sariyog', name: "Sariyog' & Margarin" },
      { id: 'muzqaymoq', name: 'Muzqaymoq & Shirinliklar' }
    ]
  },
  {
    id: 'gosht',
    name: "Go'sht va Parranda",
    tagline: "100% Halol mol, qo'y va tovuq go'shtlari",
    description: "Sertifikatlangan halol so'yilgan saralangan mol go'shti, qo'y go'shti, tovuq go'shtlari, qazi va sifatli kolbasa mahsulotlari.",
    icon: '🥩',
    color: 'from-red-500 to-rose-400',
    gradient: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200',
    borderColor: 'border-red-300 hover:border-red-500',
    badge: '100% Halol',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    itemCount: 12,
    subcategories: [
      { id: 'all', name: 'Barchasi' },
      { id: 'mol_goshti', name: "Mol go'shti" },
      { id: 'qoy_goshti', name: "Qo'y go'shti" },
      { id: 'tovuq_parranda', name: 'Tovuq & Parranda' },
      { id: 'qiyma', name: 'Qiyma go‘sht' },
      { id: 'qazi_dudlangan', name: 'Qazi & Dudlangan go‘sht' },
      { id: 'kolbasa_sosiska', name: 'Kolbasa & Sosiskalar' }
    ]
  },
  {
    id: 'meva_sabzavot',
    name: 'Meva va Sabzavotlar',
    tagline: 'Quyoshli O‘zbekiston bog‘laridan yangi uzilgan',
    description: 'Eng shirin mevalar, sitruslar, qarsildoq sabzavotlar, yangi ko‘katlar va vitaminlarga boy sarxil meva-sabzavotlar.',
    icon: '🍏',
    color: 'from-emerald-500 to-green-400',
    gradient: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
    borderColor: 'border-emerald-300 hover:border-emerald-500',
    badge: 'Vitaminlarga boy',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    itemCount: 16,
    subcategories: [
      { id: 'all', name: 'Barchasi' },
      { id: 'mevalar', name: 'Saralangan Mevalar' },
      { id: 'sitruslar', name: 'Sitrus va Egzotik' },
      { id: 'sabzavotlar', name: 'Sabzavotlar' },
      { id: 'kokatlar', name: 'Yangi Ko‘katlar' },
      { id: 'ildizmevalar', name: 'Kartoshka, Piyoz & Sabzi' },
      { id: 'rezavorlar', name: 'Rezavorlar (Yagoda)' }
    ]
  },
  {
    id: 'ichimliklar',
    name: 'Ichimliklar & Sharbatlar',
    tagline: 'Salqinlantiruvchi ichimliklar, choy va sharbatlar',
    description: 'Tabiiy meva sharbatlari, gazlangan va gazsiz mineral suvlar, salqin ichimliklar, xushbo‘y choy va premium qahvalar.',
    icon: '🥤',
    color: 'from-amber-500 to-orange-400',
    gradient: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
    borderColor: 'border-amber-300 hover:border-amber-500',
    badge: 'Muzdek & Tetiklantiruvchi',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    itemCount: 15,
    subcategories: [
      { id: 'all', name: 'Barchasi' },
      { id: 'sharbatlar', name: 'Tabiiy Sharbatlar' },
      { id: 'gazli_ichimlik', name: 'Gazlangan Ichimliklar' },
      { id: 'mineral_suv', name: 'Mineral Suvlar' },
      { id: 'choy_qahva', name: 'Choy & Qahva' },
      { id: 'energetik', name: 'Energetik Ichimliklar' },
      { id: 'sovuq_choy', name: 'Muzdek Choylar' }
    ]
  },
  {
    id: 'non_qandolat',
    name: 'Non va Qandolatchilik',
    tagline: 'Issiq nonlar, shokolad, tort va pechenyelar',
    description: 'Issiq tandir Samarqand nonlari, qarsildoq bagetlar, shirin shokoladlar, bayramona tortlar va xushbo‘y pishiriqlar.',
    icon: '🍞',
    color: 'from-yellow-600 to-amber-500',
    gradient: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
    borderColor: 'border-yellow-300 hover:border-yellow-500',
    badge: 'Issiqqina Tandirdan',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    itemCount: 14,
    subcategories: [
      { id: 'all', name: 'Barchasi' },
      { id: 'tandir_non', name: 'Tandir va Milliy Nonlar' },
      { id: 'buxanka_baget', name: 'Buxanka & Toast Non' },
      { id: 'shokolad', name: 'Shokolad va Konfetlar' },
      { id: 'pechenye_vafli', name: 'Pechenye & Vaflilar' },
      { id: 'tort_pirojniy', name: 'Tort va Pirojniylar' },
      { id: 'kruassan_pishiriq', name: 'Kruassan & Pishiriqlar' }
    ]
  },
  {
    id: 'baqqollik',
    name: 'Baqqollik & Donlar',
    tagline: 'Guruch, yog‘, makaron, ziravor va un mahsulotlari',
    description: 'Oshbop Lazer va Devzira guruchlari, oliy navli unlar, tozalangan o‘simlik yog‘lari, sifatli makaronlar va xushbo‘y ziravorlar.',
    icon: '🌾',
    color: 'from-amber-700 to-yellow-600',
    gradient: 'bg-gradient-to-br from-stone-50 to-amber-50 border-amber-200',
    borderColor: 'border-amber-300 hover:border-amber-500',
    badge: 'Asosiy oziq-ovqat',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    itemCount: 15,
    subcategories: [
      { id: 'all', name: 'Barchasi' },
      { id: 'guruch_don', name: 'Guruch va Don mahsulotlari' },
      { id: 'osimlik_yogi', name: 'O‘simlik va Zaytun Yog‘lari' },
      { id: 'makaron_spagetti', name: 'Makaron va Spagetti' },
      { id: 'un_shakar_tuz', name: 'Un, Shakar va Tuz' },
      { id: 'ziravorlar', name: 'Milliy Ziravorlar' },
      { id: 'konservalar', name: 'Konserva va Souslar' }
    ]
  },
  {
    id: 'xojalik',
    name: 'Xo‘jalik & Tozalik',
    tagline: 'Uy uchun tozalash vositalari va gigiyena',
    description: 'Xushbo‘y kir yuvish kukunlari, idish yuvish gellari, tozalovchi vositalar va sifatli shaxsiy gigiyena mahsulotlari.',
    icon: '🧼',
    color: 'from-teal-500 to-cyan-400',
    gradient: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200',
    borderColor: 'border-teal-300 hover:border-teal-500',
    badge: 'Tozalik & Gigiyena',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    itemCount: 10,
    subcategories: [
      { id: 'all', name: 'Barchasi' },
      { id: 'kir_yuvish', name: 'Kir Yuvish Vositalari' },
      { id: 'idish_yuvish', name: 'Idish Yuvish Gellari' },
      { id: 'tozalash', name: 'Uy Tozalash Vositalari' },
      { id: 'gigiyena', name: 'Shaxsiy Gigiyena' }
    ]
  }
];
