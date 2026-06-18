import type { Article, Parc, ParcHistory, Question, Report } from './types';
import { displayValue } from './utils';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function val(value: unknown): string {
  return escapeHtml(displayValue(value));
}

function reportStats(report?: Report): { answered: number; total: number; requiredMissing: number } {
  const questions = report?.questions ?? [];
  const answered = questions.filter((q) => q.reponse?.trim()).length;
  const requiredMissing = questions.filter((q) => q.required === 'Oui' && !q.reponse?.trim()).length;
  return { answered, total: questions.length, requiredMissing };
}

function statusClass(status: string): string {
  if (status === 'Terminé') return 'parc-status-done';
  if (status === 'Brouillon') return 'parc-status-draft';
  return 'parc-status-other';
}

function renderStars(rating?: number): string {
  if (!rating) return '<span class="text-gray-400 text-sm">—</span>';
  const full = Math.round(rating);
  return `<span class="parc-stars" title="${rating}/5">${'★'.repeat(full)}<span class="parc-stars-empty">${'★'.repeat(5 - full)}</span></span>`;
}

function renderSignature(report: Report, which: 'technicien' | 'client'): string {
  const html = which === 'technicien' ? report.technicienSignature : report.clientSignature;
  const b64 = which === 'technicien' ? report.technicienSignatureBase64 : report.clientSignatureBase64;
  const label = which === 'technicien' ? 'Technicien' : 'Client';

  if (html) {
    return `<div class="parc-signature-box" data-signature-html>${html}</div>`;
  }
  if (b64) {
    const src = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
    return `<img src="${src}" alt="Signature ${label}" class="parc-signature-img" loading="lazy" />`;
  }
  return '<span class="parc-empty">Non signé</span>';
}

function renderQuestionCard(q: Question, mode: 'question' | 'checkbox'): string {
  const missing = q.required === 'Oui' && !q.reponse?.trim();
  const answer = q.reponse?.trim();
  let answerHtml = '';

  if (mode === 'checkbox') {
    const yes = answer?.toLowerCase() === 'oui' || answer?.toLowerCase() === 'true' || answer === '1';
    const no = answer?.toLowerCase() === 'non' || answer?.toLowerCase() === 'false' || answer === '0';
    if (yes) answerHtml = '<span class="parc-answer-badge parc-answer-yes">Oui</span>';
    else if (no) answerHtml = '<span class="parc-answer-badge parc-answer-no">Non</span>';
    else if (answer) answerHtml = `<span class="parc-answer-badge">${val(answer)}</span>`;
    else answerHtml = '<span class="parc-answer-badge parc-answer-missing">—</span>';
  } else {
    answerHtml = answer
      ? `<span class="parc-answer-text">${val(answer)}${q.unite ? ` <span class="parc-answer-unit">${val(q.unite)}</span>` : ''}</span>`
      : '<span class="parc-answer-missing-text">Non renseigné</span>';
  }

  return `
    <div class="parc-question-card ${missing ? 'parc-question-missing' : ''}">
      <div class="parc-question-head">
        <span class="parc-question-pos">${q.pos ?? '·'}</span>
        <span class="parc-question-title">${val(q.intitule)}</span>
        ${q.required === 'Oui' ? '<span class="parc-required">Obligatoire</span>' : ''}
      </div>
      <div class="parc-question-answer">${answerHtml}</div>
    </div>`;
}

function renderReportPanel(report: Report, parcId: string, tab: 'final' | 'draft'): string {
  const questions = report.questions ?? [];
  const questionnaire = questions.filter((q) => q.type === 'question' || !q.type);
  const checklist = questions.filter((q) => q.type === 'checkbox');
  const stats = reportStats(report);
  const status = report.reportStatus ?? 'Brouillon';
  const images = report.images ?? [];
  const hidden = tab === 'draft' ? 'hidden' : '';

  const infoItems = [
    { label: 'Date', value: report.date },
    { label: 'Technicien', value: report.technicien },
    { label: 'Client', value: report.client },
    { label: 'Site', value: report.site },
    { label: 'N° série', value: report.serie, mono: true },
    { label: 'Marque', value: report.marque },
    { label: 'Modèle', value: report.model },
    { label: 'Localisation', value: report.localisation },
    { label: 'Réf. client', value: report.referenceClient },
  ].filter((i) => i.value);

  return `
    <div class="parc-report-panel ${hidden}" data-report-panel="${tab}" data-parc="${parcId}">
      <div class="parc-report-banner ${statusClass(status)}">
        <div>
          <div class="parc-report-banner-label">Statut rapport</div>
          <div class="parc-report-banner-value">${val(status)}</div>
        </div>
        <div class="parc-report-banner-stats">
          <span>${stats.answered}/${stats.total} réponses</span>
          ${stats.requiredMissing > 0 ? `<span class="parc-report-warn">${stats.requiredMissing} obligatoire(s) manquant(s)</span>` : ''}
        </div>
        <div class="parc-report-op">
          <span class="parc-report-banner-label">Équipement</span>
          <span class="parc-op-badge ${report.equipement_operationnel ? 'parc-op-yes' : 'parc-op-no'}">
            ${report.equipement_operationnel ? 'Opérationnel' : 'Non opérationnel'}
          </span>
        </div>
      </div>

      ${report.intitule || report.rapportIntervention ? `
        <div class="parc-report-intro">
          ${report.intitule ? `<h4 class="parc-report-title">${val(report.intitule)}</h4>` : ''}
          ${report.rapportIntervention ? `<p class="parc-report-desc">${val(report.rapportIntervention)}</p>` : ''}
          ${report.interventionText && report.interventionText !== '-' ? `<code class="parc-report-code">${val(report.interventionText)}</code>` : ''}
        </div>` : ''}

      ${infoItems.length ? `
        <div class="parc-info-grid">
          ${infoItems.map((i) => `
            <div class="parc-info-item">
              <span class="parc-info-label">${i.label}</span>
              <span class="parc-info-value ${i.mono ? 'font-mono' : ''}">${val(i.value)}</span>
            </div>`).join('')}
        </div>` : ''}

      ${report.commentaireTechnicien || report.commentaireClient ? `
        <div class="parc-comments-grid">
          ${report.commentaireTechnicien ? `
            <div class="parc-comment parc-comment-tech">
              <div class="parc-comment-label">Commentaire technicien</div>
              <p>${val(report.commentaireTechnicien)}</p>
            </div>` : ''}
          ${report.commentaireClient ? `
            <div class="parc-comment parc-comment-client">
              <div class="parc-comment-label">Commentaire client</div>
              <p>${val(report.commentaireClient)}</p>
            </div>` : ''}
        </div>` : ''}

      ${report.clientRating ? `
        <div class="parc-rating-row">
          <span class="parc-info-label">Satisfaction client</span>
          ${renderStars(report.clientRating)}
          <span class="text-sm text-gray-500">${report.clientRating}/5</span>
        </div>` : ''}

      ${questionnaire.length ? `
        <div class="parc-section-block">
          <h5 class="parc-section-title">Questionnaire <span class="parc-section-count">${questionnaire.length}</span></h5>
          <div class="parc-questions-grid">${questionnaire.map((q) => renderQuestionCard(q, 'question')).join('')}</div>
        </div>` : ''}

      ${checklist.length ? `
        <div class="parc-section-block">
          <h5 class="parc-section-title">Checklist <span class="parc-section-count">${checklist.length}</span></h5>
          <div class="parc-checklist-grid">${checklist.map((q) => renderQuestionCard(q, 'checkbox')).join('')}</div>
        </div>` : ''}

      <div class="parc-section-block">
        <h5 class="parc-section-title">Signatures</h5>
        <div class="parc-signatures-grid">
          <div class="parc-signature-card">
            <div class="parc-signature-label">Technicien</div>
            ${renderSignature(report, 'technicien')}
          </div>
          <div class="parc-signature-card">
            <div class="parc-signature-label">Client ${report.isValidClientSingature ? '<span class="parc-sig-valid">✓ Valide</span>' : ''}</div>
            ${renderSignature(report, 'client')}
          </div>
        </div>
      </div>

      ${images.length ? `
        <div class="parc-section-block">
          <h5 class="parc-section-title">Photos <span class="parc-section-count">${images.length}</span></h5>
          <div class="parc-photos-grid">
            ${images.map((img, i) => {
              const src = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
              return `<button type="button" class="parc-photo-btn" data-photo-src="${src}" aria-label="Photo ${i + 1}">
                <img src="${src}" alt="Photo ${i + 1}" loading="lazy" />
              </button>`;
            }).join('')}
          </div>
        </div>` : ''}

      ${report.imagespath?.length ? `
        <details class="parc-details-sub">
          <summary>Chemins photos (${report.imagespath.length})</summary>
          <ul class="parc-path-list">${report.imagespath.map((p) => `<li>${val(p)}</li>`).join('')}</ul>
        </details>` : ''}
    </div>`;
}

function renderArticles(articles: Article[]): string {
  return `
    <div class="parc-table-wrap">
      <table class="parc-table">
        <thead><tr>
          <th>ID</th><th>Désignation</th><th>Qté</th><th>Réf.</th><th>Firmware</th><th>Logiciel</th>
        </tr></thead>
        <tbody>
          ${articles.map((a) => `
            <tr>
              <td class="font-mono text-xs">${val(a.articleid)}</td>
              <td>${val(a.designation)}</td>
              <td>${val(a.quantity)}</td>
              <td>${val(a.reference)}</td>
              <td>${val(a.firmware)}</td>
              <td>${val(a.software)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderHistory(history: ParcHistory[]): string {
  return `<div class="parc-timeline">${history.map((h) => `
    <div class="parc-timeline-item">
      <div class="parc-timeline-dot"></div>
      <div class="parc-timeline-body">
        <div class="parc-timeline-meta">${val(h.date)} · ${val(h.technicien)}</div>
        <p>${val(h.commentaire)}</p>
      </div>
    </div>`).join('')}</div>`;
}

function renderParcCard(parc: Parc, index: number): string {
  const report = parc.report ?? {};
  const status = report.reportStatus ?? parc.reportState ?? 'Brouillon';
  const stats = reportStats(report);
  const pct = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : (status === 'Terminé' ? 100 : 0);

  const specChips = [
    parc.marque_designation && { label: 'Marque', value: parc.marque_designation },
    parc.article && { label: 'Article', value: parc.article },
    parc.localisation && { label: 'Loc.', value: parc.localisation },
    parc.typeContrat && { label: 'Contrat', value: parc.typeContrat },
  ].filter(Boolean) as { label: string; value: string }[];

  return `
    <article class="parc-card ${statusClass(status)}" id="parc-${parc.id}" data-parc-id="${parc.id}">
      <header class="parc-card-header">
        <div class="parc-card-header-main">
          <div class="parc-card-index">${index + 1}</div>
          <div class="parc-card-titles">
            <h3 class="parc-card-name">${val(parc.designation)}</h3>
            <p class="parc-card-sub">${val(parc.numserie)}${parc.marque_designation ? ` · ${val(parc.marque_designation)}` : ''}</p>
            ${specChips.length ? `<div class="parc-chips">${specChips.map((c) => `<span class="parc-chip"><span class="parc-chip-k">${c.label}</span>${val(c.value)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
        <div class="parc-card-header-actions">
          <span class="parc-status-pill ${statusClass(status)}">${val(status)}</span>
          <div class="parc-progress" title="${stats.answered}/${stats.total} réponses">
            <div class="parc-progress-bar"><div class="parc-progress-fill" style="width:${pct}%"></div></div>
            <span class="parc-progress-label">${pct}%</span>
          </div>
          <button type="button" class="pdf-btn parc-pdf-btn" data-parc-id="${parc.id}">PDF</button>
        </div>
      </header>

      <div class="parc-accordion">
        <details class="parc-details" open>
          <summary>Équipement</summary>
          <div class="parc-details-body">
            <div class="parc-info-grid">
              ${[
                { label: 'ID parc', value: parc.id, mono: true },
                { label: 'ID intervention', value: parc.interventionId, mono: true },
                { label: 'N° série', value: parc.numserie, mono: true },
                { label: 'Article', value: parc.article },
                { label: 'Marque', value: parc.marque_designation },
                { label: 'Localisation', value: parc.localisation },
                { label: 'Site', value: parc.designationSite },
                { label: 'Adresse site', value: parc.addressSite },
                { label: 'Type contrat', value: parc.typeContrat },
                { label: 'Couverture', value: parc.couvertureParContrat },
                { label: 'Parc forcé', value: parc.forced },
                { label: 'État rapport', value: parc.reportState },
              ].map((f) => `
                <div class="parc-info-item">
                  <span class="parc-info-label">${f.label}</span>
                  <span class="parc-info-value ${f.mono ? 'font-mono text-xs' : ''}">${val(f.value)}</span>
                </div>`).join('')}
            </div>
          </div>
        </details>

        ${(parc.articles?.length ?? 0) > 0 ? `
          <details class="parc-details">
            <summary>Articles <span class="parc-section-count">${parc.articles!.length}</span></summary>
            <div class="parc-details-body">${renderArticles(parc.articles!)}</div>
          </details>` : ''}

        ${(parc.parcHistoryList?.length ?? 0) > 0 ? `
          <details class="parc-details">
            <summary>Historique <span class="parc-section-count">${parc.parcHistoryList!.length}</span></summary>
            <div class="parc-details-body">${renderHistory(parc.parcHistoryList!)}</div>
          </details>` : ''}

        <details class="parc-details parc-details-report" open>
          <summary>Rapport d'intervention</summary>
          <div class="parc-details-body">
            <div class="parc-report-tabs" role="tablist">
              <button type="button" class="parc-report-tab active" data-parc="${parc.id}" data-tab="final">Rapport final</button>
              <button type="button" class="parc-report-tab" data-parc="${parc.id}" data-tab="draft">Brouillon</button>
            </div>
            ${renderReportPanel(parc.report ?? {}, parc.id, 'final')}
            ${renderReportPanel(parc.reportDraft ?? {}, parc.id, 'draft')}
          </div>
        </details>
      </div>
    </article>`;
}

export function renderParcsOverview(parcs: Parc[]): string {
  const done = parcs.filter((p) => (p.report?.reportStatus ?? '') === 'Terminé').length;
  const total = parcs.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return `
    <div class="parc-overview">
      <div class="parc-overview-stat">
        <span class="parc-overview-num">${total}</span>
        <span class="parc-overview-label">équipement${total !== 1 ? 's' : ''}</span>
      </div>
      <div class="parc-overview-stat">
        <span class="parc-overview-num parc-overview-done">${done}</span>
        <span class="parc-overview-label">rapport${done !== 1 ? 's' : ''} terminé${done !== 1 ? 's' : ''}</span>
      </div>
      <div class="parc-overview-progress">
        <div class="parc-overview-bar"><div class="parc-overview-fill" style="width:${pct}%"></div></div>
        <span class="text-xs text-gray-500">${pct}% complété</span>
      </div>
      ${total > 1 ? `
        <nav class="parc-jump-nav" aria-label="Navigation parcs">
          ${parcs.map((p, i) => `<a href="#parc-${p.id}" class="parc-jump-link">${i + 1}. ${val(p.designation ?? p.numserie ?? 'Parc')}</a>`).join('')}
        </nav>` : ''}
    </div>`;
}

export function renderParcsHtml(parcs: Parc[]): string {
  if (!parcs.length) {
    return '<p class="parc-empty-state">Aucun équipement sur cette intervention.</p>';
  }
  return renderParcsOverview(parcs) + `<div class="parc-list">${parcs.map((p, i) => renderParcCard(p, i)).join('')}</div>`;
}

export function initParcInteractions(
  root: HTMLElement,
  onPdfClick: (parcId: string) => void,
): void {
  root.querySelectorAll('.pdf-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parcId = btn.getAttribute('data-parc-id');
      if (parcId) onPdfClick(parcId);
    });
  });

  root.querySelectorAll('.parc-report-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const parcId = tab.getAttribute('data-parc');
      const which = tab.getAttribute('data-tab');
      if (!parcId || !which) return;

      root.querySelectorAll(`.parc-report-tab[data-parc="${parcId}"]`).forEach((t) => {
        t.classList.toggle('active', t === tab);
      });
      root.querySelectorAll(`.parc-report-panel[data-parc="${parcId}"]`).forEach((panel) => {
        panel.classList.toggle('hidden', panel.getAttribute('data-report-panel') !== which);
      });
    });
  });

  root.querySelectorAll('.parc-photo-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-photo-src');
      if (!src) return;
      let lightbox = document.getElementById('parc-photo-lightbox');
      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'parc-photo-lightbox';
        lightbox.className = 'parc-lightbox hidden';
        lightbox.innerHTML = `
          <button type="button" class="parc-lightbox-close" aria-label="Fermer">×</button>
          <img class="parc-lightbox-img" alt="Photo agrandie" />`;
        document.body.appendChild(lightbox);
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox || (e.target as HTMLElement).classList.contains('parc-lightbox-close')) {
            lightbox!.classList.add('hidden');
          }
        });
      }
      const img = lightbox.querySelector('.parc-lightbox-img') as HTMLImageElement;
      img.src = src;
      lightbox.classList.remove('hidden');
    });
  });
}
