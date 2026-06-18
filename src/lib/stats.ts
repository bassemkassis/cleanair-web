import type { InterventionDraft } from './types';
import { getReportCompletion } from './utils';
import type { EtatParcRow } from './date-filters';
import { buildEtatDesLieux } from './date-filters';

export interface DashboardStats {
  total: number;
  drafts: number;
  synced: number;
  failed: number;
  inProgress: number;
  totalParcs: number;
  reportsDone: number;
  reportsTotal: number;
  planified: number;
  nonPlanified: number;
  byTechnicien: { name: string; count: number }[];
  byType: { type: string; count: number }[];
  byReportStatus: { status: string; count: number }[];
  recent: InterventionDraft[];
  etatDesLieux: EtatParcRow[];
}

export function computeDashboardStats(drafts: InterventionDraft[]): DashboardStats {
  let totalParcs = 0;
  let reportsDone = 0;
  let reportsTotal = 0;
  const techMap = new Map<string, number>();
  const typeMap = new Map<string, number>();
  const reportStatusMap = new Map<string, number>();

  drafts.forEach((d) => {
    const inv = d.intervention;
    const parcs = inv.parcs ?? [];
    totalParcs += parcs.length;
    const { done, total } = getReportCompletion(inv);
    reportsDone += done;
    reportsTotal += total;

    const tech = inv.technicienRealName || inv.technicienname || d.user || 'Inconnu';
    techMap.set(tech, (techMap.get(tech) ?? 0) + 1);

    const type = inv.type || 'Non défini';
    typeMap.set(type, (typeMap.get(type) ?? 0) + 1);

    (inv.parcs ?? []).forEach((p) => {
      const rs = p.report?.reportStatus ?? p.reportState ?? 'Brouillon';
      reportStatusMap.set(rs, (reportStatusMap.get(rs) ?? 0) + 1);
    });
  });

  const byTechnicien = [...techMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const byType = [...typeMap.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const byReportStatus = [...reportStatusMap.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const recent = [...drafts]
    .sort((a, b) => new Date(b.insertDate ?? 0).getTime() - new Date(a.insertDate ?? 0).getTime())
    .slice(0, 8);

  return {
    total: drafts.length,
    drafts: drafts.filter((d) => (d.syncStatus ?? 'draft') === 'draft').length,
    synced: drafts.filter((d) => d.syncStatus === 'synced' || d.intervention.state === 'oui').length,
    failed: drafts.filter((d) => d.syncStatus === 'failed').length,
    inProgress: drafts.filter((d) => ['pending', 'processing'].includes(d.syncStatus ?? '')).length,
    totalParcs,
    reportsDone,
    reportsTotal,
    planified: drafts.filter((d) => d.intervention.isPlanified !== false).length,
    nonPlanified: drafts.filter((d) => d.intervention.isPlanified === false).length,
    byTechnicien,
    byType,
    byReportStatus,
    recent,
    etatDesLieux: buildEtatDesLieux(drafts),
  };
}
