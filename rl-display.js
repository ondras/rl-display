const EFFECTS = {
	"pulse": {
		keyframes: {
			transform: ["scale(1)", "scale(1.6)", "scale(1)"],
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

	nodes = new Map();

	constructor() {
		super();
		this.attachShadow({mode: "open"});
		const { style } = this;
		style.setProperty("--tile-width", "20px");
		style.setProperty("--tile-height", "20px");
		style.setProperty("--tile-count-x", "15");
		style.setProperty("--tile-count-y", "10");
	}

	add(item, position, visual) {
		const { shadowRoot, nodes } = this;
		let node = document.createElement("div");
		shadowRoot.append(node);
		nodes.set(item, node);
		this.setVisual(item, visual);
		this.setPosition(item, position);
	}

	remove(item) {
		const { nodes } = this;
		let node = nodes.get(item);
		node.remove();
		nodes.delete(item);
	}

	setPosition(item, position) {
		const { nodes } = this;
		let node = nodes.get(item);
		node.style.setProperty("--x", position[0]);
		node.style.setProperty("--y", position[1]);
	}

	setVisual(item, visual) {
		const { nodes } = this;
		let node = nodes.get(item);
		if (visual.ch) { node.textContent = visual.ch; }
		if (visual.fg) { node.style.color = visual.fg; }
		if (visual.bg) { node.style.backgroundColor = visual.bg; }
	}

	setViewport(size, ) {

	}

	fx(item, effect) {
		const { nodes } = this;
		let node = nodes.get(item);
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
	style.textContent = STYLE;
	return style;
}

const STYLE = `
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
	transition: all 100ms;
}
`;

customElements.define("rl-display", RlDisplay);
