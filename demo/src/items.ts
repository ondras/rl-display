import * as utils from "./utils.ts";
import display from "./display.ts";


export type Weapon = {
	type: "sword" | "bow" | "wand";
	name: string;
	visual: {
		fg: string;
		ch: string;
	}
};

export interface Item {
	x: number;
	y: number;
	name: string;
	weapon?: Weapon;
	edible?: boolean;
	visual: {
		fg: string;
		ch: string;
	}
}

const ELEMENTS = [
	{name:"fire", color:"red"},
	{name:"frost", color:"dodgerblue"},
	{name:"poison", color:"lime"}
];

const PREFIXES = ["Sharp", "Rusty", "Dangerous-looking"];
const SUFFIXES = ["of Vengeance", "of Destiny", "of Chaos"];
const SWORDS = ["sword", "dagger", "saber"];

const MATERIALS = ["Wooden", "Oaken", "Hickory"];
const BOWS = ["short bow", "bow", "longbow"];


let items: Item[] = [];

export function all() { return items; }

export function at(x: number, y:number) {
	for (let item of items) {
		if (item.x == x && item.y == y) { return item; }
	}
}

export function spawn(item: Item, x: number, y: number) {
	item.x = x;
	item.y = y;
	items.push(item);
	display.draw(x, y, item.visual, {zIndex:1});
}

export function remove(item: Item) {
	let index = items.indexOf(item);
	items.splice(index, 1);
	display.deleteAt(item.x, item.y, 1);
}

export function createWeapon(type: Weapon["type"]): Weapon {
	switch (type) {
		case "sword": {
			let parts: string[] = [];
			let PREF_SUF_CHANCE = 0.5;
			if (Math.random() < PREF_SUF_CHANCE) { parts.push(PREFIXES.random()); }
			parts.push(SWORDS.random());
			if (Math.random() > PREF_SUF_CHANCE) { parts.push(SUFFIXES.random()); }

			let fg = ["#999", "#aaa", "#ccc"].random();

			return {
				type,
				name: parts.join(" "),
				visual: {
					ch: ["(", ")"].random(),
					fg
				}
			}
		}

		case "bow": {
			let name = [MATERIALS.random(), BOWS.random()].join(" ");
			return {
				type,
				name,
				visual: {
					ch: ["{", "}"].random(),
					fg: "saddlebrown"
				}
			}
		}

		case "wand": {
			let element = ELEMENTS.random();
			return {
				type,
				name: `Wand of ${element.name}`,
				visual: {
					ch: "I",
					fg: element.color
				}
			}
		}
	}
}
