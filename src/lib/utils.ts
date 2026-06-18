import type { Intervention, InterventionDraft, Parc, Report } from './types';
import { shouldUseDraftReport } from './sync-status';

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Parse X3 date yyyyMMdd or ISO and optional HH:mm time */
export function formatX3DateTime(date?: string | null, time?: string | null): string {
  if (!date) return '—';
  let formatted = date;
  if (/^\d{8}$/.test(date)) {
    const y = date.slice(0, 4);
    const m = date.slice(4, 6);
    const d = date.slice(6, 8);
    formatted = `${d}/${m}/${y}`;
  } else {
    formatted = formatDateShort(date);
  }
  const t = formatX3Time(time);
  if (t) return `${formatted} ${t}`;
  return formatted;
}

/** Format X3 time: 1052 → 10:52, 900 → 09:00, 10:52 unchanged */
export function formatX3Time(time?: string | null): string {
  if (!time?.trim()) return '';
  const t = time.trim();
  if (/^\d{1,2}:\d{2}$/.test(t)) {
    const [h, m] = t.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  if (/^\d{3,4}$/.test(t)) {
    const padded = t.padStart(4, '0');
    return `${padded.slice(0, 2)}:${padded.slice(2)}`;
  }
  return t;
}

export function formatX3DateOnly(date?: string | null): string {
  if (!date) return '—';
  if (/^\d{8}$/.test(date)) {
    return `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`;
  }
  return formatDateShort(date);
}

export function formatPlannedSlot(inv: Intervention): string {
  const dateOnly = formatX3DateOnly(inv.date);
  const start = formatX3Time(inv.debuteHour);
  const end = formatX3Time(inv.finishHour);
  if (dateOnly === '—') return '—';
  if (start && end) return `${dateOnly} ${start} → ${end}`;
  if (start) return `${dateOnly} ${start}`;
  return dateOnly;
}

/** Date only for table planned-date column */
export function formatPlannedDateHtml(inv: Intervention): string {
  const date = formatX3DateOnly(inv.date);
  if (date === '—') return '<span class="text-gray-400">—</span>';
  return `<div class="date-cell-primary">${date}</div>`;
}

export function formatRealSlot(inv: Intervention): string {
  const start = formatX3DateTime(inv.realstartdate, inv.realstarttime);
  const end = formatX3DateTime(inv.realenddate, inv.realendtime);
  if (start === '—' && end === '—') return '—';
  if (end === '—') return start;
  return `${start} → ${end}`;
}

export function relativeDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  } catch {
    return dateStr;
  }
}

export function getReportCompletion(intervention: Intervention): { done: number; total: number } {
  const parcs = intervention.parcs ?? [];
  const total = parcs.length;
  const done = parcs.filter((p) => p.report?.reportStatus === 'Terminé').length;
  return { done, total };
}

export function isReportComplete(intervention: Intervention): boolean {
  const { done, total } = getReportCompletion(intervention);
  return total > 0 && done === total;
}

export function buildReportPayload(parc: Parc, intervention: Intervention, useDraft?: boolean): Report {
  const preferDraft = useDraft ?? shouldUseDraftReport(parc);
  const source = preferDraft
    ? (parc.reportDraft ?? parc.report)
    : (parc.report ?? parc.reportDraft);
  const report: Report = JSON.parse(JSON.stringify(source ?? {}));

  report.parcId = parc.id;
  report.commentaireTechnicien = report.commentaireTechnicien ?? '';
  if (!report.interventionText?.trim()) report.interventionText = '-';

  if (report.clientSignature) {
    report.clientSignatureBase64 =
      'data:image/svg;base64,' + btoa(unescape(encodeURIComponent(report.clientSignature)));
  }
  if (report.technicienSignature) {
    report.technicienSignatureBase64 =
      'data:image/svg;base64,' + btoa(unescape(encodeURIComponent(report.technicienSignature)));
  }

  report.model = parc.marque ?? report.model;
  report.marque = parc.marque_designation ?? report.marque;
  report.serie = report.serie || parc.numserie;
  report.site = report.site || parc.addressSite;
  report.client = report.client || intervention.client;
  report.technicien = report.technicien || intervention.technicienRealName;
  report.localisation = report.localisation || intervention.address;
  report.interventionText = report.interventionText || intervention.interventionId;

  return report;
}

export function applyClientFilters(
  drafts: InterventionDraft[],
  filters: {
    search?: string;
    user?: string;
    syncStatus?: string;
    type?: string;
    urgency?: string;
    isPlanified?: string;
    reportComplete?: string;
    parcId?: string;
    dateFrom?: string;
    dateTo?: string;
    interventionDateFrom?: string;
    interventionDateTo?: string;
  }
): InterventionDraft[] {
  function parseInvDate(dateStr?: string | null): Date | null {
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

  return drafts.filter((draft) => {
    const inv = draft.intervention ?? {};
    const search = (filters.search ?? '').toLowerCase();

    if (search) {
      const hay = [
        draft.id,
        inv.interventionId,
        inv.client,
        inv.technicienname,
        inv.technicienRealName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(search)) return false;
    }

    if (filters.user && draft.user !== filters.user && inv.technicienname !== filters.user) {
      return false;
    }

    if (filters.syncStatus && (draft.syncStatus ?? 'draft') !== filters.syncStatus) {
      return false;
    }

    if (filters.type && inv.type !== filters.type) return false;
    if (filters.urgency && inv.urgency !== filters.urgency) return false;

    if (filters.isPlanified === 'true' && inv.isPlanified !== true) return false;
    if (filters.isPlanified === 'false' && inv.isPlanified !== false) return false;

    if (filters.reportComplete === 'true' && !isReportComplete(inv)) return false;
    if (filters.reportComplete === 'false' && isReportComplete(inv)) return false;

    if (filters.parcId) {
      const q = filters.parcId.toLowerCase();
      const parcs = inv.parcs ?? [];
      const match = parcs.some((p) => p.id?.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filters.dateFrom && draft.insertDate) {
      if (new Date(draft.insertDate) < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo && draft.insertDate) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(draft.insertDate!) > end) return false;
    }

    const invDate = parseInvDate(inv.date) ?? parseInvDate(inv.realstartdate);
    if (filters.interventionDateFrom && invDate) {
      if (invDate < new Date(filters.interventionDateFrom)) return false;
    }
    if (filters.interventionDateTo && invDate) {
      const end = new Date(filters.interventionDateTo);
      end.setHours(23, 59, 59, 999);
      if (invDate > end) return false;
    }

    return true;
  });
}

export function parseIntervention(raw: unknown): Intervention {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Intervention;
    } catch {
      return {};
    }
  }
  return (raw as Intervention) ?? {};
}

export function normalizeDraft(draft: InterventionDraft): InterventionDraft {
  return {
    ...draft,
    syncStatus: draft.syncStatus ?? 'draft',
    intervention: parseIntervention(draft.intervention),
  };
}
