import * as map from "./map.ts";
import * as beings from "./beings.ts";


function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

declare global {
	interface Array<T> {
		random(): T;
	}
}

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}

function init() {
	map.init();
	beings.init();
}

async function run() {
	while (1) {
		await beings.act();
		await sleep(500);
	}
}

init();
run();
