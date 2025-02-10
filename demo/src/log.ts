import { Being } from "./beings.ts";
import { Item } from "./items.ts";


const LIMIT = 10;

const parent = document.querySelector("#log")!;
let nodes: HTMLElement[] = [];
let line: HTMLElement;


function format(str: string, ...named: {name:string, named?:boolean}[]) {
	return str.replace(/%(\w+)/g, (match, key) => {
		let subject = named.shift();
		if (!subject) { return "!!!"; }

		let replacement = match;
		switch (key.toLowerCase()) {
			case "a":
				replacement = subject.name;
				if (!subject.named) {
					let article = replacement.charAt(0).match(/[aeiouy]/i) ? "an " : "a ";
					replacement = `${article} ${replacement}`;
				}
			break;

			case "the":
				replacement = subject.name;
				if (!subject.named) { replacement = `the ${replacement}`; }
			break;

			case "s": replacement = subject.name; break;
		}

		if (key.charAt(0) == key.charAt(0).toUpperCase()) { replacement = replacement.capitalize(); }
		return replacement;
	})
}

export function formatAttack(attacker:Being, target:Being) {
	return format("%A attacks %a with his %s.", attacker, target, attacker.weapon);
}

export function formatPickup(being:Being, item:Item) {
	if (item.edible) {
		let taste = ["Tastes good.", "Yummy!", "Tough but nutritious."].random();
		return format(`%A eats %the. ${taste}`, being, item);
	} else {
		return format("%A picks up %the.", being, item);
	}
}

export function formatDefense(being:Being) {
	return format([
		"%The evades the attack.",
		"The attack misses.",
		"%The's armor protects him.",
	].random(), being);
}

export function formatDeath(being:Being) {
	return format([
		"%The is killed!",
		"%The is hit and slain.",
		"%The is killed on the spot."
	].random(), being);
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
