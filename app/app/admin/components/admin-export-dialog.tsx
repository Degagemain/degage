'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export type AdminExportFormat = 'csv' | 'json';

const filenameFromContentDisposition = (header: string | null): string | null => {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) return decodeURIComponent(utf8[1].replace(/["']/g, '').trim());
  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) return quoted[1];
  const plain = /filename=([^;\s]+)/i.exec(header);
  if (plain?.[1]) return plain[1].replace(/["']/g, '').trim();
  return null;
};

interface AdminExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildExportUrl: (format: AdminExportFormat) => string;
}

export function AdminExportDialog({ open, onOpenChange, buildExportUrl }: AdminExportDialogProps) {
  const t = useTranslations('admin.common.export');
  const [format, setFormat] = useState<AdminExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && isExporting) return;
      onOpenChange(next);
    },
    [isExporting, onOpenChange],
  );

  const runExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const url = buildExportUrl(format);
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        toast.error(t('error'));
        return;
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      const fromHeader = filenameFromContentDisposition(response.headers.get('Content-Disposition'));
      a.download = fromHeader ?? (format === 'csv' ? 'export.csv' : 'export.json');
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      onOpenChange(false);
    } catch {
      toast.error(t('error'));
    } finally {
      setIsExporting(false);
    }
  }, [buildExportUrl, format, onOpenChange, t]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isExporting}>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="admin-export-format">{t('format')}</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as AdminExportFormat)} disabled={isExporting}>
            <SelectTrigger id="admin-export-format" className="w-full sm:w-56" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">{t('formatCsv')}</SelectItem>
              <SelectItem value="json">{t('formatJson')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isExporting}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={() => void runExport()} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
