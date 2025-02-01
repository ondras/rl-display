export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function drawRectangle(display) {
	for (let x=0;x<display.cols;x++) {
		for (let y=0;y<display.rows;y++) {
			let in_x = x * (display.cols-1-x);
			let in_y = y * (display.rows-1-y);
			let ch = in_x && in_y ? "." : "#";
			display.draw(x, y, {ch});
		}
	}
}
