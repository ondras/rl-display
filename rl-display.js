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
		style.setProperty("--tile-count-y", "10");
	}

	draw(x, y, visual, id=undefined) {
		id = id || Math.random();
		let node = document.createElement("div");
		this.shadowRoot.append(node);
		this.#nodes.set(id, node);

		updateVisual(node, visual);
		updatePosition(node, x, y);

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

		return node.animate([
			{
				"--x": x,
				"--y": y
			}
		], 100).finished.then(() => updatePosition(node, x, y));
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
		const { shadowRoot } = this;
		shadowRoot.replaceChildren(createStyle());
	}
}

function createStyle() {
	let style = document.createElement("style");
	style.textContent = PRIVATE_STYLE;
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
`;


const PRIVATE_STYLE = `

:host {
	display: block;
	position: relative;
	width: calc(var(--tile-width) * var(--tile-count-x));
	height: calc(var(--tile-height) * var(--tile-count-y));
	user-select: none;
	background-color: #000;
	font-family: monospace;
	color: gray;
}

div {
	position: absolute;
	width: var(--tile-width);
	text-align: center;
	left: calc(var(--tile-width) * var(--x));
	top: calc(var(--tile-height) * var(--y));
	font-size: calc(var(--tile-height));
	line-height: 1;
	transition: --x 300ms;
}
`;

customElements.define("rl-display", RlDisplay);

function updatePosition(node, x, y) {
	node.style.setProperty("--x", x);
	node.style.setProperty("--y", y);
}

function updateVisual(node, visual) {
	if (visual.ch) { node.textContent = visual.ch; }
	if (visual.fg) { node.style.color = visual.fg; }
	if (visual.bg) { node.style.backgroundColor = visual.bg; }
}
