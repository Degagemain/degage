import type { DocumentationAudienceRole } from '@/domain/documentation.model';
import { Role } from './role.model';

export type DocumentationSearchViewerContext = {
  isViewerAdmin: boolean;
  isAuthenticated: boolean;
};

export const documentationSearchVisibleAudiences = (ctx: DocumentationSearchViewerContext): DocumentationAudienceRole[] => {
  if (ctx.isViewerAdmin) {
    return [Role.ADMIN, Role.USER, 'public'];
  }
  if (ctx.isAuthenticated) {
    return [Role.USER, 'public'];
  }
  return ['public'];
};

export const documentationAdminOnlyAudiences: DocumentationAudienceRole[] = [Role.ADMIN];

export const documentationViewerRolesWithPrivilegedDocSearchAccess: DocumentationAudienceRole[] = [Role.ADMIN];

export const documentationViewerHasPrivilegedDocSearchAccess = (viewerAudienceRole: DocumentationAudienceRole): boolean => {
  return documentationViewerRolesWithPrivilegedDocSearchAccess.includes(viewerAudienceRole);
};

export const documentationRequiresAdminViewer = (audienceRoles: DocumentationAudienceRole[]): boolean => {
  return audienceRoles.some((r) => documentationAdminOnlyAudiences.includes(r));
};

export const canViewDocumentation = (audienceRoles: DocumentationAudienceRole[], isViewerAdmin: boolean): boolean => {
  if (documentationRequiresAdminViewer(audienceRoles)) {
    return isViewerAdmin;
  }
  return true;
};
