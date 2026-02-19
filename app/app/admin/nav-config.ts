import type { LucideIcon } from 'lucide-react';
import { Calculator, MapPin, Settings2, Users } from 'lucide-react';

export const MAIN_ITEMS: {
  translationKey: 'simulations' | 'users';
  href: string;
  icon: LucideIcon;
}[] = [
  { translationKey: 'simulations', href: '/app/admin/simulations', icon: Calculator },
  { translationKey: 'users', href: '/app/admin/users', icon: Users },
];

export const CAR_SETTINGS_ITEMS: {
  translationKey: 'carBrands' | 'carTypes' | 'fuelTypes' | 'euroNorms' | 'carPriceEstimates' | 'systemParameters';
  href: string;
}[] = [
  { translationKey: 'carBrands', href: '/app/admin/car-brands' },
  { translationKey: 'carTypes', href: '/app/admin/car-types' },
  { translationKey: 'fuelTypes', href: '/app/admin/fuel-types' },
  { translationKey: 'euroNorms', href: '/app/admin/euro-norms' },
  { translationKey: 'carPriceEstimates', href: '/app/admin/car-price-estimates' },
  { translationKey: 'systemParameters', href: '/app/admin/system-parameters' },
];

export const GEO_SETTINGS_ITEMS: {
  translationKey: 'towns' | 'hubs' | 'hubBenchmarks' | 'provinces';
  href: string;
}[] = [
  { translationKey: 'towns', href: '/app/admin/towns' },
  { translationKey: 'hubs', href: '/app/admin/hubs' },
  { translationKey: 'hubBenchmarks', href: '/app/admin/hub-benchmarks' },
  { translationKey: 'provinces', href: '/app/admin/provinces' },
];

export type MainItemTranslationKey = (typeof MAIN_ITEMS)[number]['translationKey'];
export type CarSettingsTranslationKey = (typeof CAR_SETTINGS_ITEMS)[number]['translationKey'];
export type GeoSettingsTranslationKey = (typeof GEO_SETTINGS_ITEMS)[number]['translationKey'];

/** All admin pages with titleKey for i18n. Used by sidebar (page title) and command palette. */
export const ALL_PAGE_ITEMS = [
  ...MAIN_ITEMS.map((i) => ({ ...i, titleKey: `${i.translationKey}.title` as const })),
  ...CAR_SETTINGS_ITEMS.map((i) => ({ ...i, titleKey: `${i.translationKey}.title` as const })),
  ...GEO_SETTINGS_ITEMS.map((i) => ({ ...i, titleKey: `${i.translationKey}.title` as const })),
];

export const CAR_SETTINGS_GROUP_KEY = 'car' as const;
export const GEO_SETTINGS_GROUP_KEY = 'geo' as const;

export const SIDEBAR_SETTINGS_ICONS = {
  car: Settings2,
  geo: MapPin,
} as const;
