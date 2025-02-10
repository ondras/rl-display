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
	center: [0, 0],
	spawn1: [0, 0],
	spawn2: [0, 0],
	spawn3: [0, 0]
}
let freePositions: utils.Position[] = [];

export function getSpawn(index: number): utils.Position {
	return wellKnown[`spawn${index}`];
}

export function getPosition(id: keyof typeof wellKnown): utils.Position {
	return wellKnown[id] as utils.Position;
}

export function getFreePositionsAround(x: number, y: number) {
	return freePositions.filter(position => {
		return utils.dist8(x, y, ...position) == 1;
	})
}

export function isPositionFree(x: number, y: number) {{
	return freePositions.some(fp => fp[0] == x && fp[1] == y);
}}

function initChar(ch: string, x: number, y: number) {
	if (ch == " ") { return; }

	switch (ch) {
		case "@":
			wellKnown.center = [x, y];
			ch = ".";
		break;

		case "1":
		case "2":
		case "3":
			wellKnown[`spawn${ch}`] = [x, y];
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

