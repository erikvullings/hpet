import m from "mithril";
import { FlatButton, Select, uniqueId } from "mithril-materialized";
import { Dashboards, Technology } from "../models";
import { MeiosisComponent, routingSvc } from "../services";
import { mainCapabilityOptions } from "../utils";
import { TextInputWithClear } from "./ui";

export const TechnologyOverviewPage: MeiosisComponent = () => {
	let searchFilter = "";
	let mainCapFilter = 0;

	return {
		oninit: ({ attrs: { actions: { setPage } } }) =>
			setPage(Dashboards.TECHNOLOGIES),
		view: (
			{
				attrs: {
					state: { model },
					actions: { setTechnology, saveModel, changePage },
				},
			},
		) => {
			const { technologies } = model;

			const searchRegex = searchFilter ? new RegExp(searchFilter, "i") : undefined;
			const filteredTechnologies = technologies.filter((t) => {
				if (
					searchRegex && !(
						searchRegex.test(t.technology || "") || searchRegex.test(
							t.mechanism || "",
						)
					)
				) {
					return false;
				}
				if (mainCapFilter && t.mainCap !== mainCapFilter) {
					return false;
				}
				return true;
			});

			return [
				m(
					".row.technology-overview-page",
					{ style: "height: 95vh" },
					[
						m(
							".col.s12",
							m(
								".row",
								m(
									".col.s12.m4",
									m(
										TextInputWithClear,
										{
											label: "Search",
											iconName: "filter_list",
											className: "bottom-margin0",
											oninput: (s) => {
												searchFilter = s || "";
												m.redraw();
											},
										},
									),
								),
								m(
									".col.s12.m4",
									m(
										Select,
										{
											label: "Capability",
											options: [{ id: 0, label: "-" }, ...mainCapabilityOptions],
											onchange: (c) => mainCapFilter = +c,
										},
									),
								),
								m(
									FlatButton,
									{
										className: "right",
										label: "Add new technology",
										iconName: "add",
										onclick: () => {
											const newTech = { id: uniqueId() } as Technology;
											model.technologies.push(newTech);
											saveModel(model);
											changePage(
												Dashboards.TECHNOLOGY,
												{ id: newTech.id, edit: "true" },
											);
										},
									},
								),
							),
						),
						filteredTechnologies.map(
							(t) =>
								m(
									".col.s12.m6.l4.xl3",
									m(
										".card.medium",
										[
											m(
												".card-image",
												[
													m(
														"a",
														{
															href: routingSvc.href(
																Dashboards.TECHNOLOGY,
																`?id=${t.id}`,
															),
														},
														m("img", { src: t.url, alt: t.technology }),
													),
													m("span.card-title.black-text", t.technology),
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
														onclick: () => setTechnology(t),
													},
													"Open",
												),
											),
										],
									),
								),
						),
					],
				),
			];
		},
	};
};
