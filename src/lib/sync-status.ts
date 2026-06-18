import type { Report } from './types';
import type { Parc } from './types';

export type SyncStatusKey = 'draft' | 'pending' | 'processing' | 'synced' | 'failed';

export const SYNC_STATUS_ORDER: Record<SyncStatusKey, number> = {
  draft: 0, pending: 1, processing: 2, failed: 3, synced: 4,
};

export const SYNC_STATUS_LABELS: Record<SyncStatusKey, string> = {
  draft: 'Non synchronisée',
  pending: 'En attente',
  processing: 'En cours',
  synced: 'Synchronisé',
  failed: 'Échec',
};

export const SYNC_STATUS_CLASSES: Record<SyncStatusKey, string> = {
  draft: 'status-badge-draft',
  pending: 'status-badge-pending',
  processing: 'status-badge-processing',
  synced: 'status-badge-synced',
  failed: 'status-badge-failed',
};

const ICONS: Record<SyncStatusKey, string> = {
  draft: '<svg class="status-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm8.707 2.707a1 1 0 00-1.414-1.414L9 8.586V6a1 1 0 112 0v3a1 1 0 01-.293.707l-2 2a1 1 0 11-1.414-1.414L9.586 9H7a1 1 0 110-2h2.586l2.121-2.121z" clip-rule="evenodd"/></svg>',
  pending: '<svg class="status-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>',
  processing: '<svg class="status-icon status-icon-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>',
  synced: '<svg class="status-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
  failed: '<svg class="status-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
};

export function normalizeSyncStatus(status?: string): SyncStatusKey {
  if (status && status in SYNC_STATUS_LABELS) return status as SyncStatusKey;
  return 'draft';
}

export function renderSyncStatusBadge(status?: string, options?: { compact?: boolean }): string {
  const key = normalizeSyncStatus(status);
  const compactLabels: Record<SyncStatusKey, string> = {
    draft: 'Non sync.',
    pending: 'Attente',
    processing: 'En cours',
    synced: 'Sync.',
    failed: 'Échec',
  };
  const label = options?.compact ? compactLabels[key] : SYNC_STATUS_LABELS[key];
  const compactClass = options?.compact ? ' status-badge-compact' : '';
  return `<span class="status-badge ${SYNC_STATUS_CLASSES[key]}${compactClass}" title="${SYNC_STATUS_LABELS[key]}">
    ${ICONS[key]}
    <span>${label}</span>
  </span>`;
}

/** Use reportDraft for PDF when final report is not Terminé */
export function shouldUseDraftReport(parc: Parc): boolean {
  const status = parc.report?.reportStatus ?? parc.reportState ?? 'Brouillon';
  if (status === 'Terminé') return false;
  return hasReportContent(parc.reportDraft) || status === 'Brouillon';
}

function hasReportContent(report?: Report): boolean {
  if (!report) return false;
  return !!(
    report.questions?.length
    || report.commentaireTechnicien?.trim()
    || report.rapportIntervention?.trim()
    || report.intitule?.trim()
    || report.clientSignature
    || report.technicienSignature
    || report.images?.length
  );
}
