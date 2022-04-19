import m from 'mithril';
import { render } from 'mithril-ui-form';
import { Dashboards } from '../models';
import { MeiosisComponent } from '../services';
import { subSup } from '../utils';
import { TextInputWithClear } from './ui';

// const createTextFilter = (txt: string) => {
//   if (!txt) return () => true;
//   const checker = new RegExp(txt, 'i');
//   return ({ a = '', b = '' }: DataItem) => checker.test(a) || checker.test(b);
// };

const md = `#### Overzicht van termen`;

const lexicon = [
  { a: 'schulden', b: 'Het moeten betalen aan een ander van (meestal) een bedrag in geld.' },
  { a: 'fastfoodconsumptie', b: 'Het nuttigen van fastfood' },
].sort((a, b) => a.a.localeCompare(b.a)) as Array<{
  a: string;
  b: string;
  ref?: string;
  url?: string;
}>;

let textFilter = '';

export const AllWordsPage: MeiosisComponent = () => ({
  oninit: ({
    attrs: {
      actions: { setPage },
    },
  }) => setPage(Dashboards.TAXONOMY),
  view: () => {
    const regexFilter = textFilter && new RegExp(textFilter.toLowerCase(), 'i');
    const filteredLexicon = regexFilter
      ? lexicon.filter((l) => regexFilter.test(l.a) || regexFilter.test(l.b))
      : lexicon;

    return [
      m('.row', { style: 'height: 100vh' }, [
        m(TextInputWithClear, {
          label: 'Zoek naar een term',
          id: 'filter',
          initialValue: textFilter,
          placeholder: 'Deel van een term...',
          iconName: 'filter_list',
          onchange: (v?: string) => (textFilter = v ? v : ''),
          style: 'margin-bottom: -4rem',
          className: 'col s6 offset-m8 m4',
        }),
        m('.intro.col.s12', m.trust(render(md, false))),
        filteredLexicon &&
          m('table.highlight', { style: 'margin-bottom: 3rem' }, [
            m(
              'thead',
              m('tr', [
                m('th', 'Term'),
                m('th', 'Beschrijving'),
                m('th.hide-on-med-and-down', 'Reference'),
              ])
            ),
            m(
              'tbody',
              filteredLexicon.map((l) =>
                m('tr', [
                  m('td', m.trust(render(subSup(l.a)))),
                  m('td', m.trust(render(subSup(l.b)))),
                  l.ref &&
                    m(
                      'td.hide-on-med-and-down',
                      l.url
                        ? m(
                            'a',
                            {
                              target: '_',
                              alt: l.ref,
                              href: l.url,
                            },
                            l.ref
                          )
                        : l.ref
                    ),
                ])
              )
            ),
          ]),
      ]),
    ];
  },
});
