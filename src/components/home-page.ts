import m from "mithril";
import lz from "lz-string";
import { Button, Icon, ModalPanel } from "mithril-materialized";
import background from "../assets/background.jpg";
import { MeiosisComponent, routingSvc } from "../services";
import { Dashboards, DataModel, defaultModel } from "../models";
import { formatDate } from "../utils";

export const HomePage: MeiosisComponent = () => {
	const readerAvailable =
		window.File && window.FileReader && window.FileList && window.Blob;

	return {
		oninit: ({ attrs: { actions: { setPage, saveModel, changePage } } }) => {
			setPage(Dashboards.HOME);
			const uriModel = m.route.param("model");
			if (!uriModel) {
				return;
			}
			try {
				const decompressed = lz.decompressFromEncodedURIComponent(uriModel);
				if (!decompressed) {
					return;
				}
				const model = JSON.parse(decompressed);
				saveModel(model);
				changePage(Dashboards.OVERVIEW);
			} catch (err) {
				console.error(err);
			}
		},
		view: (
			{ attrs: { state: { model = defaultModel }, actions: { saveModel } } },
		) => [
			m(
				"div",
				{ style: "position: relative;" },
				[
					m(
						".overlay.center",
						{ style: "position: absolute; width: 100%" },
						[m("h3.white-text", "Human Performance Enhancing Technologies")],
					),
					m("img.responsive-img.center", { src: background }),
					m(
						".buttons.center",
						{ style: "margin: 10px auto;" },
						[
							m(
								Button,
								{
									iconName: "clear",
									className: "btn-large",
									label: "Clear",
									modalId: "clearAll",
								},
							),
							typeof model.version === "number" && m(
								Button,
								{
									iconName: "edit",
									className: "btn-large",
									label: "Continue",
									onclick: () => {
										routingSvc.switchTo(Dashboards.OVERVIEW);
									},
								},
							),
							m("a#downloadAnchorElem", { style: "display:none" }),
							m(
								Button,
								{
									iconName: "download",
									className: "btn-large",
									label: "Download",
									onclick: () => {
										const dlAnchorElem = document.getElementById(
											"downloadAnchorElem",
										);
										if (!dlAnchorElem) {
											return;
										}
										const version = typeof model.version === "undefined" ? 1 : model.version++;
										const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
											JSON.stringify({ ...model, version }, null, 2),
										);
										dlAnchorElem.setAttribute("href", dataStr);
										dlAnchorElem.setAttribute(
											"download",
											`${formatDate()}_v${version}_hpte_model.json`,
										);
										dlAnchorElem.click();
									},
								},
							),
							m("input#selectFiles[type=file]", { style: "display:none" }),
							readerAvailable && m(
								Button,
								{
									iconName: "upload",
									className: "btn-large",
									label: "Upload",
									onclick: () => {
										const fileInput = document.getElementById("selectFiles") as HTMLInputElement;
										fileInput.onchange =
											() => {
												if (!fileInput) {
													return;
												}
												const files = fileInput.files;
												if (files && files.length <= 0) {
													return;
												}
												const reader = new FileReader();
												reader.onload =
													(e: ProgressEvent<FileReader>) => {
														const result =
															e &&
															e.target &&
															e.target.result &&
															(
																JSON.parse(e.target.result.toString()) as DataModel
															);
														result && result.version && saveModel(result);
													};
												const data = files && files.item(0);
												data && reader.readAsText(data);
												routingSvc.switchTo(Dashboards.OVERVIEW);
											};
										fileInput.click();
									},
								},
							),
							m(
								Button,
								{
									iconName: "link",
									className: "btn-large",
									label: "Permalink",
									onclick: () => {
										const permLink = document.createElement("input") as HTMLInputElement;
										document.body.appendChild(permLink);
										if (!permLink) {
											return;
										}
										const compressed = lz.compressToEncodedURIComponent(
											JSON.stringify(model),
										);
										const url = `${window.location.href}${
											/\?/.test(window.location.href) ? "&" : "?"
										}model=${compressed}`;
										permLink.value = url;
										permLink.select();
										permLink.setSelectionRange(0, 999999); // For mobile devices
										try {
											const successful = document.execCommand("copy");
											if (successful) {
												M.toast({
													html: "Copied permanent link to clipboard.",
													classes: "yellow black-text",
												});
											}
										} catch (err) {
											M.toast({
												html: "Failed copying link to clipboard: " + err,
												classes: "red",
											});
										} finally {
											document.body.removeChild(permLink);
										}
									},
								},
							),
						],
					),
					m(
						".section.white",
						m(
							".row.container.center",
							[
								m(
									".row",
									[
										m(
											".col.s12.m4",
											m(
												".icon-block",
												[
													m(".center", m(Icon, { iconName: "dashboard" })),
													m("h5.center", "Prepare"),
													m(
														"p.light",
														"Create or select the technologies that are important for your mission.",
													),
												],
											),
										),
										m(
											".col.s12.m4",
											m(
												".icon-block",
												[
													m(".center", m(Icon, { iconName: "flash_on" })),
													m("h5.center", "Assess"),
													m(
														"p.light",
														`Determine for each technologies how important it is, and your current performance, so you can prioritise and focus on the ones you really need.`,
													),
												],
											),
										),
										m(
											".col.s12.m4",
											m(
												".icon-block",
												[
													m(".center", m(Icon, { iconName: "group" })),
													m("h5.center", "Compare"),
													m(
														"p.light",
														"Compare and select technologies so you can choose the one that fits best with your needs.",
													),
												],
											),
										),
									],
								),
							],
						),
					),
					m(
						ModalPanel,
						{
							id: "clearAll",
							title: "Do you really want to delete everything?",
							description: "Are you sure that you want to delete your model?",
							buttons: [
								{
									label: "Yes",
									iconName: "delete",
									onclick: () => {
										saveModel(defaultModel);
										routingSvc.switchTo(Dashboards.OVERVIEW);
									},
								},
								{ label: "No", iconName: "cancel" },
							],
						},
					),
				],
			),
		],
	};
};
