import type { DocumentationAudienceRole } from '@/domain/documentation.model';

export const documentationAdminOnlyAudiences: DocumentationAudienceRole[] = ['admin', 'technical'];

export const documentationRequiresAdminViewer = (audienceRoles: DocumentationAudienceRole[]): boolean => {
  return audienceRoles.some((r) => documentationAdminOnlyAudiences.includes(r));
};

export const canViewDocumentation = (audienceRoles: DocumentationAudienceRole[], isViewerAdmin: boolean): boolean => {
  if (documentationRequiresAdminViewer(audienceRoles)) {
    return isViewerAdmin;
  }
  return true;
};
