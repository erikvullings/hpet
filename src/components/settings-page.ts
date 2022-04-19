import m from "mithril";
import { Collapsible, FlatButton, Tabs } from "mithril-materialized";
import { LayoutForm, UIForm } from "mithril-ui-form";
import {
	Dashboards,
	defaultModel,
	Literature,
	LITERATURE_TYPE,
	TECHNOLOGY_CATEGORY,
	User,
} from "../models";
import { MeiosisComponent } from "../services";

const literatureForm = [
	{ id: "id", type: "none", autogenerate: "id" },
	{ id: "doi", label: "DOI", required: true, type: "text", className: "col s3" },
	{
		id: "title",
		label: "Title",
		required: true,
		type: "text",
		className: "col s5",
	},
	{
		id: "type",
		label: "Type",
		required: true,
		type: "select",
		options: [
			{ id: LITERATURE_TYPE.CASE_STUDY, label: "Case study" },
			{ id: LITERATURE_TYPE.THESIS, label: "Thesis" },
			{ id: LITERATURE_TYPE.REPORT, label: "Report" },
			{ id: LITERATURE_TYPE.TECHNICAL_REPORT, label: "Technical report" },
			{ id: LITERATURE_TYPE.PRODUCER_WEBSITE, label: "Producer website" },
			{ id: LITERATURE_TYPE.WHITE_PAPER, label: "White paper" },
			{
				id: LITERATURE_TYPE.CONFERENCE_PROCEEDING,
				label: "Conference proceedings",
			},
			{ id: LITERATURE_TYPE.PATENT, label: "Patent" },
			{ id: LITERATURE_TYPE.POPULAR_MEDIA, label: "Popular media" },
			{ id: LITERATURE_TYPE.CONSENSUS_STATEMENT, label: "Consensus statement" },
			{ id: LITERATURE_TYPE.EMPERICAL_PR, label: "Emperical (Peer Reviewed)" },
			{ id: LITERATURE_TYPE.REVIEW_PR, label: "Review (Peer Reviewed)" },
			{
				id: LITERATURE_TYPE.SYSTEMATIC_REVIEW_PR,
				label: "Systematic review (Peer Reviewed)",
			},
			{
				id: LITERATURE_TYPE.META_ANALYSIS_PR,
				label: "Meta analysis (Peer Reviewed)",
			},
		],
		className: "col s4",
	},
] as UIForm;

// const literatureForm = [
// 	{
// 		id: "literature",
// 		label: "Add literature",
// 		repeat: true,
// 		pageSize: 200,
// 		type: literatureItemForm,
// 	},
// ] as UIForm;

const userForm = [
	{ id: "id", type: "none", autogenerate: "id" },
	{
		id: "name",
		label: "Name",
		icon: "title",
		type: "text",
		className: "col s4",
	},
	{
		id: "email",
		label: "Email",
		icon: "email",
		type: "email",
		className: "col s4",
	},
	{
		id: "phone",
		label: "Phone",
		icon: "phone",
		type: "text",
		className: "col s4",
	},
] as UIForm;
// const usersForm = [
// 	{
// 		id: "users",
// 		label: "Add user",
// 		repeat: true,
// 		filterLabel: "name",
// 		pageSize: 100,
// 		type: userForm,
// 	},
// ] as UIForm;

const technologyForm = (users: User[]) => {
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
	];
};

const technologiesForm = (users: User[], _literature: Literature[]) =>
	[
		{
			id: "technologies",
			label: "Add technology",
			repeat: true,
			pageSize: 100,
			filterLabel: "technology",
			type: technologyForm(users),
		},
	] as UIForm;

export const SettingsPage: MeiosisComponent = () => {
	let newLiterature = {} as Literature;
	let addLiterature = false;
	let canSaveLiterature = false;

	let newUser = {} as User;
	let addUser = false;
	let canSaveUser = false;

	return {
		oninit: ({ attrs: { actions: { setPage } } }) =>
			setPage(Dashboards.SETTINGS),
		view: (
			{ attrs: { state: { model = defaultModel }, actions: { saveModel } } },
		) => {
			const { literature, users } = model;
			return [
				m(
					".row.settings",
					[
						m(
							Tabs,
							{
								tabWidth: "auto",
								tabs: [
									{
										title: "Technologies",
										vnode: m(
											LayoutForm,
											{
												form: technologiesForm(model.users, model.literature),
												obj: model,
												onchange: () => saveModel(model),
											},
										),
									},
									{
										title: "Literature",
										vnode: m(
											".row.literature",
											[
												m("h4", "Selected literature"),
												m(
													Collapsible,
													{
														items: literature.map(
															(lit) => ({
																key: lit.id,
																header: lit.title || "Empty",
																body: m(
																	".row",
																	[
																		m(
																			LayoutForm,
																			{
																				form: literatureForm,
																				obj: lit,
																				onchange: () => saveModel(model),
																			},
																		),
																		m(
																			FlatButton,
																			{
																				label: "Delete",
																				iconName: "delete",
																				className: "right",
																				onclick: () => {
																					model.literature =
																						literature.filter(
																							(l) => l.id !== lit.id,
																						);
																					saveModel(model);
																				},
																			},
																		),
																		m(
																			"a.waves-effect.waves-teal.btn-flat.right",
																			{ href: lit.doi, target: "_blank" },
																			m("i.material-icons left", "link"),
																			"Open link",
																		),
																	],
																),
															}),
														),
													},
												),
												addLiterature && m(
													LayoutForm,
													{
														form: literatureForm,
														obj: newLiterature,
														onchange: (isValid) => {
															canSaveLiterature = isValid;
														},
													},
												),
												m(
													FlatButton,
													{
														label: addLiterature ? "Save" : "Add literature",
														disabled: addLiterature ? !canSaveLiterature : false,
														iconName: addLiterature ? "save" : "add",
														className: "right",
														onclick: () => {
															if (addLiterature && canSaveLiterature) {
																model.literature.push(newLiterature);
																saveModel(model);
																newLiterature = {} as Literature;
																canSaveLiterature = false;
															}
															addLiterature = !addLiterature;
														},
													},
												),
												addLiterature && m(
													FlatButton,
													{
														label: "Cancel",
														iconName: "cancel",
														className: "right",
														onclick: () => {
															newLiterature = {} as Literature;
															canSaveLiterature = false;
															addLiterature = false;
														},
													},
												),
											],
										),
									},
									{
										title: "Users",
										vnode: m(
											".row.User",
											[
												m("h4", "Selected User"),
												m(
													Collapsible,
													{
														items: users.map(
															(user) => ({
																key: user.id,
																header: user.name || "Empty",
																body: m(
																	".row",
																	[
																		m(
																			LayoutForm,
																			{
																				form: userForm,
																				obj: user,
																				onchange: () => saveModel(model),
																			},
																		),
																		m(
																			FlatButton,
																			{
																				label: "Delete",
																				iconName: "delete",
																				className: "right",
																				onclick: () => {
																					model.users =
																						users.filter(
																							(u) => u.id !== user.id,
																						);
																					saveModel(model);
																				},
																			},
																		),
																		m(
																			"a.waves-effect.waves-teal.btn-flat.right",
																			{ href: `mailto:${user.email}` },
																			m("i.material-icons left", "email"),
																			"Open email",
																		),
																	],
																),
															}),
														),
													},
												),
												addUser && m(
													LayoutForm,
													{
														form: userForm,
														obj: newUser,
														onchange: (isValid) => {
															canSaveUser = isValid;
														},
													},
												),
												m(
													FlatButton,
													{
														label: addUser ? "Save" : "Add User",
														disabled: addUser ? !canSaveUser : false,
														iconName: addUser ? "save" : "add",
														className: "right",
														onclick: () => {
															if (addUser && canSaveUser) {
																model.users.push(newUser);
																saveModel(model);
																newUser = {} as User;
																canSaveUser = false;
															}
															addUser = !addUser;
														},
													},
												),
												addLiterature && m(
													FlatButton,
													{
														label: "Cancel",
														iconName: "cancel",
														className: "right",
														onclick: () => {
															newLiterature = {} as Literature;
															canSaveLiterature = false;
															addLiterature = false;
														},
													},
												),
											],
										),
									},
								],
							},
						),
					],
				),
			];
		},
	};
};