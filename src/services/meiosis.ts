import m, { FactoryComponent } from "mithril";
import setup, { MeiosisCell, Update } from "meiosis-setup/mergerino";
import { routingSvc } from ".";
import { Dashboards, DataModel, defaultModel, Technology } from "../models";

const MODEL_KEY = "HPET_MODEL";

export interface State {
	page: Dashboards,
	model: DataModel,
	curTech?: Technology,
}

export interface Actions {
	update: Update<State>,
	setPage: (page: Dashboards) => void,
	changePage: (
		page: Dashboards,
		params?: Record<string, string | number | undefined>,
		query?: Record<string, string | number | undefined>,
	) => void,
	saveModel: (ds: DataModel) => void,
}

export type MeiosisComponent<T extends { [key: string]: any } = {}> = FactoryComponent<
	{ state: State, actions: Actions, options?: T }
>;

export const appActions: (cell: MeiosisCell<State>) => Actions = ({ update }) => ({
	// addDucks: (cell, amount) => {
	//   cell.update({ ducks: (value) => value + amount });
	// },
	update,
	setPage: (page) => update({ page }),
	changePage: (page, params, query) => {
		routingSvc && routingSvc.switchTo(page, params, query);
		update({ page });
	},
	saveModel: (model) => {
		localStorage.setItem(MODEL_KEY, JSON.stringify(model));
		update({ model: () => model });
	},
});

const ds = localStorage.getItem(MODEL_KEY);
const model = ds ? JSON.parse(ds) : defaultModel;

const app = {
	initial: { page: Dashboards.HOME, model, curTech: undefined } as State,
};
export const cells = setup<State>({ app });

cells.map(() => {
	m.redraw();
});
