import type { DraftFilters, DraftListResponse, Intervention, InterventionDraft, Report, User } from './types';

const API = import.meta.env.PUBLIC_API_URL || 'http://193.95.53.114:4001';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<User> {
  const res = await fetch(`${API}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse<{ userId: string }>(res);
  const userRes = await fetch(`${API}/api/users/${data.userId}`);
  return handleResponse<User>(userRes);
}

export async function listUsers(): Promise<User[]> {
  const res = await fetch(`${API}/api/users`);
  return handleResponse<User[]>(res);
}

function buildFilterQuery(params: DraftFilters): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  });
  return qs.toString();
}

export async function listDrafts(params: DraftFilters = {}): Promise<InterventionDraft[]> {
  const query = buildFilterQuery({ limit: 500, ...params });
  const res = await fetch(`${API}/api/interventiondrafts?${query}`);
  if (res.status === 404) return [];
  const data = await handleResponse<InterventionDraft[] | DraftListResponse>(res);
  if (Array.isArray(data)) return data;
  return data.data ?? [];
}

export async function getDraft(id: string): Promise<InterventionDraft> {
  const res = await fetch(`${API}/api/interventiondrafts/${id}`);
  return handleResponse<InterventionDraft>(res);
}

/** Same flow as mobile InterventionActivity.stopedChronometer → updateIntervention + sendreport */
export async function sendInterventionToX3(intervention: Intervention): Promise<void> {
  const payload = { ...intervention, state: 'oui' };
  const body = JSON.stringify({ intervention: JSON.stringify(payload) });

  const updateUrl = intervention.isPlanified === false
    ? `${API}/api/interventions/updateinterventionnp`
    : `${API}/api/interventions/updateintervention`;

  const updateRes = await fetch(updateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!updateRes.ok) {
    const text = await updateRes.text().catch(() => updateRes.statusText);
    throw new Error(text || `Échec mise à jour intervention (${updateRes.status})`);
  }

  const reportRes = await fetch(`${API}/api/interventions/sendreport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!reportRes.ok) {
    const text = await reportRes.text().catch(() => reportRes.statusText);
    throw new Error(text || `Échec envoi rapport (${reportRes.status})`);
  }
}

export async function generatePdf(report: Report): Promise<Blob> {
  const res = await fetch(`${API}/api/rapports/generaterapport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error(`PDF generation failed: ${res.status}`);
  return res.blob();
}

export { API };
