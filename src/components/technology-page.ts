import m from "mithril";
import { FlatButton } from "mithril-materialized";
import { UIForm, LayoutForm } from "mithril-ui-form";
import {
	AVAILABILITY,
	Dashboards,
	defaultModel,
	EVIDENCE_DIRECTION,
	EVIDENCE_LEVEL,
	HPE_CLASSIFICATION,
	INVASIVENESS_OBTRUSIVENESS,
	MAIN_CAPABILITY,
	MATURITY,
	STATUS,
	Technology,
	TECHNOLOGY_CATEGORY,
	User,
} from "../models";
import { MeiosisComponent } from "../services";

const technologyForm = (
	users: User[],
	technologyOptions: Array<{ id: string, label: string }>,
	literatureOptions: Array<{ id: string, label: string }>,
) => {
	return [
		{ id: "id", type: "none", autogenerate: "id" },
		{
			id: "technology",
			label: "Technology",
			type: "text",
			className: "col s8 m6",
		},
		{
			id: "status",
			label: "Status",
			type: "select",
			options: [
				{ id: STATUS.FIRST_DRAFT, label: "First draft" },
				{ id: STATUS.READY_FOR_REVIEW, label: "Ready for review" },
				{ id: STATUS.UNDER_REVIEW, label: "Under review" },
				{ id: STATUS.REVIEWED, label: "Reviewed" },
				{ id: STATUS.FINISHED, label: "Finished" },
			],
			className: "col s12 m2",
		},
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
		{
			id: "application",
			label: "Specific application",
			type: "textarea",
			className: "col s12",
		},
		{
			id: "hpeClassification",
			label: "HPE classification",
			type: "select",
			className: "col s6 m4",
			options: [
				{ id: HPE_CLASSIFICATION.OPTIMIZATION, label: "Optimization" },
				{ id: HPE_CLASSIFICATION.ENHANCEMENT, label: "Enhancement" },
				{ id: HPE_CLASSIFICATION.DEGRADATION, label: "Degradation" },
			],
		},
		{
			id: "mainCap",
			label: "Main capability",
			type: "select",
			className: "col s6 m4",
			options: [
				{ id: MAIN_CAPABILITY.COGNITION, label: "Cognition" },
				{ id: MAIN_CAPABILITY.PHYSICAL, label: "Physical" },
				{ id: MAIN_CAPABILITY.MENTAL, label: "Mental" },
				{ id: MAIN_CAPABILITY.SOCIAL, label: "Social" },
				{ id: MAIN_CAPABILITY.PHYSIOLOGICAL, label: "Physiological" },
				{ id: MAIN_CAPABILITY.PERSONALITY, label: "Personality" },
			],
		},
		{
			id: "specificCap",
			label: "Specific capability",
			type: "tags",
			className: "col s6 m4",
		},
		{
			id: "similar",
			label: "Similar technologies",
			type: "select",
			multiple: true,
			options: technologyOptions,
			className: "col s6 m4",
		},
		{
			id: "invasive",
			label: "Invasiveness",
			type: "select",
			className: "col s6 m4",
			options: [
				{ id: INVASIVENESS_OBTRUSIVENESS.LOW, label: "Low" },
				{ id: INVASIVENESS_OBTRUSIVENESS.MEDIUM, label: "Medium" },
				{ id: INVASIVENESS_OBTRUSIVENESS.HIGH, label: "High" },
			],
		},
		{
			id: "booster",
			label: "Can be applied as booster?",
			type: "checkbox",
			className: "col s6 m4",
			// options: [
			// 	{ id: YES_NO.YES, label: "Yes" },
			// 	{ id: YES_NO.NO, label: "No" },
			// ],
		},
		{
			id: "mechanism",
			label: "Mechanism",
			type: "textarea",
			className: "col s12",
		},
		{
			id: "effectDuration",
			label: "Effect duration",
			type: "text",
			className: "col s6 m4",
		},
		{
			id: "incubation",
			label: "Effect incubation",
			type: "text",
			className: "col s6 m4",
		},
		{
			id: "maturity",
			label: "Maturity",
			type: "select",
			className: "col s6 m4",
			options: [
				{ id: MATURITY.LOW, label: "Low" },
				{ id: MATURITY.MEDIUM, label: "Medium" },
				{ id: MATURITY.HIGH, label: "High" },
			],
		},
		{
			id: "diff",
			label: "Individual differences",
			type: "textarea",
			className: "col s12 m6",
		},
		{
			id: "practical",
			label: "Practical execution",
			type: "textarea",
			className: "col s12 m6",
		},
		{
			id: "sideEffects",
			label: "Side effects",
			type: "textarea",
			className: "col s12 m6",
		},
		{
			id: "ethical",
			label: "Ethical considerations",
			type: "textarea",
			className: "col s12 m6",
		},
		{
			id: "examples",
			label: "Examples of the intervention being used in practice",
			type: "textarea",
			className: "col s12",
		},
		{
			id: "litID",
			label: "Literature",
			type: "select",
			multiple: true,
			className: "col s12",
			options: literatureOptions,
		},
		{
			id: "evidenceDir",
			label: "Evidence direction",
			type: "select",
			className: "col s12 m4",
			options: [
				{
					id: EVIDENCE_DIRECTION.GENERALLY_IN_FAVOR,
					label: "Generally in favor",
				},
				{ id: EVIDENCE_DIRECTION.GENERALLY_AGAINST, label: "Generally against" },
				{ id: EVIDENCE_DIRECTION.UNDECIDED, label: "Undecided" },
			],
		},
		{
			id: "evidenceScore",
			label: "Evidence score",
			type: "radio",
			checkboxClass: "col s4",
			className: "col s12 m4",
			options: [
				{ id: EVIDENCE_LEVEL.A, label: "A" },
				{ id: EVIDENCE_LEVEL.B, label: "B" },
				{ id: EVIDENCE_LEVEL.C, label: "C" },
			],
		},
		{
			id: "availability",
			label: "Availability",
			type: "select",
			className: "col s12 m4",
			options: [
				{
					id: AVAILABILITY.YES_WITHIN_THE_NETHERLANDS,
					label: "Yes, within the netherlands",
				},
				{ id: AVAILABILITY.YES_WITHIN_THE_EU, label: "Yes, within the EU" },
				{ id: AVAILABILITY.YES_OUTSIDE_THE_EU, label: "Yes, outside the EU" },
				{ id: AVAILABILITY.NO, label: "No" },
				{ id: AVAILABILITY.UNKNOWN, label: "Unknown" },
			],
		},
		{ id: "url", label: "Link to image", type: "url", className: "col s12" },
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
			id = m.route.param("id") || curTech.id || "";
			const technologyOptions = model.technologies.filter((t) => t.id !== id).map(
				(t) => ({ id: t.id, label: t.technology }),
			);
			const literatureOptions = model.literature.map(
				(l) => ({ id: l.id, label: l.title }),
			);
			form = technologyForm(model.users, technologyOptions, literatureOptions);
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
					{ style: "height: 95vh" },
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
