import display from "./display.ts";
import * as map from "./map.ts";
import * as utils from "./utils.ts";


type Goal = { type:"idle" } | { type:"attack", target:Being };

interface Being {
	name: string;
	id: string;
	x: number;
	y: number;
	visual: {
		fg: string;
		ch: string;
	};
	goal: Goal;
}

let queue: Being[] = [];


function spawn(being: Being) {
	queue.push(being);
	display.draw(being.x, being.y, being.visual, {id:being.id, zIndex:1});
}

export function init() {
	let [x, y] = map.getPosition("hero");

	let hero = {
		name: "Hector the ...",
		id: "hero", x, y,
		visual: {
			ch: "@",
			fg: "red"
		},
		goal: { type:"idle" } as Goal
	}
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
}

function isCloseTo(being: Being, target: Being) {
	let dist = utils.dist8(being.x, being.y, target.x, target.y);
	return (dist <= 1);
}

function actMove(being: Being, target: Being) {
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

export async function act() {
	let being = queue.shift();
	if (!being) { return; }
	console.log(being.name);

	await actBeing(being);

	queue.push(being);
}
