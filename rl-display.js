const EFFECTS = {
	"pulse": {
		keyframes: {
			scale: [1, 1.6, 1],
			offset: [0, 0.1, 1]
		},
		options: 500
	},
	"fadein": {
		keyframes: { opacity: [0, 1]},
		options: 300
	},

	"fadeout": {
		keyframes: { opacity: [1, 0]},
		options: 300
	},

	"glow": {
		keyframes: {
			textShadow: ["0 0 0 red", "0 0 5px red", "0 0 0 red"]
		},
		options: 500
	}
}

function positionKey(x, y) { return `${x},${y}`; }

class NodeStorage {
	#idToData = new Map();
	#idToKey = new Map();
	#keyToIds = new Map();

	getById(id) { return this.#idToData.get(id); }
	getIdsByPosition(x, y) { return this.#keyToIds.get(positionKey(x, y)); }
	getIdByPosition(x, y, zIndex) {
		let ids = this.getIdsByPosition(x, y) || new Set();
		return [...ids].find(id => this.getById(id).zIndex == zIndex);
	}

	add(id, data) {
		this.#idToData.set(id, data);
		let key = positionKey(data.x, data.y);
		this.#idToKey.set(id, key);
		this.#addIdToSet(id, key);
	}

	update(id, data) {
		// update data storage
		let currentData = this.getById(id);
		Object.assign(currentData, data);

		let currentKey = this.#idToKey.get(id);
		let newKey = positionKey(currentData.x, currentData.y);
		if (currentKey != newKey) { // position changed
			this.#keyToIds.get(currentKey).delete(id);
			this.#addIdToSet(id, newKey);
			this.#idToKey.set(id, newKey);
		}
	}

	#addIdToSet(id, key) {
		if (this.#keyToIds.has(key)) {
			this.#keyToIds.get(key).add(id);
		} else {
			this.#keyToIds.set(key, new Set([id]));
		}
	}

	delete(id) {
		this.#idToData.delete(id);
		let key = this.#idToKey.get(id);
		this.#keyToIds.get(key).delete(id);
		this.#idToKey.delete(id);
	}
}


export default class RlDisplay extends HTMLElement {
	#storage = new NodeStorage();
	#canvas = document.createElement("div");
	#canvasSize = [20, 10];

	static computeTileSize(tileCount, area, aspectRatioRange) {
		let w = Math.floor(area[0]/tileCount[0]);
		let h = Math.floor(area[1]/tileCount[1]);
		let ar = w/h;
		if (ar < aspectRatioRange[0]) { // too narrow => reduce height
			h = Math.floor(w/aspectRatioRange[0]);
		} else if (ar > aspectRatioRange[1]) { // too wide => reduce width
			w = Math.floor(h*aspectRatioRange[1]);
		}
		return [w, h];
	}

	constructor() {
		super();
		this.attachShadow({mode:"open"});
		this.#canvas.id = "canvas";
	}

	get width() { return this.#canvasSize[0]; }
	set width(width) {
		this.#canvasSize[0] = width;
		this.style.setProperty("--canvas-width", width);
	}

	get height() { return this.#canvasSize[1]; }
	set height(height) {
		this.#canvasSize[1] = height;
		this.style.setProperty("--canvas-height", height);
	}

	scaleTo(scale) {
		let a = this.animate([{"--scale": scale}], {duration:100, fill:"both"});
		return waitAndCommit(a);
	}

	panTo(x, y) {
		const { width, height } = this;
		let props = {
			"--pan-dx": width/2 - (x + 0.5),
			"--pan-dy": height/2 - (y + 0.5)
		}
		let a = this.animate([props], {duration:100, fill:"both"});
		return waitAndCommit(a);
	}

	panToCenter() {
		const { width, height } = this;
		return this.panTo(width/2 - 0.5, height/2 - 0.5);
	}

	draw(x, y, visual, options={}) {
		let id = options.id || Math.random();
		let zIndex = options.zIndex || 0;

		let existing = this.#storage.getIdByPosition(x, y, zIndex);
		if (existing && existing != id) { console.log("deleting"); this.delete(existing); }

		let node;
		let data = this.#storage.getById(id);
		if (data) {
			// fixmy applyDepth na stare pozici
			this.#storage.update(id, {x, y, zIndex});
			node = data.node;
		} else {
			node = document.createElement("div");
			this.#canvas.append(node);
			this.#storage.add(id, {x, y, zIndex, node});
		}

		updateVisual(node, visual);
		updateProperties(node, {"--x":x, "--y":y, zIndex});

		this.#applyDepth(x, y);

		return id;
	}

	async move(id, x, y) {
		let data = this.#storage.getById(id);
		// fixme if none

		let existing = this.#storage.getIdByPosition(x, y, data.zIndex);
		if (existing && existing != id) { this.delete(existing); }

		let { x:oldX, y:oldY } = data;
		this.#storage.update(id, {x, y});
		this.#applyDepth(oldX, oldY);

		let props = {
			"--x": x,
			"--y": y
		};
		let a = data.node.animate([props], {duration:100, fill:"both"});
		await waitAndCommit(a);
		this.#applyDepth(x, y);
	}

	clear(x, y, zIndex=0) {
		let id = this.#storage.getIdByPosition(x, y, zIndex);
		if (id) { this.delete(id); }
	}

	delete(id) {
		let data = this.#storage.getById(id);
		if (data) {
			data.node.remove();
			this.#storage.delete(id);
		}
	}

	fx(id, effect) {
		let record = this.#storage.getById(id);
		// fixme if none
		let fx = EFFECTS[effect];
		return record.node.animate(fx.keyframes, fx.options);
	}

	connectedCallback() {
		const { style, shadowRoot } = this;

		// apply css props
		this.width = this.width;
		this.height = this.height;

		style.setProperty("--tile-width", "20px");
		style.setProperty("--tile-height", "20px");

		shadowRoot.replaceChildren(
			createStyle(PRIVATE_STYLE),
			this.#canvas
		);
	}

	#applyDepth(x, y) {
		let ids = this.#storage.getIdsByPosition(x, y);
		let data = [...ids].map(id => this.#storage.getById(id));

		let maxZindex = -1/0;
		data.forEach(data => maxZindex = Math.max(maxZindex, data.zIndex));

		data.forEach(data => {
			data.node.hidden = data.zIndex < maxZindex;
		});
	}
}

async function waitAndCommit(a) {
	await a.finished;
	a.effect.target.isConnected && a.commitStyles();
}

function createStyle(src) {
	let style = document.createElement("style");
	style.textContent = src;
	return style;
}

const PUBLIC_STYLE = `
@property --x {
	syntax: "<number>";
	inherits: false;
	initial-value: 0;
}

@property --y {
	syntax: "<number>";
	inherits: false;
	initial-value: 0;
}

@property --scale {
	syntax: "<number>";
	inherits: true;
	initial-value: 1;
}

@property --pan-dx {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}

@property --pan-dy {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}
`;


const PRIVATE_STYLE = `
:host {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background-color: #000;
	font-family: monospace;
	color: gray;
	user-select: none;
}

#canvas {
	flex: none;
	position: relative;
	width: calc(var(--tile-width) * var(--canvas-width));
	height: calc(var(--tile-height) * var(--canvas-height));
	scale: var(--scale);
	translate:
	    calc(var(--tile-width) * var(--pan-dx) * var(--scale))
	    calc(var(--tile-height) * var(--pan-dy) * var(--scale));

	div {
		position: absolute;
		width: var(--tile-width);
		text-align: center;
		left: calc(var(--tile-width) * var(--x));
		top: calc(var(--tile-height) * var(--y));
		font-size: calc(var(--tile-height));
		line-height: 1;
	}
}
`;

customElements.define("rl-display", RlDisplay);
document.head.append(createStyle(PUBLIC_STYLE));

function updateProperties(node, props) {
	for (let key in props) { node.style.setProperty(key, props[key]); }
}

function updateVisual(node, visual) {
	if (visual.ch) { node.textContent = visual.ch; }
	let props = {};
	if (visual.fg) { props.color = visual.fg; }
	if (visual.bg) { props.backgroundColor = visual.bg; }
	updateProperties(node, props);
}
