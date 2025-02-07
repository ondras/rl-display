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

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

declare global {
	interface Array<T> {
		random(): T;
	}
}

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}
