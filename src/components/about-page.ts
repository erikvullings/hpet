import m from 'mithril';
import { render } from 'mithril-ui-form';
import { Dashboards } from '../models';
import { MeiosisComponent } from '../services';

const md = `#### Human Performance Enhancing Technologies

##### Disclaimer

The experts of TNO are paying attention to make the information as complete and accurate as possible, but are not responsible for medical correctness, completeness and actuality of the information presented on this platform. The information presented on this platform is explicitly intended for informative purposes. The content can therefore not replace professional medical advice in cases of complaints or prevention of complaints. The use and/or implementation of information presented on this platform is your own responsibility. TNO cannot be held accountable for any damage or consequences caused by the presented content on this platform. `;

export const AboutPage: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setPage },
      },
    }) => setPage(Dashboards.ABOUT),
    view: () => {
      return [m('.row', m.trust(render(md)))];
    },
  };
};
