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
		this.#canvas.id = "canvas";
	}

	get width() { return Number(this.style.getPropertyValue("--tile-count-x")); }
	get height() { return Number(this.style.getPropertyValue("--tile-count-y")); }

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

	move(id, x, y, options={}) {
		let node = this.#nodes.get(id);
		let props = {
			"--x": x,
			"--y": y
		};
		let a = node.animate([props], {duration:100, fill:"both"});
		return waitAndCommit(a);
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

	remove(id) {
		this.#nodes.get(id).remove();
		this.#nodes.delete(id);
	}

	fx(id, effect) {
		let node = this.#nodes.get(id);
		let fx = EFFECTS[effect];
		return node.animate(fx.keyframes, fx.options);
	}

	connectedCallback() {
		const { style, shadowRoot } = this;
		style.setProperty("--tile-width", "20px");
		style.setProperty("--tile-height", "20px");
		style.setProperty("--tile-count-x", "15");
		style.setProperty("--tile-count-y", "9");

		shadowRoot.replaceChildren(
			createStyle(PRIVATE_STYLE),
			this.#canvas
		);
	}
}

async function waitAndCommit(a) {
	await a.finished;
	a.commitStyles();
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
	display: block;
	overflow: hidden;
	width: calc(var(--tile-width) * var(--tile-count-x));
	height: calc(var(--tile-height) * var(--tile-count-y));
	background-color: #000;
	font-family: monospace;
	color: gray;
	user-select: none;
}

#canvas {
	position: relative;
	width: 100%;
	height: 100%;
	scale: var(--scale);
	translate: calc(var(--pan-dx) * var(--tile-width) * var(--scale)) calc(var(--pan-dy) * var(--tile-height) * var(--scale));

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
