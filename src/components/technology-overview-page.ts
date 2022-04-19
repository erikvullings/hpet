import m from "mithril";
import { Dashboards } from "../models";
import { MeiosisComponent, routingSvc } from "../services";

export const TechnologyOverviewPage: MeiosisComponent = () => {
	return {
		oninit: ({ attrs: { actions: { setPage } } }) =>
			setPage(Dashboards.TECHNOLOGIES),
		view: ({ attrs: { state: { model }, actions: { update } } }) => {
			const { technologies } = model;

			const filteredTechnologies = technologies;

			return [
				m(
					".row.technology-overview-page",
					filteredTechnologies.map(
						(t) =>
							m(
								".col.s12.m6.l4.xl3",
								m(
									".card",
									[
										m(
											".card-image",
											[
												m("img", { src: t.url, alt: t.technology }),
												m("span.card-title", t.technology),
											],
										),
										m(".card-content", m("p", t.application)),
										m(
											".card-action",
											m(
												"a",
												{
													href: routingSvc.href(
														Dashboards.TECHNOLOGY,
														`?id=${t.id}`,
													),
													onclick: () => update({ curTech: t }),
												},
												"Open",
											),
										),
									],
								),
							),
					),
				),
			];
		},
	};
};
