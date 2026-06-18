const ICON_VIEW = '<svg class="action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>';

const ICON_SYNC = '<svg class="action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"/></svg>';

const ICON_CHECK = '<svg class="action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';

export function renderRowActions(draftId: string, options: {
  syncing?: boolean;
  synced?: boolean;
}): string {
  const detailUrl = `/drafts/detail?id=${encodeURIComponent(draftId)}`;

  let syncBtn = '';
  if (options.syncing) {
    syncBtn = `<button type="button" class="action-btn action-btn-sync" disabled aria-label="Envoi vers X3 en cours">
      <span class="action-spinner" aria-hidden="true"></span>
      <span class="action-label">Envoi…</span>
    </button>`;
  } else if (options.synced) {
    syncBtn = `<button type="button" class="action-btn action-btn-sync action-btn-sync-done" disabled aria-label="Déjà envoyé vers X3">
      ${ICON_CHECK}
      <span class="action-label">Envoyé</span>
    </button>`;
  } else {
    syncBtn = `<button type="button" class="action-btn action-btn-sync btn-sync-x3" data-id="${draftId}" aria-label="Envoyer vers Sage X3">
      ${ICON_SYNC}
      <span class="action-label">Envoyer X3</span>
    </button>`;
  }

  return `<div class="table-actions">
    <a href="${detailUrl}" class="action-btn action-btn-view" aria-label="Voir le détail de l'intervention">
      ${ICON_VIEW}
      <span class="action-label">Voir</span>
    </a>
    ${syncBtn}
  </div>`;
}
