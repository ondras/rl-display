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
let stuff = {};
let position = [5, 5];
display.add(stuff, position, {ch:"@", fg:"red"});


while (true) {
	let key = await readKey();
	switch (key.key) {
		case "ArrowLeft": position[0]--; display.setPosition(stuff, position); break;
		case "ArrowRight": position[0]++; display.setPosition(stuff, position); break;
		case "ArrowUp": position[1]--; display.setPosition(stuff, position); break;
		case "ArrowDown": position[1]++; display.setPosition(stuff, position); break;
	}
}


/*
setInterval(() => {
	let fx = ["pulse", "fadein", "fadeout"]
	display.fx(stuff, fx.random());
}, 2500);
*/


