import { ALL_PAGE_ITEMS } from '@/app/admin/nav-config';

const SIMULATIONS_BASE = '/app/admin/simulations';

/** Admin slugs that have no matching seeded doc (`repo:{slug}`); omit the header help link. */
const NO_REPO_DOC_HELP_SLUGS = new Set(['users']);

export const getAdminDocExternalIdForPath = (pathname: string): string | null => {
  if (!pathname.startsWith('/app/admin/')) {
    return null;
  }

  const item = ALL_PAGE_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  if (item) {
    const slug = item.href.replace('/app/admin/', '');
    if (NO_REPO_DOC_HELP_SLUGS.has(slug)) {
      return null;
    }
    return `repo:${slug}`;
  }

  if (pathname.startsWith(`${SIMULATIONS_BASE}/`) && pathname !== '/app/admin/simulations/new') {
    return 'repo:simulations';
  }

  return null;
};
