import m from "mithril";
import { FlatButton } from "mithril-materialized";
import { UIForm, LayoutForm } from "mithril-ui-form";
import {
	Dashboards,
	defaultModel,
	Literature,
	Technology,
	TECHNOLOGY_CATEGORY,
	User,
} from "../models";
import { MeiosisComponent } from "../services";

const technologyForm = (users: User[], _literature: Literature[]) => {
	return [
		{ id: "id", type: "none", autogenerate: "id" },
		{ id: "technology", label: "Technology", type: "text", className: "col s8" },
		{
			id: "category",
			label: "Category",
			type: "select",
			multiple: true,
			options: [
				{ id: TECHNOLOGY_CATEGORY.HARDWARE, label: "Hardware" },
				{ id: TECHNOLOGY_CATEGORY.BIO_ENHANCEMENT, label: "Bio-enhancement" },
				{
					id: TECHNOLOGY_CATEGORY.PHARMACOLOGICAL_SUBSTANCES_SUPPLEMENTS_AND_NUTRITION,
					label: "Pharmacological substances, supplements and nutrition",
				},
				{ id: TECHNOLOGY_CATEGORY.TRAINING, label: "Training" },
				{ id: TECHNOLOGY_CATEGORY.SELF_REGULATION, label: "Self-regulation" },
				{ id: TECHNOLOGY_CATEGORY.NUTRITION, label: "Nutrition" },
				{ id: TECHNOLOGY_CATEGORY.OTHER, label: "Other" },
			],
			className: "col s4",
		},
		{
			id: "owner",
			label: "Owner",
			type: "select",
			options: users.map((u) => ({ id: u.id, label: u.name })),
			className: "col s4 m3",
		},
		{
			id: "reviewer",
			label: "Reviewer",
			type: "select",
			multiple: true,
			options: users.map((u) => ({ id: u.id, label: u.name })),
			className: "col s8 m9",
		},
	] as UIForm;
};

export const TechnologyPage: MeiosisComponent = () => {
	let id = "";
	let isEditting = false;
	let form: UIForm = [];

	return {
		oninit: (
			{
				attrs: {
					state: { model, curTech = {} as Technology },
					actions: { setPage, update },
				},
			},
		) => {
			setPage(Dashboards.TECHNOLOGY);
			form = technologyForm(model.users, model.literature);
			id = m.route.param("id") || curTech.id || "";
			if (id === curTech.id) {
				return;
			}
			const found = model.technologies.filter((t) => t.id === id).shift();
			if (found) {
				update({ curTech: found });
			}
		},
		view: (
			{
				attrs: {
					state: { curTech = {} as Technology, model = defaultModel },
					actions: { saveModel },
				},
			},
		) => {
			return [
				m(
					".row.technology-page",
					m(
						".col.s12",
						[
							m(
								".row",
								m(
									FlatButton,
									{
										className: "right",
										label: "Edit",
										iconName: "edit",
										onclick: () => isEditting = !isEditting,
									},
								),
							),
							m(
								".row",
								isEditting ? m(
									LayoutForm,
									{
										form,
										obj: curTech,
										onchange: () => {
											model.technologies =
												model.technologies.map(
													(t) => t.id === curTech.id ? curTech : t,
												);
											saveModel(model);
										},
									},
								) : m("h4", curTech.technology),
							),
						],
					),
				),
			];
		},
	};
};
