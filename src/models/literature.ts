import { UIForm } from 'mithril-ui-form';
import { LITERATURE_TYPE } from './data-model';

export const literatureTypeOptions = [
  { id: LITERATURE_TYPE.CASE_STUDY, label: 'Case study' },
  { id: LITERATURE_TYPE.THESIS, label: 'Thesis' },
  { id: LITERATURE_TYPE.REPORT, label: 'Report' },
  { id: LITERATURE_TYPE.TECHNICAL_REPORT, label: 'Technical report' },
  { id: LITERATURE_TYPE.PRODUCER_WEBSITE, label: 'Producer website' },
  { id: LITERATURE_TYPE.WHITE_PAPER, label: 'White paper' },
  { id: LITERATURE_TYPE.CONFERENCE_PROCEEDING, label: 'Conference proceedings' },
  { id: LITERATURE_TYPE.PATENT, label: 'Patent' },
  { id: LITERATURE_TYPE.POPULAR_MEDIA, label: 'Popular media' },
  { id: LITERATURE_TYPE.CONSENSUS_STATEMENT, label: 'Consensus statement' },
  { id: LITERATURE_TYPE.EMPERICAL_PR, label: 'Emperical (Peer Reviewed)' },
  { id: LITERATURE_TYPE.REVIEW_PR, label: 'Review (Peer Reviewed)' },
  {
    id: LITERATURE_TYPE.SYSTEMATIC_REVIEW_PR,
    label: 'Systematic review (Peer Reviewed)',
  },
  {
    id: LITERATURE_TYPE.META_ANALYSIS_PR,
    label: 'Meta analysis (Peer Reviewed)',
  },
];

export const literatureForm = [
  { id: 'id', type: 'text', autogenerate: 'id', className: 'col s4' },
  { id: 'doi', label: 'DOI', required: true, type: 'text', className: 'col s4' },
  {
    id: 'type',
    label: 'Type',
    required: true,
    type: 'select',
    options: literatureTypeOptions,
    className: 'col s4',
  },
  {
    id: 'title',
    label: 'Title',
    required: true,
    type: 'text',
    className: 'col s12',
  },
] as UIForm;
