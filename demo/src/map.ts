import display from "./display.ts";
import * as utils from "./utils.ts";


function createVisual(ch: string) {
	let visual: any = {ch};
	switch (ch) {
		case "/": visual.fg = "saddlebrown"; break;
		case ".": visual.fg = "#aaa"; break;
		case "#": visual.fg = "#666"; break;
	}
	return visual;
}

let wellKnown = {
	hero: [0, 0],
	spawn1: [],
	spawn2: [],
	spawn3: []
}
let freePositions: utils.Position[] = [];

export function getSpawn(index: number): utils.Position {
	let key = `spawn${index}`;
	return wellKnown[key].random();
}

export function getPosition(id: keyof typeof wellKnown): utils.Position {
	return wellKnown[id] as utils.Position;
}

export function getFreePositionsAround(x: number, y: number) {
	return freePositions.filter(position => {
		return utils.dist8(x, y, ...position) == 1;
	})
}

function initChar(ch: string, x: number, y: number) {
	if (ch == " ") { return; }

	switch (ch) {
		case "@":
			wellKnown.hero = [x, y];
			ch = ".";
		break;

		case "1":
		case "2":
		case "3":
			let key = `spawn${ch}`;
			wellKnown[key].push([x, y]);
			ch = ".";
		break;
	}

	if (ch == "." || ch == "/") { freePositions.push([x, y]); }

	let visual = createVisual(ch);
	display.draw(x, y, visual);
}

export function init() {
	let node = document.querySelector("[type=map]")!;
	let rows = node.textContent!.trim().split("\n");
	let cols = 0;
	rows.forEach((row, j) => {
		cols = Math.max(cols, row.length)
		row.split("").forEach((ch, i) => initChar(ch, i+1, j+1));
	});

	display.rows = rows.length + 2;
	display.cols = cols + 2;
}

