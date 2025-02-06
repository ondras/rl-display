import type RlDisplay from "../../src/rl-display.ts";



function createVisual(ch: string) {
	let visual: any = {ch};
	switch (ch) {
		case ".": visual.fg = "#aaa"; break;
		case "#": visual.fg = "#666"; break;
	}
	return visual;
}

export function init(display: RlDisplay) {
	let node = document.querySelector("[type=map]")!;
	let rows = node.textContent!.trim().split("\n");
	let cols = 0;
	rows.forEach((row, j) => {
		cols = Math.max(cols, row.length)
		row.split("").forEach((ch, i) => {
			if (ch == " ") { return; }
			let visual = createVisual(ch);
			display.draw(i+1, j+1, visual);
		});
	});

	display.rows = rows.length + 2;
	display.cols = cols + 2;
}