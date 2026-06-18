import type { InterventionDraft, Parc } from './types';

export type DateFilterField = 'planned' | 'insert';

export function parseInvDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  if (/^\d{8}$/.test(dateStr)) {
    const y = +dateStr.slice(0, 4);
    const m = +dateStr.slice(4, 6) - 1;
    const d = +dateStr.slice(6, 8);
    return new Date(y, m, d);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function getDraftDate(draft: InterventionDraft, field: DateFilterField): Date | null {
  if (field === 'insert') {
    if (!draft.insertDate) return null;
    const d = new Date(draft.insertDate);
    return isNaN(d.getTime()) ? null : d;
  }
  return parseInvDate(draft.intervention?.date) ?? parseInvDate(draft.intervention?.realstartdate);
}

export function filterDraftsByDateRange(
  drafts: InterventionDraft[],
  field: DateFilterField,
  dateFrom?: string,
  dateTo?: string,
): InterventionDraft[] {
  if (!dateFrom && !dateTo) return drafts;

  return drafts.filter((draft) => {
    const d = getDraftDate(draft, field);
    if (!d) return false;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (d < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }
    return true;
  });
}

export function getDatePresetRange(preset: string): { from: string; to: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  switch (preset) {
    case 'today':
      return { from: fmt(today), to: fmt(today) };
    case 'week': {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay() + 1);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: fmt(start), to: fmt(end) };
    }
    default:
      return { from: '', to: '' };
  }
}

export interface EtatParcRow {
  parcId: string;
  designation?: string;
  numserie?: string;
  client?: string;
  interventionId: string;
  draftId: string;
  technicien: string;
  plannedDate: string;
  reportStatus: string;
  operational: boolean | null;
  done: boolean;
}

export function buildEtatDesLieux(drafts: InterventionDraft[]): EtatParcRow[] {
  const rows: EtatParcRow[] = [];
  drafts.forEach((draft) => {
    const inv = draft.intervention;
    const tech = inv.technicienRealName || inv.technicienname || draft.user || '—';
    const planned = inv.date
      ? `${inv.date}${inv.debuteHour ? ` ${inv.debuteHour}` : ''}`
      : '—';
    (inv.parcs ?? []).forEach((p: Parc) => {
      const status = p.report?.reportStatus ?? p.reportState ?? 'Brouillon';
      rows.push({
        parcId: p.id,
        designation: p.designation,
        numserie: p.numserie,
        client: inv.client,
        interventionId: inv.interventionId ?? draft.id,
        draftId: draft.id,
        technicien: tech,
        plannedDate: planned,
        reportStatus: status,
        operational: p.report?.equipement_operationnel ?? null,
        done: status === 'Terminé',
      });
    });
  });
  return rows.sort((a, b) => a.parcId.localeCompare(b.parcId, undefined, { numeric: true }));
}
