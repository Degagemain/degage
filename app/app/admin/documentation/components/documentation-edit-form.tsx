'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import {
  type Documentation,
  type DocumentationAudienceRole,
  type DocumentationFormat,
  type DocumentationTag,
  documentationAudienceRoleValues,
  documentationFormatValues,
  documentationSchema,
  documentationTagValues,
} from '@/domain/documentation.model';
import { type ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { apiPost, apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { AdminLocaleTabsControl } from '@/app/components/form/admin-locale-tabs-control';
import { AdminMultiSelectFieldControl } from '@/app/components/form/admin-multi-select-field-control';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';
import { Button } from '@/app/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/app/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { Page } from '@/domain/page.model';
import { MaxTake } from '@/domain/utils';

export const DOCUMENTATION_EDIT_FORM_ID = 'documentation-edit-form';

const translationRecords = (doc: Documentation) => {
  const title = emptyContentLocaleRecord();
  const content = emptyContentLocaleRecord();
  for (const tr of doc.translations) {
    if (tr.locale in title) {
      title[tr.locale as ContentLocale] = tr.title;
      content[tr.locale as ContentLocale] = tr.content;
    }
  }
  return { title, content };
};

interface DocumentationEditFormProps {
  initialDocumentation: Documentation;
  formId?: string;
}

export function DocumentationEditForm({ initialDocumentation, formId = DOCUMENTATION_EDIT_FORM_ID }: DocumentationEditFormProps) {
  const t = useTranslations('admin.documentation');
  const tForm = useTranslations('admin.documentation.form');
  const tCommon = useTranslations('admin.common');
  const tColumns = useTranslations('admin.documentation.columns');
  const tDocGroups = useTranslations('admin.documentationGroups');
  const router = useRouter();

  const [groupSelectOptions, setGroupSelectOptions] = useState<{ value: string; label: string }[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setGroupsLoading(true);
      try {
        const response = await fetch(`/api/documentation-groups?take=${String(MaxTake)}&sortBy=sortOrder&sortOrder=asc`);
        if (!response.ok || cancelled) return;
        const result: Page<DocumentationGroup> = await response.json();
        if (cancelled) return;
        setGroupSelectOptions(result.records.filter((g) => g.id).map((g) => ({ value: g.id!, label: g.name })));
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setGroupsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isCreate = initialDocumentation.id === null;
  const isContentLocked = !isCreate && (initialDocumentation.source === 'repository' || initialDocumentation.source === 'notion');
  const initialRecords = useMemo(() => translationRecords(initialDocumentation), [initialDocumentation]);

  const [isFaq, setIsFaq] = useState(initialDocumentation.isFaq);
  const [isPublic, setIsPublic] = useState(initialDocumentation.isPublic);
  const [groupIds, setGroupIds] = useState<string[]>(() => initialDocumentation.groups.map((g) => g.id).filter(Boolean) as string[]);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(defaultContentLocale);
  const [titleByLocale, setTitleByLocale] = useState(() => initialRecords.title);
  const [contentByLocale, setContentByLocale] = useState(() => initialRecords.content);
  const [audienceRoles, setAudienceRoles] = useState<DocumentationAudienceRole[]>(initialDocumentation.audienceRoles);
  const [tags, setTags] = useState<DocumentationTag[]>(initialDocumentation.tags);
  const [isSaving, setIsSaving] = useState(false);
  const [formatState, setFormatState] = useState<DocumentationFormat>(initialDocumentation.format);

  const displayTitle = useMemo(() => {
    const primary =
      initialDocumentation.translations.find((tr) => tr.locale === defaultContentLocale)?.title ?? initialDocumentation.translations[0]?.title;
    return primary ?? initialDocumentation.externalId;
  }, [initialDocumentation]);

  const effectiveFormat = isCreate ? formatState : initialDocumentation.format;

  const sourceLabel = useMemo(() => {
    const key = { repository: 'filters.sourceRepository', notion: 'filters.sourceNotion', manual: 'filters.sourceManual' } as const;
    return t(key[initialDocumentation.source]);
  }, [initialDocumentation.source, t]);

  const formatLabel = useMemo(() => {
    const key = { markdown: 'filters.formatMarkdown', text: 'filters.formatText' } as const;
    return t(key[initialDocumentation.format]);
  }, [initialDocumentation.format, t]);

  const groupOptionsMerged = useMemo(() => {
    const map = new Map(groupSelectOptions.map((o) => [o.value, o.label]));
    for (const g of initialDocumentation.groups) {
      if (g.id && !map.has(g.id)) {
        map.set(g.id, g.name ?? g.id);
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [groupSelectOptions, initialDocumentation.groups]);

  const audienceOptions = useMemo(
    () =>
      documentationAudienceRoleValues.map((role) => ({
        value: role,
        label: tColumns(`audienceRole.${role}`),
      })),
    [tColumns],
  );

  const tagOptions = useMemo(() => documentationTagValues.map((tag) => ({ value: tag, label: tag })), []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isContentLocked) {
      for (const locale of contentLocales) {
        if (!titleByLocale[locale]?.trim()) {
          toast.error(tCommon('validation.required'));
          return;
        }
      }
    }

    const groups = groupIds
      .map((id) => ({
        id,
        name: groupOptionsMerged.find((o) => o.value === id)?.label,
      }))
      .filter((g) => g.id);

    const translations = isContentLocked
      ? initialDocumentation.translations
      : contentLocales.map((locale) => ({
          locale,
          title: titleByLocale[locale].trim(),
          content: contentByLocale[locale] ?? '',
        }));

    if (isCreate) {
      const payload = documentationSchema.parse({
        id: null,
        source: 'manual',
        externalId: '',
        format: formatState,
        isFaq,
        isPublic,
        groups,
        translations,
        audienceRoles,
        tags,
        createdAt: null,
        updatedAt: null,
      });

      setIsSaving(true);
      try {
        const response = await apiPost('/api/documentation', payload);
        if (!response.ok) {
          const message = await parseApiErrorMessage(response, tForm('saveError'));
          toast.error(message);
          return;
        }
        const raw: unknown = await response.json();
        const created = documentationSchema.safeParse(raw);
        if (!created.success || !created.data.externalId) {
          toast.error(tForm('saveError'));
          return;
        }
        toast.success(tForm('saveSuccess'));
        router.push(`/app/admin/documentation/${encodeURIComponent(created.data.externalId)}`);
        router.refresh();
      } catch {
        toast.error(tForm('saveError'));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!initialDocumentation.id) {
      toast.error(tForm('saveError'));
      return;
    }

    const payload = documentationSchema.parse({
      ...initialDocumentation,
      isFaq,
      isPublic,
      groups,
      translations,
      audienceRoles: isContentLocked ? initialDocumentation.audienceRoles : audienceRoles,
      tags: isContentLocked ? initialDocumentation.tags : tags,
    });

    setIsSaving(true);
    try {
      const response = await apiPut(`/api/documentation/${initialDocumentation.id}`, payload);
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tForm('saveError'));
        toast.error(message);
        return;
      }
      toast.success(tForm('saveSuccess'));
      router.push(`/app/admin/documentation/${encodeURIComponent(initialDocumentation.externalId)}`);
      router.refresh();
    } catch {
      toast.error(tForm('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const contentTextareaClass =
    effectiveFormat === 'markdown' ? 'font-mono min-h-[24rem] text-sm leading-relaxed' : 'min-h-[16rem] font-sans text-sm leading-relaxed';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-3 md:px-4">
        <div className="flex h-14 flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button type="submit" form={formId} disabled={isSaving} variant="outline" size="sm">
              <Save className="size-3.5" />
              {isSaving ? tCommon('status.saving') : tForm('save')}
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link
                href={isCreate ? '/app/admin/documentation' : `/app/admin/documentation/${encodeURIComponent(initialDocumentation.externalId)}`}
              >
                {tForm('cancel')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <form id={formId} onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        <h1 className="mb-4 text-xl font-semibold tracking-tight">{isCreate ? tForm('createTitle') : displayTitle}</h1>
        {isContentLocked ? (
          <p className="text-muted-foreground bg-muted/50 mb-6 max-w-3xl rounded-md border px-3 py-2 text-sm">{tForm('syncedSourceNotice')}</p>
        ) : null}

        <FieldGroup className="max-w-3xl gap-6">
          {isCreate ? (
            <Field className="max-w-xl">
              <FieldLabel>{tForm('format')}</FieldLabel>
              <Select value={formatState} onValueChange={(v) => setFormatState(v as DocumentationFormat)} disabled={isSaving}>
                <SelectTrigger className="w-full max-w-xs" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentationFormatValues.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt === 'markdown' ? t('filters.formatMarkdown') : t('filters.formatText')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : (
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">{tForm('source')}</span>
                <p>{sourceLabel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{tForm('format')}</span>
                <p>{formatLabel}</p>
              </div>
            </div>
          )}

          <AdminSwitchFieldControl id="doc-is-faq" label={tForm('isFaq')} checked={isFaq} onChange={setIsFaq} disabled={isSaving} />
          <AdminSwitchFieldControl id="doc-is-public" label={tForm('isPublic')} checked={isPublic} onChange={setIsPublic} disabled={isSaving} />

          <AdminMultiSelectFieldControl
            label={tColumns('groups')}
            options={groupOptionsMerged}
            values={groupIds}
            onValuesChange={setGroupIds}
            placeholder={tForm('multiSelectGroups')}
            searchPlaceholder={tDocGroups('searchPlaceholder')}
            disabled={isSaving}
            loading={groupsLoading}
            emptyText={tForm('groupsEmpty')}
          />

          {!isContentLocked ? (
            <>
              <AdminMultiSelectFieldControl
                label={tForm('audience')}
                options={audienceOptions}
                values={audienceRoles}
                onValuesChange={(v) => setAudienceRoles(v as DocumentationAudienceRole[])}
                placeholder={tForm('multiSelectAudience')}
                disabled={isSaving}
              />

              <AdminMultiSelectFieldControl
                label={tForm('tags')}
                options={tagOptions}
                values={tags}
                onValuesChange={(v) => setTags(v as DocumentationTag[])}
                placeholder={tForm('multiSelectTags')}
                disabled={isSaving}
                monospaceOptions
              />

              <div className="max-w-3xl space-y-3">
                <AdminLocaleTabsControl
                  locales={contentLocales}
                  activeLocale={activeLocale}
                  onLocaleChange={setActiveLocale}
                  disabled={isSaving}
                />
                <AdminTextFieldControl
                  label={tForm('titleField')}
                  value={titleByLocale[activeLocale]}
                  onChange={(value) => setTitleByLocale((prev) => ({ ...prev, [activeLocale]: value }))}
                  disabled={isSaving}
                />
                <Field>
                  <FieldLabel>{tForm('content')}</FieldLabel>
                  <Textarea
                    value={contentByLocale[activeLocale]}
                    onChange={(e) => setContentByLocale((prev) => ({ ...prev, [activeLocale]: e.target.value }))}
                    disabled={isSaving}
                    className={contentTextareaClass}
                    rows={effectiveFormat === 'markdown' ? 24 : 14}
                  />
                </Field>
              </div>
            </>
          ) : (
            <div className="max-w-3xl space-y-2">
              <FieldLabel>{tForm('content')}</FieldLabel>
              <p className="text-muted-foreground text-sm">{tForm('syncedContentReadOnly')}</p>
            </div>
          )}
        </FieldGroup>
      </form>
    </div>
  );
}
