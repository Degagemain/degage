'use client';

import { useEffect, useState } from 'react';
import { SystemParameter, SystemParameterType } from '@/domain/system-parameter.model';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface EditParameterDialogProps {
  parameter: SystemParameter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, payload: Record<string, unknown>) => Promise<void>;
  t: (key: string) => string;
}

interface EuroNormOption {
  id: string;
  code: string;
  name: string;
}

export function EditParameterDialog({ parameter, open, onOpenChange, onSave, t }: EditParameterDialogProps) {
  const [valueNumber, setValueNumber] = useState<string>('');
  const [valueNumberMin, setValueNumberMin] = useState<string>('');
  const [valueNumberMax, setValueNumberMax] = useState<string>('');
  const [valueEuronormId, setValueEuronormId] = useState<string>('');
  const [euroNorms, setEuroNorms] = useState<EuroNormOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parameter) return;
    setValueNumber(parameter.valueNumber != null ? String(parameter.valueNumber) : '');
    setValueNumberMin(parameter.valueNumberMin != null ? String(parameter.valueNumberMin) : '');
    setValueNumberMax(parameter.valueNumberMax != null ? String(parameter.valueNumberMax) : '');
    setValueEuronormId(parameter.valueEuronormId ?? '');
  }, [parameter]);

  useEffect(() => {
    if (!open || parameter?.type !== SystemParameterType.EURONORM) return;
    fetch('/api/euro-norms?take=100')
      .then((res) => res.json())
      .then((data: { records: EuroNormOption[] }) => setEuroNorms(data.records ?? []))
      .catch(() => setEuroNorms([]));
  }, [open, parameter?.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parameter?.id) return;
    setError(null);
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {};
      switch (parameter.type) {
        case SystemParameterType.NUMBER:
          payload.valueNumber = valueNumber === '' ? null : Number.parseFloat(valueNumber);
          break;
        case SystemParameterType.NUMBER_RANGE:
          payload.valueNumberMin = valueNumberMin === '' ? null : Number.parseFloat(valueNumberMin);
          payload.valueNumberMax = valueNumberMax === '' ? null : Number.parseFloat(valueNumberMax);
          break;
        case SystemParameterType.EURONORM:
          payload.valueEuronormId = valueEuronormId === '' ? null : valueEuronormId;
          break;
      }
      await onSave(parameter.id, payload);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!parameter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {parameter.name}
            {parameter.description ? ` — ${parameter.description}` : ''}
          </p>

          {parameter.type === SystemParameterType.NUMBER && (
            <div className="space-y-2">
              <Label htmlFor="valueNumber">{t('valueNumber')}</Label>
              <Input id="valueNumber" type="number" step="any" value={valueNumber} onChange={(e) => setValueNumber(e.target.value)} />
            </div>
          )}

          {parameter.type === SystemParameterType.NUMBER_RANGE && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valueNumberMin">{t('valueNumberMin')}</Label>
                <Input
                  id="valueNumberMin"
                  type="number"
                  step="any"
                  value={valueNumberMin}
                  onChange={(e) => setValueNumberMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valueNumberMax">{t('valueNumberMax')}</Label>
                <Input
                  id="valueNumberMax"
                  type="number"
                  step="any"
                  value={valueNumberMax}
                  onChange={(e) => setValueNumberMax(e.target.value)}
                />
              </div>
            </div>
          )}

          {parameter.type === SystemParameterType.EURONORM && (
            <div className="space-y-2">
              <Label htmlFor="valueEuronormId">Euro norm</Label>
              <Select value={valueEuronormId || '__none__'} onValueChange={(v) => setValueEuronormId(v === '__none__' ? '' : v)}>
                <SelectTrigger id="valueEuronormId">
                  <SelectValue placeholder="Select euro norm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {euroNorms.map((en) => (
                    <SelectItem key={en.id} value={en.id}>
                      {en.name} ({en.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? '…' : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
