import m from 'mithril';
import { render } from 'mithril-ui-form';
import { Dashboards } from '../models';
import { MeiosisComponent } from '../services';

const md = `#### Human Performance Enhancing Technologies

Icon & favicon: Brain by Wes Breazell from NounProject.com`;

export const AboutPage: MeiosisComponent = () => ({
  oninit: ({
    attrs: {
      actions: { setPage },
    },
  }) => setPage(Dashboards.ABOUT),
  view: () => {
    return [m('.row', m.trust(render(md)))];
  },
});
