export type Position = [number, number];

export function dist8(x1: number, y1: number, x2: number, y2: number) {
	let dx = Math.abs(x1 - x2);
	let dy = Math.abs(y1 - y2);
	return Math.max(dx, dy);
}

export function dist4(x1: number, y1: number, x2: number, y2: number) {
	let dx = Math.abs(x1 - x2);
	let dy = Math.abs(y1 - y2);
	return dx+dy;
}

export function distL2(x1: number, y1: number, x2: number, y2: number) {
	let dx = (x1 - x2);
	let dy = (y1 - y2);
	return Math.sqrt(dx**2 + dy**2);
}

export function getPath(x1: number, y1: number, x2: number, y2: number) {
	let dx = x2-x1;
	let dy = y2-y1;

	let steps: number;
	if (Math.abs(dx) >= Math.abs(dy)) {
		steps = Math.abs(dx);
	} else {
		steps = Math.abs(dy);
	}

	let stepx = dx/steps;
	let stepy = dy/steps;

	let x = x1, y = y1;
	let path: Position[] = [];
	for (let i=0; i<steps; i++) {
		x += stepx;
		y += stepy;
		path.push([Math.round(x), Math.round(y)]);
	}

	return path;
}

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

declare global {
	interface Array<T> {
		random(): T;
	}
	interface String {
		capitalize(): string;
	}
}

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.substring(1);
}
