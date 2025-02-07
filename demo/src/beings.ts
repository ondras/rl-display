import display from "./display.ts";
import * as map from "./map.ts";
import * as utils from "./utils.ts";


type Goal = { type:"idle" } | { type:"attack", target:Being };

interface Being {
	name: string;
	id: string | number;
	x: number;
	y: number;
	visual: {
		fg: string;
		ch: string;
	};
	goal: Goal;
}

let queue: Being[] = [];

let hero: Being = {
	name: "Hector the ...",
	id: "hero", x:0, y:0,
	visual: {
		ch: "@",
		fg: "red"
	},
	goal: { type:"idle" } as Goal
}

function spawn(being: Being) {
	queue.push(being);
	display.draw(being.x, being.y, being.visual, {id:being.id, zIndex:1});
}

export function init() {
	let [x, y] = map.getPosition("hero");
	hero.x = x;
	hero.y = y;
	spawn(hero);
}

function actIdle(being: Being) {
	let avail = map.getFreePositionsAround(being.x, being.y);
	let [x, y] = avail.random();
	being.x = x;
	being.y = y;
	return display.move(being.id, x, y);
}

function actAttack(being: Being, target: Being) {
	console.log("attack");
	if (target != hero) {
		display.delete(target.id);
		let index = queue.indexOf(target);
		queue.splice(index);
	}
}

function isCloseTo(being: Being, target: Being) {
	let dist = utils.dist8(being.x, being.y, target.x, target.y);
	return (dist <= 1);
}

function actMove(being: Being, target: Being) {
	let positions = map.getFreePositionsAround(being.x, being.y);
	let closest: utils.Position[] = [];
	let bestDist = 1/0;

	positions.forEach(pos => {
		let dist = utils.distL2(...pos, target.x, target.y);
		if (dist < bestDist) {
			bestDist = dist;
			closest = [];
		}
		if (dist == bestDist) { closest.push(pos); }
	});

	let [x, y] = closest.random();
	being.x = x;
	being.y = y;
	if (being == hero) { display.panTo(x, y, 100); }
	return display.move(being.id, x, y, 100);
}

function actBeing(being: Being) {
	switch (being.goal.type) {
		case "idle": return actIdle(being); break;
		case "attack":
			if (isCloseTo(being, being.goal.target)) {
				return actAttack(being, being.goal.target);
			} else {
				return actMove(being, being.goal.target);
			}
		break;
	}
}

function spawnEnemy() {
	let index = Math.floor(Math.random()*3) + 1;
	let [x, y] = map.getSpawn(index);
	let enemy = {
		name: "orc",
		id: Math.random(),
		visual: {
			ch: "o",
			fg: "lime"
		},
		x, y,
		goal: { type:"attack", target:hero } as Goal
	};
	spawn(enemy);

	hero.goal = { type:"attack", target:enemy };
}

export async function act() {
	let being = queue.shift()!;
	await actBeing(being);

	if (!queue.length) {
		spawnEnemy();
	}
	queue.push(being);
}
