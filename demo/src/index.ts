import * as map from "./map.ts";
import * as ai from "./ai.ts";
import * as utils from "./utils.ts";
import * as log from "./log.ts";


function init() {
	log.init();
	map.init();
	ai.init();
}

async function run() {
	while (1) {
		await ai.act();
		await utils.sleep(300);
	}
}

init();
run();
