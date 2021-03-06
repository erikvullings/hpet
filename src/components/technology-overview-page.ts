import m from 'mithril';
import { FlatButton, Icon, Select, uniqueId } from 'mithril-materialized';
import { resolveImg } from '../assets/images';
import { Dashboards, Technology } from '../models';
import { MeiosisComponent, routingSvc } from '../services';
import { mainCapabilityOptions } from '../utils';
import { TextInputWithClear } from './ui';

export const TechnologyOverviewPage: MeiosisComponent = () => {
  let searchFilter = '';
  let mainCapFilter = 0;

  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => setPage(Dashboards.TECHNOLOGIES),
    view: ({
      attrs: {
        state: { model, curUser, bookmarks = [] },
        actions: { setTechnology, saveModel, changePage, bookmark },
      },
    }) => {
      const { technologies } = model;

      const searchRegex = searchFilter ? new RegExp(searchFilter, 'i') : undefined;
      const filteredTechnologies = technologies.filter((t) => {
        if (
          searchRegex &&
          !(searchRegex.test(t.technology || '') || searchRegex.test(t.mechanism || ''))
        ) {
          return false;
        }
        if (mainCapFilter && t.mainCap !== mainCapFilter) {
          return false;
        }
        return true;
      });

      return [
        m('.row.technology-overview-page', { style: 'height: 95vh' }, [
          m(
            '.col.s12',
            m(
              '.row',
              m(
                '.col.s6.m4',
                m(TextInputWithClear, {
                  label: 'Search',
                  iconName: 'search',
                  className: 'bottom-margin0',
                  oninput: (s) => {
                    searchFilter = s || '';
                    m.redraw();
                  },
                })
              ),
              m(
                '.col.s6.m4',
                m(Select, {
                  label: 'Capability',
                  options: [{ id: 0, label: '-' }, ...mainCapabilityOptions],
                  onchange: (c) => (mainCapFilter = +c),
                })
              ),
              curUser &&
                m(
                  '.right-align',
                  m(FlatButton, {
                    label: 'Add technology',
                    iconName: 'add',
                    className: 'small',
                    onclick: () => {
                      const newTech = { id: uniqueId() } as Technology;
                      model.technologies.push(newTech);
                      saveModel(model);
                      changePage(Dashboards.TECHNOLOGY, { id: newTech.id, edit: 'true' });
                    },
                  })
                )
            )
          ),
          filteredTechnologies.map((t) => {
            const isBookmarked = bookmarks.indexOf(t.id) >= 0;
            return m(
              '.col.s12.m6.l4',
              m('.card.medium', [
                m('.card-image', [
                  m(
                    'a',
                    {
                      href: routingSvc.href(Dashboards.TECHNOLOGY, `?id=${t.id}`),
                    },
                    [
                      m('img', { src: resolveImg(t.url), alt: t.technology }),
                      m(
                        'span.card-title.bold.sharpen',
                        { className: isBookmarked ? 'amber-text' : 'black-text' },
                        t.technology
                      ),
                    ]
                  ),
                ]),
                m('.card-content', m('p', t.application)),
                m(
                  '.card-action',
                  m(
                    'a',
                    {
                      href: routingSvc.href(Dashboards.TECHNOLOGY, `?id=${t.id}`),
                      onclick: () => setTechnology(t),
                    },
                    m(Icon, { iconName: 'visibility' })
                  ),
                  m(
                    'a',
                    {
                      href: routingSvc.href(Dashboards.TECHNOLOGIES),
                      onclick: () => bookmark(t.id),
                    },
                    m(Icon, {
                      iconName: isBookmarked ? 'star' : 'star_border',
                    })
                  )
                ),
              ])
            );
          }),
        ]),
      ];
    },
  };
};
