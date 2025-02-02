import { ArrayStorage as Storage } from "./storage.js";

const EFFECTS = {
	"pulse": {
		keyframes: {
			scale: [1, 1.6, 1],
			offset: [0, 0.1, 1]
		},
		options: 500
	},
	"fade-in": {
		keyframes: { opacity: [0, 1]},
		options: 300
	},

	"fade-out": {
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


/**
 * The <rl-display> Custom Element. Uses Shadow DOM, contents are not visible. To show stuff, use its JS API.
 */
export default class RlDisplay extends HTMLElement {
	#storage = new Storage();
	#canvas = document.createElement("div");
	#canvasSize = [20, 10];

	/**
	 * Computes an optimal character size if we want to fit a given number of characters into a given area.
	 * @param {[number, number]} tileCount
	 * @param {*} area
	 * @param {*} aspectRatioRange
	 * @returns {[number, number]} width and height
	 */
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

	get cols() { return this.#canvasSize[0]; }
	set cols(cols) {
		this.#canvasSize[0] = cols;
		this.style.setProperty("--canvas-width", cols);
	}

	get rows() { return this.#canvasSize[1]; }
	set rows(rows) {
		this.#canvasSize[1] = rows;
		this.style.setProperty("--canvas-height", rows);
	}

	scaleTo(scale, timing) {
		let options = {duration:300, fill:"both"};
		mergeTiming(options, timing);
		let a = this.animate([{"--scale": scale}], options);
		return waitAndCommit(a);
	}

	panTo(x, y, timing) {
		const { cols, rows } = this;
		let props = {
			"--pan-dx": (cols-1)/2 - x,
			"--pan-dy": (rows-1)/2 - y
		}
		let options = {duration:300, fill:"both"};
		mergeTiming(options, timing);
		let a = this.animate([props], options);
		return waitAndCommit(a);
	}

	panToCenter(timing) {
		const { cols, rows } = this;
		return this.panTo((cols-1)/2, (rows-1)/2, timing);
	}

	/**
	 * Draws one character (and optionally removes it from its previous position).
	 * @param {number} x
	 * @param {number} y
	 * @param {Visual} visual
	 * @param {Options} [options]
	 * @returns {number} ID
	 */
	draw(x, y, visual, options={}) {
		let id = options.id || Math.random();
		let zIndex = options.zIndex || 0;

		let existing = this.#storage.getIdByPosition(x, y, zIndex);
		if (existing && existing != id) { this.delete(existing); }

		let node;
		let data = this.#storage.getById(id);
		if (data) {
			// fixme applyDepth na stare pozici
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

	async move(id, x, y, timing) {
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

		let options = {duration:150, fill:"both"};
		mergeTiming(options, timing);
		let a = data.node.animate([props], options);
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
			this.#applyDepth(data.x, data.y);
		}
	}

	clearAll() {
		// FIXME
	}

	fx(id, keyframes, options) {
		let record = this.#storage.getById(id);
		// fixme if none
		if (typeof(keyframes) == "string") {
			options = options || EFFECTS[keyframes].options;
			keyframes = EFFECTS[keyframes].keyframes;
		}
		return record.node.animate(keyframes, options);
	}

	connectedCallback() {
		const { shadowRoot } = this;

		// frowards js->css props
		this.cols = this.cols;
		this.rows = this.rows;

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

function mergeTiming(options, timing) {
	if (timing) {
		if (typeof(timing) == "number") {
			options.duration = timing;
		} else {
			Object.assign(options, timing);
		}
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
	font-family: monospace;
	color: gray;
	background-color: black;
	user-select: none;
	--tile-width: 20px;
	--tile-height: 20px;
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
	if (visual.bg) { props["background-color"] = visual.bg; }
	updateProperties(node, props);
}
