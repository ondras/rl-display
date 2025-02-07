import * as utils from "./utils.ts";
import * as items from "./items.ts";
import display from "./display.ts";


export type Goal = { type:"idle" } | { type:"attack", target:Being } | { type:"pickup", target:items.Item };

export interface Being {
	name: string;
	id: string | number;
	x: number;
	y: number;
	weapon: items.Weapon;
	visual: {
		fg: string;
		ch: string;
	};
	goal: Goal;
}

const ORCS = [
	{name: "orc", visual:{ch:"o", fg:"green"}, weaponType:"sword"} as const,
	{name: "orc shaman", visual:{ch:"o", fg:"lime"}, weaponType:"wand"} as const,
	{name: "ogre", visual:{ch:"O", fg:"green"}, weaponType:"sword"} as const,
	{name: "ogre shaman", visual:{ch:"O", fg:"lime"}, weaponType:"wand"} as const,
	{name: "goblin", visual:{ch:"g", fg:"green"}, weaponType:"sword"} as const,
	{name: "goblin archer", visual:{ch:"g", fg:"blue"}, weaponType:"bow"} as const,
];

export function spawnOrc(): Being {
	let base = ORCS.random();
	return {
		id: Math.random(), x: 0, y: 0,
		goal: { type:"idle" } as Goal,
		name: base.name,
		visual: base.visual,
		weapon: items.createWeapon(base.weaponType)
	};
}

export function die(being: Being) {
	display.delete(being.id);
	const { weapon } = being;

	let item = {
		x: 0, y: 0,
		visual: weapon.visual,
		name: weapon.name,
		weapon
	}
	items.spawn(item, being.x, being.y);
}
