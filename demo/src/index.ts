import * as map from "./map.ts";


Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}

let display = document.querySelector("rl-display");

map.init(display);
