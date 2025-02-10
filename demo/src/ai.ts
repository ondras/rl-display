import display from "./display.ts";
import * as map from "./map.ts";
import * as utils from "./utils.ts";
import * as items from "./items.ts";
import * as beings from "./beings.ts";
import * as log from "./log.ts";

// FIXME enemy se muze narodit na miste hero


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

async function actAttack(being: beings.Being, target: beings.Being) {
	let text = log.formatAttack(being, target);
	log.add(text);

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
			let enemy = beings.spawnEnemy();
			queue.push(enemy);
		}
	}
}

export function init() {
	beings.spawn(beings.hero, ...map.getPosition("center"));
	queue.push(beings.hero);
}
