export function dist8(x1: number, y1: number, x2: number, y2: number) {
	let dx =Math.abs(x1 - x2);
	let dy =Math.abs(y1 - y2);
	return Math.max(dx, dy);
}