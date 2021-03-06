import m, { FactoryComponent } from 'mithril';
import setup, { MeiosisCell } from 'meiosis-setup/mergerino';
import { routingSvc } from '.';
import { Dashboards, DataModel, defaultModel, ID, Technology } from '../models';

const MODEL_KEY = 'HPET_MODEL';
const CUR_USER_KEY = 'HPET_CUR_USER';
const BOOKMARKS_KEY = 'HPET_BOOKMARK';

export interface State {
  page: Dashboards;
  model: DataModel;
  curUser?: string;
  curTech?: Technology;
  bookmarks: ID[];
}

export interface Actions {
  setPage: (page: Dashboards) => void;
  changePage: (
    page: Dashboards,
    params?: Record<string, string | number | undefined>,
    query?: Record<string, string | number | undefined>
  ) => void;
  saveModel: (ds: DataModel) => void;
  saveCurUser: (ds: string) => void;
  setTechnology: (curTech: Technology) => void;
  bookmark: (id: string) => void;
}

export type MeiosisComponent<T extends { [key: string]: any } = {}> = FactoryComponent<{
  state: State;
  actions: Actions;
  options?: T;
}>;

export const appActions: (cell: MeiosisCell<State>) => Actions = ({ update }) => ({
  // addDucks: (cell, amount) => {
  //   cell.update({ ducks: (value) => value + amount });
  // },
  setPage: (page) => update({ page }),
  changePage: (page, params, query) => {
    routingSvc && routingSvc.switchTo(page, params, query);
    update({ page });
  },
  saveModel: (model) => {
    model.lastUpdate = Date.now();
    model.version = model.version ? model.version++ : 1;
    localStorage.setItem(MODEL_KEY, JSON.stringify(model));
    console.log(JSON.stringify(model, null, 2));
    update({ model: () => model });
  },
  saveCurUser: (curUser: string) => {
    localStorage.setItem(CUR_USER_KEY, curUser);
    update({ curUser });
  },
  setTechnology: (curTech: Technology) => update({ curTech }),
  bookmark: (id: ID) =>
    update({
      bookmarks: (bookmarks = []) => {
        const newBookmarks = (() => {
          if (bookmarks.indexOf(id) >= 0) return bookmarks.filter((b) => b !== id);
          bookmarks.push(id);
          return bookmarks;
        })();
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
        return newBookmarks;
      },
    }),
});

const ds = localStorage.getItem(MODEL_KEY);
const model = ds ? JSON.parse(ds) : defaultModel;
const b = localStorage.getItem(BOOKMARKS_KEY);
const bookmarks = b ? JSON.parse(b) : [];
const curUser = localStorage.getItem(CUR_USER_KEY) || '';

const app = {
  initial: { page: Dashboards.HOME, model, curTech: undefined, bookmarks, curUser } as State,
};
export const cells = setup<State>({ app });

cells.map(() => {
  m.redraw();
});
