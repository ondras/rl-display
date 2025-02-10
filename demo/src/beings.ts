import * as map from "./map.ts";
import * as utils from "./utils.ts";
import * as items from "./items.ts";
import display from "./display.ts";


export type Goal = { type:"idle" } | { type:"attack", target:Being } | { type:"pickup", target:items.Item };

export interface Being {
	name: string;
	named: boolean;
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

export const hero: Being = {
	name: "Hector the Barbarian",
	named: true,
	id: "hero", x:0, y:0,
	visual: {
		ch: "@",
		fg: "goldenrod"
	},
	goal: { type:"idle" } as Goal,
	weapon: items.createWeapon("sword")
};

export let enemy: Being;


const ORCS = [
	{name: "orc", visual:{ch:"o", fg:"green"}, weaponType:"sword"} as const,
	{name: "orc shaman", visual:{ch:"o", fg:"lime"}, weaponType:"wand"} as const,
	{name: "ogre", visual:{ch:"O", fg:"green"}, weaponType:"sword"} as const,
	{name: "ogre shaman", visual:{ch:"O", fg:"lime"}, weaponType:"wand"} as const,
	{name: "goblin", visual:{ch:"g", fg:"green"}, weaponType:"sword"} as const,
	{name: "goblin archer", visual:{ch:"g", fg:"blue"}, weaponType:"bow"} as const,
];

export function spawnEnemy() {
	let available = [1, 2, 3];
	let withDistance = available.map(index => {
		let position = map.getSpawn(index);
		let distance = utils.distL2(hero.x, hero.y, ...position);
		return {index, distance}
	});

	withDistance.sort((a, b) => a.distance - b.distance);
	withDistance.shift();

	let index = withDistance.random().index;

	switch (index) {
		case 1: enemy = spawnOrc(); break;
		case 2: enemy = spawnOrc(); break;
		case 3: enemy = spawnOrc(); break;
	}

	enemy.goal = { type:"attack", target:hero }
	spawn(enemy, ...map.getSpawn(index));
}

export function spawn(being: Being, x:number, y:number) {
	being.x = x;
	being.y = y;
	display.draw(being.x, being.y, being.visual, {id:being.id, zIndex:2});
}

function spawnOrc(): Being {
	let base = ORCS.random();
	return {
		id: Math.random(), x: 0, y: 0,
		named: false,
		goal: { type:"idle" } as Goal,
		name: base.name,
		visual: base.visual,
		weapon: items.createWeapon(base.weaponType)
	};
}

export async function die(being: Being) {
	let fx = ["fade-out", "explode"];
	await display.fx(being.id, fx.random())!.finished;
	display.delete(being.id);

	let positions = map.getFreePositionsAround(being.x, being.y);
	if (positions.length > 0 && Math.random() > 0.5) {
		const { weapon } = being;

		let item = {
			x: 0, y: 0,
			visual: weapon.visual,
			name: weapon.name,
			weapon
		}
		items.spawn(item, ...positions.random());
	}

	let r = Math.random();
	if (r > 0.667) {
		let gold = {
			x: 0, y: 0,
			visual: {
				ch: "$",
				fg: "gold"
			},
			named: true,
			name: "some gold"
		}
		items.spawn(gold, being.x, being.y);
	} else if (r > 0.333) {
		let corpse = {
			x: 0, y: 0,
			visual: {
				ch: "%",
				fg: being.visual.fg
			},
			edible: true,
			name: `${being.name} corpse`
		}
		items.spawn(corpse, being.x, being.y);
	}
}
