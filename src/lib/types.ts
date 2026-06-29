export type SyncStatus = 'draft' | 'pending' | 'processing' | 'synced' | 'failed';

export interface Question {
  pos?: number;
  id?: string;
  intitule?: string;
  unite?: string;
  reponse?: string;
  required?: string;
  type?: string;
}

export interface Report {
  technicienSignatureBase64?: string;
  clientSignatureBase64?: string;
  rapportIntervention?: string | null;
  intitule?: string | null;
  interventionText?: string | null;
  date?: string | null;
  technicien?: string | null;
  client?: string | null;
  site?: string | null;
  parcId?: string | null;
  serie?: string | null;
  marque?: string | null;
  model?: string | null;
  localisation?: string | null;
  referenceClient?: string | null;
  questions?: Question[];
  commentaireTechnicien?: string | null;
  commentaireClient?: string;
  technicienSignature?: string;
  equipement_operationnel?: boolean;
  clientSignature?: string;
  reportStatus?: string;
  clientRating?: number;
  isValidClientSingature?: string;
  imagespath?: string[];
  images?: string[];
}

export interface Article {
  articleid?: string | null;
  parcid?: string | null;
  designation?: string | null;
  us?: string | null;
  quantity?: number | null;
  type?: string | null;
  reference?: string | null;
  isSelected?: boolean;
  software?: string | null;
  firmware?: string | null;
}

export interface ParcHistory {
  date?: string | null;
  technicien?: string | null;
  commentaire?: string | null;
  parcId?: string | null;
  interventionId?: string | null;
}

export interface Parc {
  id: string;
  designation?: string;
  numserie?: string;
  article?: string;
  localisation?: string;
  marque?: string;
  marque_designation?: string;
  addressSite?: string;
  designationSite?: string;
  isSelected?: boolean;
  interventionId?: string;
  forced?: boolean;
  articles?: Article[];
  report?: Report;
  reportDraft?: Report;
  reportState?: string | null;
  parcHistoryList?: ParcHistory[];
  typeContrat?: string;
  couvertureParContrat?: string;
}

export interface RessourceIntervention {
  id_ressource?: string;
  designation_ressource?: string;
  quantiteRessource?: number;
  dateDebut?: string;
  dateFin?: string;
  heureDebut?: string;
  heureFin?: string;
  site_ressource?: string;
  interventionID?: string;
  state_resource?: string | null;
  reservation?: string | null;
  startdatetimestamp?: string;
  enddatetimestamp?: string;
  isSelected?: boolean;
}

export interface ChronometerData {
  id?: string | null;
  suspendedtime?: string | null;
  reviewtime?: string | null;
  percentageofcompletion?: string | null;
  observation?: string | null;
}

export interface Intervention {
  formattedDurationDate?: string | null;
  formattedstartDate?: string | null;
  formattedEndDate?: string | null;
  npid?: string | null;
  user?: string;
  mobilestatus?: string;
  isPlanified?: boolean | null;
  codeAdress?: string;
  id_client?: string | null;
  interventionId?: string | null;
  description?: string | null;
  technicienname?: string | null;
  technicienRealName?: string | null;
  client?: string | null;
  address?: string | null;
  parc?: string | null;
  tel?: string | null;
  email?: string | null;
  state?: string | null;
  type?: string | null;
  typeId?: string | null;
  urgency?: string | null;
  satisfaction?: string | null;
  date?: string | null;
  calendardate?: string | null;
  enddate?: string | null;
  realstartdate?: string | null;
  realstarttime?: string | null;
  realenddate?: string | null;
  realendtime?: string | null;
  debuteHour?: string | null;
  finishHour?: string | null;
  duration?: string | null;
  realduration?: string | null;
  idParcArray?: string[];
  parcs?: Parc[];
  pausedChronoDataArray?: ChronometerData[];
  ressources?: RessourceIntervention[];
  articleMissionExpense?: Article[];
  BL?: string;
  BL_Article?: string[];
  locationLatitude?: string;
  locationLongitude?: string;
  isSaved?: boolean;
  realdepartureDate?: string | null;
  realdepartureTime?: string | null;
  globalTechnicienSignature?: string;
  globalClientSignature?: string;
  globalClientRating?: number;
  globalClientComment?: string;
  globalClientSignatureValid?: string;
}

export interface InterventionDraft {
  id: string;
  user?: string;
  intervention: Intervention;
  insertDate?: string;
  date?: string;
  syncStatus?: SyncStatus;
  syncError?: string | null;
  syncedAt?: string | null;
  submittedAt?: string | null;
  submittedBy?: string | null;
}

export interface User {
  id?: string;
  id_x3?: string;
  realm?: string;
  fullname?: string;
  username?: string;
  email?: string;
  appversion?: string;
  isLastVersion?: boolean;
}

export interface DraftFilters {
  syncStatus?: string;
  user?: string;
  technicienname?: string;
  client?: string;
  interventionId?: string;
  type?: string;
  urgency?: string;
  isPlanified?: boolean | null;
  reportComplete?: boolean | null;
  dateFrom?: string;
  dateTo?: string;
  interventionDateFrom?: string;
  interventionDateTo?: string;
  limit?: number;
  skip?: number;
  order?: string;
}

export interface DraftListResponse {
  data?: InterventionDraft[];
  total?: number;
}
