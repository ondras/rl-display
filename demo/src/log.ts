import { Being } from "./beings.ts";
import { Item } from "./items.ts";


const LIMIT = 10;

const parent = document.querySelector("#log")!;
let nodes: HTMLElement[] = [];
let line: HTMLElement;


function articled(being: Being) {
	let article = "";
	if (!being.named) {
		let first = being.name.charAt(0).toLowerCase();
		article = first.match(/[aeiouy]/) ? "an " : "a ";
	}
	return `${article}${being.name}`;
}

export function formatAttack(attacker:Being, target:Being) {
	return `${articled(attacker)} attacks ${articled(target)} with his ${attacker.weapon.name}.`.capitalize();
}

export function formatPickup(being:Being, item:Item) {
	return `${being.name} picks up the ${item.name}.`.capitalize();
}

export function newline() {
	if (line && !line.childElementCount) { return; }

	line = document.createElement("div");
	nodes.push(line);

	while (nodes.length > LIMIT) { nodes.shift()!.remove(); }
	parent.append(line);
}

export function add(text: string) {
	let span = document.createElement("span");
	span.textContent = text;
	line.append(span, " ");
}

export function init() {
	setInterval(() => parent.scrollTop += 3, 20);
	newline();
}
