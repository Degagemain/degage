import { ALL_PAGE_ITEMS } from '@/app/admin/nav-config';

export const getAdminDocExternalIdForPath = (pathname: string): string | null => {
  if (!pathname.startsWith('/app/admin/')) {
    return null;
  }

  const item = ALL_PAGE_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  if (item) {
    const slug = item.href.replace('/app/admin/', '');
    return `repo:${slug}`;
  }

  return null;
};
