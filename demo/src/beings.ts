import display from "./display.ts";
import * as map from "./map.ts";
import * as utils from "./utils.ts";
import * as items from "./items.ts";
import * as bestiary from "./bestiary.ts";


let queue: bestiary.Being[] = [];

let hero: bestiary.Being = {
	name: "Hector the ...",
	id: "hero", x:0, y:0,
	visual: {
		ch: "@",
		fg: "goldenrod"
	},
	goal: { type:"idle" } as bestiary.Goal,
	weapon: items.createWeapon("sword")
}

function spawn(being: bestiary.Being, x:number, y:number) {
	being.x = x;
	being.y = y;
	queue.push(being);
	display.draw(being.x, being.y, being.visual, {id:being.id, zIndex:2});
}

function actMove(being: bestiary.Being, x:number, y:number) {
	being.x = x;
	being.y = y;
	if (being == hero) { display.panTo(x, y, 100); }
	return display.move(being.id, x, y, 100);
}

function actIdle(being: bestiary.Being) {
	let avail = map.getFreePositionsAround(being.x, being.y);
	return actMove(being, ...avail.random());
}

function actAttack(being: bestiary.Being, target: bestiary.Being) {
	if (target == hero) {
		return display.fx(hero.id, "pulse");
	} else {
		bestiary.die(target);
		let index = queue.indexOf(target);
		queue.splice(index);
		being.goal = {type:"idle"};
	}
}

function actPickup(being: bestiary.Being) {
	let item = items.at(being.x, being.y);
	if (!item) { return; }

	items.remove(item);
	if (item.weapon) { being.weapon = item.weapon; 	}
	being.goal = {type:"idle"};
}

function isCloseTo(being: bestiary.Being, target: {x:number, y:number}, maxDist: number) {
	let dist = utils.dist8(being.x, being.y, target.x, target.y);
	return (dist <= maxDist);
}

function actApproach(being: bestiary.Being, target: {x:number, y:number}) {
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

	return actMove(being, ...closest.random());
}

function actBeing(being: bestiary.Being) {
	switch (being.goal.type) {
		case "idle": return actIdle(being); break;
		case "attack":
			if (isCloseTo(being, being.goal.target, 1)) {
				return actAttack(being, being.goal.target);
			} else {
				return actApproach(being, being.goal.target);
			}
		break;
		case "pickup":
			if (isCloseTo(being, being.goal.target, 0)) {
				return actPickup(being);
			} else {
				return actApproach(being, being.goal.target);
			}
		break;
	}
}

function spawnEnemy() {
	let index = Math.floor(Math.random()*3) + 1;
	let enemy!: bestiary.Being;

	switch (index) {
		case 1: enemy = bestiary.spawnOrc(); break;
		case 2: enemy = bestiary.spawnOrc(); break;
		case 3: enemy = bestiary.spawnOrc(); break;
	}

	hero.goal = { type:"attack", target:enemy };
	enemy.goal = { type:"attack", target:hero }

	let [x, y] = map.getSpawn(index);
	spawn(enemy, x, y);
}

export async function act() {
	let being = queue.shift()!;
	await actBeing(being);
	queue.push(being);

	if (being == hero && being.goal.type == "idle") {
		let allItems = items.all();
		if (allItems.length > 0) {
			being.goal = {type:"pickup", target:allItems[0]};
		} else {
			spawnEnemy();
		}

	}
}

export function init() {
	let [x, y] = map.getPosition("hero");
	spawn(hero, x, y);
}
