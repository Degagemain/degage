import {
  type Documentation,
  type DocumentationAudienceRole,
  type DocumentationFormat,
  type DocumentationTag,
  documentationSchema,
} from '@/domain/documentation.model';

export const isDocumentationContentLocked = (doc: Pick<Documentation, 'id' | 'source'>): boolean =>
  doc.id !== null && doc.source === 'repository';

export type DocumentationEditFormFields = {
  format: DocumentationFormat;
  isFaq: boolean;
  isPublic: boolean;
  groups: Documentation['groups'];
  translations: Documentation['translations'];
  audienceRoles: DocumentationAudienceRole[];
  tags: DocumentationTag[];
};

export const documentationFromEditForm = (initial: Documentation, fields: DocumentationEditFormFields): Documentation => {
  const locked = isDocumentationContentLocked(initial);

  if (initial.id === null) {
    return documentationSchema.parse({
      id: null,
      source: 'manual',
      externalId: '',
      format: fields.format,
      isFaq: fields.isFaq,
      isPublic: fields.isPublic,
      groups: fields.groups,
      translations: fields.translations,
      audienceRoles: fields.audienceRoles,
      tags: fields.tags,
      createdAt: null,
      updatedAt: null,
    });
  }

  return documentationSchema.parse({
    ...initial,
    format: fields.format,
    isFaq: fields.isFaq,
    isPublic: fields.isPublic,
    groups: fields.groups,
    translations: fields.translations,
    audienceRoles: locked ? initial.audienceRoles : fields.audienceRoles,
    tags: locked ? initial.tags : fields.tags,
  });
};
