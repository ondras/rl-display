import * as map from "./map.ts";
import * as beings from "./beings.ts";
import * as utils from "./utils.ts";


function init() {
	map.init();
	beings.init();
}

async function run() {
	while (1) {
		await beings.act();
		await utils.sleep(300);
	}
}

init();
run();
