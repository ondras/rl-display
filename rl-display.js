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


export default class RlDisplay extends HTMLElement {
	#nodes = new Map();
	#canvas = document.createElement("div");

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
		this.attachShadow({mode: "open"});
		const { style } = this;
		style.setProperty("--tile-width", "20px");
		style.setProperty("--tile-height", "20px");
		style.setProperty("--tile-count-x", "15");
		style.setProperty("--tile-count-y", "9");

		this.#canvas.id = "canvas";
	}

	get width() { return Number(this.style.getPropertyValue("--tile-count-x")); }
	get height() { return Number(this.style.getPropertyValue("--tile-count-y")); }

	zoom(zoom) {
		let props = {"--scale": zoom};
		return this.animate([props], 100).finished.then(() => updateProperties(this, props));
	}

	pan(x, y) {
		let props = {"--pan-x": x, "--pan-y": y};
		return this.animate([props], 100).finished.then(() => updateProperties(this, props));
	}

	draw(x, y, visual, id=undefined) {
		id = id || Math.random();
		let node = document.createElement("div");
		this.#canvas.append(node);
		this.#nodes.set(id, node);

		updateVisual(node, visual);
		updateProperties(node, {"--x":x, "--y":y});

		return id;
	}

	at(x, y) {
		for (let [id, node] of this.#nodes) {
			const { style } = node;
			if (style.getPropertyValue("--x") == x && style.getPropertyValue("--y") == y) { return id; }
		}
	}

	move(id, x, y, options={}) {
		let node = this.#nodes.get(id);
		let props = {
			"--x": x,
			"--y": y
		};
		return node.animate([props], 100).finished.then(() => updateProperties(node, props));
	}

	remove(id) {
		this.#nodes.get(id).remove();
		this.#nodes.delete(id);
	}

	fx(id, effect) {
		let node = this.#nodes.get(id);
		let fx = EFFECTS[effect];
		let animation = node.animate(fx.keyframes, fx.options);
		return animation.finished;
	}

	connectedCallback() {
		this.shadowRoot.replaceChildren(
			createStyle(PRIVATE_STYLE),
			this.#canvas
		);
	}
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

@property --pan-x {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}

@property --pan-y {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}
`;


const PRIVATE_STYLE = `

:host {
	display: block;
	overflow: hidden;
	width: calc(var(--tile-width) * var(--tile-count-x));
	height: calc(var(--tile-height) * var(--tile-count-y));
	background-color: #000;
}

#canvas {
	position: relative;
	width: 100%;
	height: 100%;
	user-select: none;
	font-family: monospace;
	color: gray;
	scale: var(--scale);
	translate: calc(var(--pan-x) * var(--tile-width) * var(--scale)) calc(var(--pan-y) * var(--tile-height) * var(--scale));

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

document.head.append(createStyle(PUBLIC_STYLE));

customElements.define("rl-display", RlDisplay);

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
