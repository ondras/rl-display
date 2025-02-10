import display from "./display.ts";
import * as map from "./map.ts";
import * as utils from "./utils.ts";
import * as items from "./items.ts";
import * as beings from "./beings.ts";
import * as log from "./log.ts";


let queue: beings.Being[] = [];

function actMove(being: beings.Being, x:number, y:number) {
	being.x = x;
	being.y = y;
	if (being == beings.hero) { display.panTo(x, y, 100); }
	return display.move(being.id, x, y, 100);
}

function actIdle(being: beings.Being) {
	let avail = map.getFreePositionsAround(being.x, being.y);
	return actMove(being, ...avail.random());
}

async function actAttack(being: beings.Being, target: beings.Being, path?: utils.Position[]) {
	let text = log.formatAttack(being, target);
	log.add(text);

	if (path) { await items.shoot(being.weapon, path); }

	if (target == beings.hero) {
		let text = log.formatDefense(target);
		log.add(text);
		return display.fx(target.id, "pulse");
	} else {
		await beings.die(target);
		let text = log.formatDeath(target);
		log.add(text);
		let index = queue.indexOf(target);
		queue.splice(index);

		beings.spawnEnemy();
		queue.push(beings.enemy);

		being.goal = {type:"idle"};
	}
}

function actPickup(being: beings.Being) {
	let item = items.at(being.x, being.y);
	if (!item) { return; }

	let text = log.formatPickup(being, item);
	log.add(text);

	items.remove(item);
	if (item.weapon) { being.weapon = item.weapon; 	}
	being.goal = {type:"idle"};
}

function isCloseTo(being: beings.Being, target: {x:number, y:number}, maxDist: number) {
	let dist = utils.dist8(being.x, being.y, target.x, target.y);
	return (dist <= maxDist);
}

function isPathFree(path: utils.Position[]) {
	return path.every(position => map.isPositionFree(...position));
}

function actApproach(being: beings.Being, target: {x:number, y:number}) {
	let positions = map.getFreePositionsAround(being.x, being.y);
	let closest: utils.Position[] = [];
	let bestDist = 1/0;

	let center = map.getPosition("center");
	let distToTarget = utils.distL2(being.x, being.y, target.x, target.y);
	let distToCenter = utils.distL2(being.x, being.y, ...center);
	let targetToCenter = utils.distL2(target.x, target.y, ...center);

	// yolo pathfinding
	if (distToTarget > distToCenter && distToTarget > targetToCenter) {
		// if target is far -> retarget to center
		target = {x:center[0], y:center[1]};
	}

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

function actBeing(being: beings.Being) {
	const { goal, weapon } = being;

	switch (goal.type) {
		case "idle": return actIdle(being); break;
		case "attack":
			if (isCloseTo(being, goal.target, weapon.range)) {
				let path: utils.Position[] | undefined;

				if (weapon.range > 1) {
					path = utils.getPath(being.x, being.y, goal.target.x, goal.target.y);
					if (!isPathFree(path)) { return actApproach(being, goal.target); }
				}

				return actAttack(being, goal.target, path);
			} else {
				return actApproach(being, goal.target);
			}
		break;
		case "pickup":
			if (isCloseTo(being, goal.target, 0)) {
				return actPickup(being);
			} else {
				return actApproach(being, goal.target);
			}
		break;
	}
}


export async function act() {
	log.newline();

	let being = queue.shift()!;
	await actBeing(being);
	queue.push(being);

	if (being == beings.hero && being.goal.type == "idle") {
		let allItems = items.all();
		if (allItems.length > 0) {
			being.goal = {type:"pickup", target:allItems[0]};
		} else {
			being.goal = {type:"attack", target:beings.enemy};
		}
	}
}

export function init() {
	beings.spawn(beings.hero, ...map.getPosition("center"));
	queue.push(beings.hero);

	beings.spawnEnemy();
	queue.push(beings.enemy);
}
