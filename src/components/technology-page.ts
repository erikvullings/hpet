import m from 'mithril';
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
  resolveChoice,
} from '../utils';

export const TechnologyPage: MeiosisComponent = () => {
  let id = '';
  let isEditting = false;
  let form: UIForm = [];

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
        state: { curTech = {} as Technology, model = defaultModel, curUser },
        actions: { saveModel, changePage },
      },
    }) => {
      const { users, technologies } = model;
      const ownerId = curTech.owner;
      const owner = users.filter((u) => u.id === ownerId).shift();
      const reviewers =
        curTech.reviewer && users.filter((u) => curTech.reviewer.indexOf(u.id) >= 0);
      const usedLiterature = curTech.literature;

      const { md2html: md } = resolveRefs(curTech.literature);
      const mailtoLink =
        owner && `mailto:${owner.email}?subject=${curTech.technology.replace(/ /g, '%20')}`;
      const similarTech =
        curTech.similar &&
        curTech.similar.length > 0 &&
        technologies.filter((t) => curTech.similar.indexOf(t.id) >= 0);

      return [
        m(
          '.row.technology-page',
          { style: 'height: 95vh' },
          m('.col.s12', [
            curUser &&
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
                          curTech.application && m('h5', md(curTech.application)),
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
                            m('p', [
                              m('span.bold', 'Side-effects: '),
                              md(resolveChoice(curTech.hasSideEffects, curTech.sideEffects)),
                            ]),
                          curTech.diff &&
                            m('p', [
                              m('span.bold', 'Individual differences: '),
                              md(resolveChoice(curTech.hasIndDiff, curTech.diff)),
                            ]),
                          curTech.ethical &&
                            m('p', [
                              m('span.bold', 'Ethical considerations: '),
                              md(resolveChoice(curTech.hasEthical, curTech.ethical)),
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
                          usedLiterature && [
                            m('h5', 'References'),
                            m(
                              'ol.browser-default',
                              usedLiterature.map((l) =>
                                m(
                                  'li',
                                  m(
                                    'a',
                                    {
                                      href: l.doi,
                                      alt: l.title,
                                      target: '_blank',
                                    },
                                    l.title
                                  )
                                )
                              )
                            ),
                          ],
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
                    ]),
                  ]
            ),
          ])
        ),
      ];
    },
  };
};
