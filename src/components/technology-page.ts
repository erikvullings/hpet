import m, { Vnode } from 'mithril';
import { FlatButton, Icon } from 'mithril-materialized';
import { UIForm, LayoutForm } from 'mithril-ui-form';
import { Dashboards, defaultModel, Technology } from '../models';
import { MeiosisComponent, routingSvc } from '../services';
import {
  availabilityOptions,
  evidenceDirOptions,
  evidenceLevelOptions,
  getOptionsLabel,
  hpeClassificationOptions,
  invasivenessOptions,
  joinListWithAnd,
  mainCapabilityOptions,
  maturityOptions,
  statusOptions,
  technologyCategoryOptions,
  technologyForm,
  resolveRefs,
  refRegex,
  ReferenceType,
} from '../utils';

const extractRefs = (t: Technology) => {
  const allText = [
    t.application,
    t.diff,
    t.effectDuration,
    t.ethical,
    t.examples,
    t.incubation,
    t.mechanism,
    t.practical,
    t.sideEffects,
  ].join(' ');
  let m: RegExpExecArray | null;

  const references: string[] = [];
  while ((m = refRegex.exec(allText)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === refRegex.lastIndex) {
      refRegex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match) => {
      const term = match.toLowerCase();
      if (references.indexOf(term) < 0) references.push(term);
    });
  }
  return references;
};

export const TechnologyPage: MeiosisComponent = () => {
  let id = '';
  let isEditting = false;
  let form: UIForm = [];
  let refIds: Record<string, ReferenceType>;
  let md: (markdown?: string) => Vnode;

  return {
    oninit: ({
      attrs: {
        state: { model, curTech = {} as Technology },
        actions: { setPage, setTechnology },
      },
    }) => {
      setPage(Dashboards.TECHNOLOGY);
      id = m.route.param('id') || curTech.id || '';
      isEditting = (m.route.param('edit') as unknown as boolean) === true ? true : false;
      const technologyOptions = model.technologies
        .filter((t) => t.id !== id)
        .map((t) => ({ id: t.id, label: t.technology }));
      form = technologyForm(model.users, technologyOptions);
      const { md2html, ids } = resolveRefs(model);
      md = md2html;
      refIds = ids;
      if (id === curTech.id) {
        return;
      }
      const found = model.technologies.filter((t) => t.id === id).shift() || model.technologies[0];
      if (found) {
        setTechnology(found);
      }
    },
    view: ({
      attrs: {
        state: { curTech = {} as Technology, model = defaultModel },
        actions: { saveModel, changePage },
      },
    }) => {
      const { users, technologies, measurements = [] } = model;
      const ownerId = curTech.owner;
      const owner = users.filter((u) => u.id === ownerId).shift();
      const reviewers =
        curTech.reviewer && users.filter((u) => curTech.reviewer.indexOf(u.id) >= 0);
      const usedLiterature = extractRefs(curTech)
        .filter((id) => refIds.hasOwnProperty(id))
        .map((id) => refIds[id]);

      const mailtoLink =
        owner && `mailto:${owner.email}?subject=${curTech.technology.replace(/ /g, '%20')}`;
      const similarTech =
        curTech.similar &&
        curTech.similar.length > 0 &&
        technologies.filter((t) => curTech.similar.indexOf(t.id) >= 0);
      const usedMeasurements =
        curTech.measurementIDs &&
        measurements.filter((measurement) => curTech.measurementIDs.indexOf(measurement.id) >= 0);

      return [
        m(
          '.row.technology-page',
          { style: 'height: 95vh' },
          m('.col.s12', [
            m(
              '.row',
              m(FlatButton, {
                className: 'right',
                label: isEditting ? 'Stop editting' : 'Edit',
                iconName: 'edit',
                onclick: () => (isEditting = !isEditting),
              }),
              isEditting &&
                m(FlatButton, {
                  className: 'right',
                  label: 'Delete',
                  iconName: 'delete',
                  onclick: () => {
                    model.technologies = model.technologies.filter((t) => t.id !== curTech.id);
                    saveModel(model);
                    changePage(Dashboards.TECHNOLOGIES);
                  },
                })
            ),
            m(
              '.row',
              isEditting
                ? m(LayoutForm, {
                    form,
                    obj: curTech,
                    onchange: () => {
                      model.technologies = model.technologies.map((t) =>
                        t.id === curTech.id ? curTech : t
                      );
                      saveModel(model);
                    },
                  })
                : [
                    m('.row', [
                      m(
                        '.col.s12.m6',
                        m('.row.bottom-margin0', [
                          m('h4', curTech.technology),
                          curTech.application &&
                            m('p', [m('span.bold', 'Application: '), md(curTech.application)]),
                          curTech.category &&
                            m('p', [
                              m('span.bold', 'Category: '),
                              joinListWithAnd(
                                curTech.category.map((c) =>
                                  getOptionsLabel(technologyCategoryOptions, c)
                                )
                              ) + '.',
                            ]),
                          curTech.hpeClassification &&
                            m('p', [
                              m('span.bold', 'HPE classification: '),
                              getOptionsLabel(hpeClassificationOptions, curTech.hpeClassification) +
                                '.',
                            ]),
                          curTech.mainCap &&
                            m('p', [
                              m('span.bold', 'Main capability: '),
                              getOptionsLabel(mainCapabilityOptions, curTech.mainCap) + '.',
                            ]),
                          curTech.specificCap &&
                            m('p', [
                              m('span.bold', 'Specific capability: '),
                              joinListWithAnd(curTech.specificCap) + '.',
                            ]),
                          curTech.invasive &&
                            m('p', [
                              m('span.bold', 'Invasive: '),
                              getOptionsLabel(invasivenessOptions, curTech.invasive) + '.',
                            ]),
                          curTech.maturity &&
                            m('p', [
                              m('span.bold', 'Maturity: '),
                              getOptionsLabel(maturityOptions, curTech.maturity) + '.',
                            ]),
                          typeof curTech.booster !== 'undefined' &&
                            m('p', [
                              m('span.bold', 'Can be used as booster: '),
                              `${curTech.booster ? 'Yes' : 'No'}.`,
                            ]),
                        ])
                      ),
                      curTech.url &&
                        m(
                          '.col.s6.m6',
                          m('img.responsive-img', { src: curTech.url, alt: curTech.technology })
                        ),
                      m(
                        '.col.s12',
                        m('.row.bottom-margin0', [
                          curTech.mechanism &&
                            m('p', [m('span.bold', 'Mechanism: '), md(curTech.mechanism)]),
                          curTech.sideEffects &&
                            m('p', [m('span.bold', 'Side-effects: '), md(curTech.sideEffects)]),
                          curTech.diff &&
                            m('p', [m('span.bold', 'Individual differences: '), md(curTech.diff)]),
                          curTech.ethical &&
                            m('p', [
                              m('span.bold', 'Ethical considerations: '),
                              md(curTech.ethical),
                            ]),
                          curTech.examples &&
                            m('p', [m('span.bold', 'Examples: '), md(curTech.examples)]),
                          similarTech &&
                            m(
                              'p',
                              m(
                                'span.bold',
                                `Similar technolog${similarTech.length > 1 ? 'ies' : 'y'}: `
                              ),
                              similarTech.map((s, i) =>
                                m(
                                  'a',
                                  {
                                    href: routingSvc.href(Dashboards.TECHNOLOGY, `?id=${s.id}`),
                                  },
                                  s.technology + (i < similarTech.length - 1 ? ', ' : '.')
                                )
                              )
                            ),
                        ])
                      ),
                      m(
                        '.col.s6.m8',
                        m('.row', [
                          curTech.evidenceDir &&
                            m('p', [
                              m('span.bold', 'Evidence direction: '),
                              getOptionsLabel(evidenceDirOptions, curTech.evidenceDir) + '.',
                            ]),
                          curTech.evidenceScore &&
                            m('p', [
                              m('span.bold', 'Evidence score: '),
                              getOptionsLabel(evidenceLevelOptions, curTech.evidenceScore) + '.',
                            ]),
                          curTech.availability &&
                            m('p', [
                              m('span.bold', 'Availability: '),
                              getOptionsLabel(availabilityOptions, curTech.availability) + '.',
                            ]),
                          usedMeasurements &&
                            usedMeasurements.length > 0 &&
                            m('p', [
                              m('span.bold', 'Measurement options: '),
                              m(
                                'ul.browser-default',
                                usedMeasurements.map((measurement) =>
                                  m('li', [
                                    m(
                                      'a',
                                      { href: measurement.url, target: '_blank' },
                                      measurement.title
                                    ),
                                    m('p', md(measurement.desc)),
                                  ])
                                )
                              ),
                            ]),
                        ])
                      ),
                      owner &&
                        m(
                          '.col.s6.m4',
                          m('.card.large', [
                            m('.card-image.waves-effect.waves-block.waves-light', [
                              m(
                                'a',
                                owner &&
                                  owner.url &&
                                  m('img.activator', { src: owner.url, alt: owner.name })
                              ),
                            ]),
                            m(
                              '.card-content',
                              m(
                                'p',
                                m(
                                  'span.card-title.activator',
                                  owner.name,
                                  m('i.material-icons.right', 'more_vert')
                                ),
                                m('ul', [
                                  m('li', [
                                    m(Icon, {
                                      iconName: 'phone',
                                      className: 'tiny',
                                    }),
                                    m('a', { href: `tel:${owner.phone}` }, ' ' + owner.phone),
                                  ]),
                                  m('li', [
                                    m(Icon, {
                                      iconName: 'email',
                                      className: 'tiny',
                                    }),
                                    m('a', { href: mailtoLink }, ' ' + owner.email),
                                  ]),
                                ])
                              )
                            ),
                            m('.card-action', m('a', { href: mailtoLink }, 'Email')),
                            m('.card-reveal', [
                              m(
                                'span.card-title.bold',
                                `Owner: ${owner.name}`,
                                m(Icon, { iconName: 'close', className: 'right' })
                              ),
                              reviewers.length > 0 &&
                                m(
                                  'p',
                                  m(
                                    'span',
                                    `Reviewer${reviewers.length > 1 ? 's' : ''}: `,
                                    joinListWithAnd(reviewers.map((r) => r.name)) + '.'
                                  )
                                ),
                              m('p', [
                                m('span.bold', 'Status: '),
                                getOptionsLabel(statusOptions, curTech.status) + '.',
                              ]),
                            ]),
                          ])
                        ),
                      usedLiterature &&
                        m('.col.s12', [
                          m('h5', 'References'),
                          m(
                            'dl.browser-default',
                            usedLiterature.map((l) => [
                              m(
                                'dt',
                                m(
                                  'a',
                                  { href: l.url, title: l.title, alt: l.title, target: '_blank' },
                                  `[${l.id}]`
                                )
                              ),
                              m('dd', l.title),
                            ])
                          ),
                        ]),
                    ]),
                  ]
            ),
          ])
        ),
      ];
    },
  };
};
