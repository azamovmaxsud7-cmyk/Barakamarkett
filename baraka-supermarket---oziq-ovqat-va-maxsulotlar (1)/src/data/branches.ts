import { SupermarketBranch } from '../types';

export const SUPERMARKET_BRANCHES: SupermarketBranch[] = [
  {
    id: 'sam_registon',
    name: 'Baraka Samarqand Markaz (Registon)',
    city: 'Samarqand',
    address: 'Samarqand sh., Registon ko‘chasi 14',
    deliveryTimeMinutes: '20 – 30 daqiqa',
    distanceKm: 1.2,
    isOpen: true,
    workingHours: '24/7 (Kechu-kunduz)',
    isExpressAvailable: true,
    phone: '+998 66 200 00 00'
  },
  {
    id: 'sam_sugdiyon',
    name: 'Baraka Sug‘diyona Supermarket',
    city: 'Samarqand',
    address: 'Samarqand sh., Sug‘diyona mavzesi 22',
    deliveryTimeMinutes: '20 – 35 daqiqa',
    distanceKm: 2.1,
    isOpen: true,
    workingHours: '08:00 – 23:30',
    isExpressAvailable: true,
    phone: '+998 66 200 00 01'
  },
  {
    id: 'sam_universitet',
    name: 'Baraka Bulvar Express',
    city: 'Samarqand',
    address: 'Samarqand sh., Universitet xiyoboni 8',
    deliveryTimeMinutes: '15 – 25 daqiqa',
    distanceKm: 1.8,
    isOpen: true,
    workingHours: '08:00 – 23:00',
    isExpressAvailable: true,
    phone: '+998 66 200 00 02'
  },
  {
    id: 'sam_siyob',
    name: 'Baraka Siyob Hypermarket',
    city: 'Samarqand',
    address: 'Samarqand sh., Islom Karimov ko‘chasi 54',
    deliveryTimeMinutes: '25 – 35 daqiqa',
    distanceKm: 3.1,
    isOpen: true,
    workingHours: '07:30 – 23:00',
    isExpressAvailable: true,
    phone: '+998 66 200 00 03'
  }
];
