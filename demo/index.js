Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}

async function readKey() {
	let ac = new AbortController();
	let { signal } = ac;

	return new Promise(resolve => {
		function onKeyDown(e) {
			ac.abort();
			resolve(e);
		}
		window.addEventListener("keydown", onKeyDown, {signal});
	});
}

let display = document.querySelector("rl-display");
let position = [5, 5];
let id = display.draw(...position, {ch:"@", fg:"red"});

for (let x=0;x<display.width;x++) {
	for (let y=0;y<display.height;y++) {
		if (x > 0 && x < display.width-1 && y > 0 && y < display.height-1) continue;
		display.draw(x, y, {ch:"#"});
	}
}
display.panTo(...position);

document.querySelector(`[name="3"]`).addEventListener("click", _ => display.scaleTo(3));
document.querySelector(`[name="2"]`).addEventListener("click", _ => display.scaleTo(2));
document.querySelector(`[name="1"]`).addEventListener("click", _ => display.scaleTo(1));
document.querySelector(`[name="p00"]`).addEventListener("click", _ => display.panTo(0, 0));
document.querySelector(`[name="p10"]`).addEventListener("click", _ => display.panTo(1, 0));
document.querySelector(`[name="p01"]`).addEventListener("click", _ => display.panTo(0, 1));
document.querySelector(`[name="p11"]`).addEventListener("click", _ => display.panTo(1, 1));


while (true) {
	let key = await readKey();
	switch (key.key) {
		case "ArrowLeft": position[0]--; display.move(id, ...position); display.panTo(...position); display.fx(id, "pulse"); break;
		case "ArrowRight": position[0]++; display.move(id, ...position); break;
		case "ArrowUp": position[1]--; display.move(id, ...position); break;
		case "ArrowDown": position[1]++; display.move(id, ...position); break;
	}
}



/*
setInterval(() => {
	let fx = ["pulse", "fadein", "fadeout"]
	display.fx(stuff, fx.random());
}, 2500);
*/

