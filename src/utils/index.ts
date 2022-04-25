import m from 'mithril';
import { padLeft } from 'mithril-materialized';
import { render, UIForm } from 'mithril-ui-form';
import {
  AVAILABILITY,
  DataModel,
  EVIDENCE_DIRECTION,
  EVIDENCE_LEVEL,
  HPE_CLASSIFICATION,
  INVASIVENESS_OBTRUSIVENESS,
  MAIN_CAPABILITY,
  MATURITY,
  STATUS,
  TECHNOLOGY_CATEGORY,
  User,
} from '../models';

const supRegex = /\^([^_ ]+)(_|$|\s)/g;
const subRegex = /\_([^\^ ]+)(\^|$|\s)/g;

/** Expand markdown notation by converting A_1 to subscript and x^2 to superscript. */
export const subSup = (s: string) =>
  s ? s.replace(supRegex, `<sup>$1</sup>`).replace(subRegex, `<sub>$1</sub>`) : s;

export const capitalize = (s?: string) => s && s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Debounce function wrapper, i.e. between consecutive calls of the wrapped function,
 * there will be at least TIMEOUT milliseconds.
 * @param func Function to execute
 * @param timeout Timeout in milliseconds
 * @returns
 */
export const debounce = (func: (...args: any) => void, timeout: number) => {
  let timer: number;
  return (...args: any) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

export const formatDate = (date: number | Date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${padLeft(d.getMonth() + 1)}-${padLeft(d.getDate())}`;
};

/**
 * Get a color that is clearly visible against a background color
 * @param backgroundColor Background color, e.g. #99AABB
 * @returns
 */
export const getTextColorFromBackground = (backgroundColor?: string) => {
  if (!backgroundColor) {
    return 'black-text';
  }
  const c = backgroundColor.substring(1); // strip #
  const rgb = parseInt(c, 16); // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff; // extract red
  const g = (rgb >> 8) & 0xff; // extract green
  const b = (rgb >> 0) & 0xff; // extract blue

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma < 105 ? 'white-text' : 'black-text';
};

export const getOptionsLabel = <T>(options: Array<{ id: T; label: string }>, id?: T) => {
  if (!id) {
    return '';
  }
  const found = options.filter((o) => o.id === id).shift();
  return found ? found.label : '';
};

/** Join a list of items with a comma, and use AND for the last item in the list. */
export const joinListWithAnd = (arr: string[] = [], and = 'and', prefix = '') =>
  arr.length === 0
    ? ''
    : prefix +
      (arr.length === 1
        ? arr[0]
        : `${arr.slice(0, arr.length - 1).join(', ')} ${and} ${arr[arr.length - 1]}`);

export const statusOptions = [
  { id: STATUS.FIRST_DRAFT, label: 'First draft' },
  { id: STATUS.READY_FOR_REVIEW, label: 'Ready for review' },
  { id: STATUS.UNDER_REVIEW, label: 'Under review' },
  { id: STATUS.REVIEWED, label: 'Reviewed' },
  { id: STATUS.FINISHED, label: 'Finished' },
];

export const technologyCategoryOptions = [
  { id: TECHNOLOGY_CATEGORY.HARDWARE, label: 'Hardware' },
  { id: TECHNOLOGY_CATEGORY.BIO_ENHANCEMENT, label: 'Bio-enhancement' },
  {
    id: TECHNOLOGY_CATEGORY.PHARMACOLOGICAL_SUBSTANCES_SUPPLEMENTS_AND_NUTRITION,
    label: 'Pharmacological substances, supplements and nutrition',
  },
  { id: TECHNOLOGY_CATEGORY.TRAINING, label: 'Training' },
  { id: TECHNOLOGY_CATEGORY.SELF_REGULATION, label: 'Self-regulation' },
  { id: TECHNOLOGY_CATEGORY.NUTRITION, label: 'Nutrition' },
  { id: TECHNOLOGY_CATEGORY.OTHER, label: 'Other' },
];

export const hpeClassificationOptions = [
  { id: HPE_CLASSIFICATION.OPTIMIZATION, label: 'Optimization' },
  { id: HPE_CLASSIFICATION.ENHANCEMENT, label: 'Enhancement' },
  { id: HPE_CLASSIFICATION.DEGRADATION, label: 'Degradation' },
];

export const mainCapabilityOptions = [
  { id: MAIN_CAPABILITY.COGNITION, label: 'Cognition' },
  { id: MAIN_CAPABILITY.PHYSICAL, label: 'Physical' },
  { id: MAIN_CAPABILITY.MENTAL, label: 'Mental' },
  { id: MAIN_CAPABILITY.SOCIAL, label: 'Social' },
  { id: MAIN_CAPABILITY.PHYSIOLOGICAL, label: 'Physiological' },
  { id: MAIN_CAPABILITY.PERSONALITY, label: 'Personality' },
];

export const invasivenessOptions = [
  { id: INVASIVENESS_OBTRUSIVENESS.NO, label: 'No' },
  { id: INVASIVENESS_OBTRUSIVENESS.LOW, label: 'Low' },
  { id: INVASIVENESS_OBTRUSIVENESS.MEDIUM, label: 'Medium' },
  { id: INVASIVENESS_OBTRUSIVENESS.HIGH, label: 'High' },
];

export const maturityOptions = [
  { id: MATURITY.LOW, label: 'Low' },
  { id: MATURITY.MEDIUM, label: 'Medium' },
  { id: MATURITY.HIGH, label: 'High' },
];

export const evidenceDirOptions = [
  { id: EVIDENCE_DIRECTION.GENERALLY_IN_FAVOR, label: 'Generally in favor' },
  { id: EVIDENCE_DIRECTION.GENERALLY_AGAINST, label: 'Generally against' },
  { id: EVIDENCE_DIRECTION.UNDECIDED, label: 'Undecided' },
];

export const evidenceLevelOptions = [
  { id: EVIDENCE_LEVEL.A, label: 'Based on consistent and good quality evidence' },
  { id: EVIDENCE_LEVEL.B, label: 'Based on inconsistent or limited-quality evidence' },
  { id: EVIDENCE_LEVEL.C, label: 'Based on consensus, usual practice, opinion.' },
];

export const availabilityOptions = [
  {
    id: AVAILABILITY.YES_WITHIN_THE_NETHERLANDS,
    label: 'Yes, within The Netherlands',
  },
  { id: AVAILABILITY.YES_WITHIN_THE_EU, label: 'Yes, within the EU' },
  { id: AVAILABILITY.YES_OUTSIDE_THE_EU, label: 'Yes, outside the EU' },
  { id: AVAILABILITY.NO, label: 'No' },
  { id: AVAILABILITY.UNKNOWN, label: 'Unknown' },
];

export const technologyForm = (
  users: User[],
  technologyOptions: Array<{ id: string; label: string }>
) => {
  return [
    { id: 'id', type: 'none', autogenerate: 'id' },
    {
      id: 'technology',
      label: 'Technology',
      type: 'text',
      className: 'col s8 m6',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: statusOptions,
      className: 'col s12 m2',
    },
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      multiple: true,
      options: technologyCategoryOptions,
      className: 'col s4',
    },
    {
      id: 'owner',
      label: 'Owner',
      type: 'select',
      options: users.map((u) => ({ id: u.id, label: u.name })),
      className: 'col s4 m3',
    },
    {
      id: 'reviewer',
      label: 'Reviewer',
      type: 'select',
      multiple: true,
      options: users.map((u) => ({ id: u.id, label: u.name })),
      className: 'col s8 m9',
    },
    {
      id: 'application',
      label: 'Specific application',
      type: 'textarea',
      className: 'col s12',
    },
    {
      id: 'mainCap',
      label: 'Main capability',
      type: 'select',
      className: 'col s6 m3',
      options: mainCapabilityOptions,
    },
    {
      id: 'hpeClassification',
      label: 'HPE classification',
      type: 'select',
      className: 'col s6 m3',
      options: hpeClassificationOptions,
    },
    {
      id: 'invasive',
      label: 'Invasive?',
      type: 'select',
      className: 'col s6 m2',
      options: invasivenessOptions,
    },
    {
      id: 'booster',
      label: 'Can be applied as booster?',
      type: 'checkbox',
      className: 'col s6 m4',
    },
    {
      id: 'specificCap',
      label: 'Specific capability',
      type: 'tags',
      className: 'col s12',
    },
    {
      id: 'similar',
      label: 'Similar technologies',
      type: 'select',
      multiple: true,
      options: technologyOptions,
      className: 'col s12',
    },
    {
      id: 'mechanism',
      label: 'Mechanism',
      type: 'textarea',
      className: 'col s12',
    },
    {
      id: 'effectDuration',
      label: 'Effect duration',
      type: 'text',
      className: 'col s12',
    },
    {
      id: 'incubation',
      label: 'Effect incubation',
      type: 'text',
      className: 'col s12',
    },
    {
      id: 'diff',
      label: 'Individual differences',
      type: 'textarea',
      className: 'col s12',
    },
    {
      id: 'practical',
      label: 'Practical execution',
      type: 'textarea',
      className: 'col s12',
    },
    {
      id: 'sideEffects',
      label: 'Side effects',
      type: 'textarea',
      className: 'col s12',
    },
    {
      id: 'ethical',
      label: 'Ethical considerations',
      type: 'textarea',
      className: 'col s12',
    },
    {
      id: 'examples',
      label: 'Examples of the intervention being used in practice',
      type: 'textarea',
      className: 'col s12',
    },
    {
      id: 'maturity',
      label: 'Maturity',
      type: 'select',
      className: 'col s6 m4',
      options: maturityOptions,
    },
    {
      id: 'availability',
      label: 'Availability',
      type: 'select',
      className: 'col s12 m4',
      options: availabilityOptions,
    },
    {
      id: 'evidenceDir',
      label: 'Evidence direction',
      type: 'select',
      className: 'col s12 m4',
      options: evidenceDirOptions,
    },
    {
      id: 'evidenceScore',
      label: 'Evidence score',
      type: 'radio',
      checkboxClass: 'col s4',
      className: 'col s12',
      options: evidenceLevelOptions,
    },
    { id: 'url', label: 'Link to image', type: 'url', className: 'col s12' },
  ] as UIForm;
};

/** Convert markdown text to HTML */
export const markdown2html = (markdown = '') => m.trust(render(markdown, true, true));

/** RegExp for references of type [vullings2022] */
export const refRegex = /\[([a-zA-Z0-9_-]*)\]/gi;

export type ReferenceType = {
  id: string;
  title: string;
  url?: string;
  type: 'LIT' | 'MEA';
};

/** Convert markdown text to HTML after resolving all references. */
export const resolveRefs = (model: DataModel) => {
  const { literature = [], measurements = [] } = model;

  const ids = [
    ...literature.map(
      (lit) => ({ id: lit.id, title: lit.title, url: lit.doi, type: 'LIT' } as ReferenceType)
    ),
    ...measurements.map(
      (mea) => ({ id: mea.id, title: mea.title, url: mea.url, type: 'MEA' } as ReferenceType)
    ),
  ].reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {} as Record<string, ReferenceType>);
  return {
    ids,
    md2html: (markdown = '') => {
      const md = markdown.replace(refRegex, (replaceValue) => {
        const reference = ids[replaceValue.replace(/\[|\]/g, '')];
        // console.log(replaceValue);
        return reference
          ? `<a href="${reference.url}" target="_blank" alt="${reference.title}" title="${reference.title}">${replaceValue}</a>`
          : `<span class="red-text">${replaceValue}</span>`;
      });
      return markdown2html(md);
    },
  };
};
