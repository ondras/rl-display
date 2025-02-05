import { ArrayStorage as Storage } from "./storage.ts";

type Timing = number | KeyframeAnimationOptions;
type Id = any;

interface Visual {
	ch?: string;
	fg?: string;
	bg?: string;
}

interface DrawOptions {
	id?: Id;
	zIndex?: number;
}


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
	"explode": {
		keyframes: [
			{scale:0.9, opacity:1},
			{scale:1},
			{scale:1.3},
			{scale:1.2},
			{scale:1.3},
			{scale:1.4},
			{scale:1.3},
			{scale:"2 1.5", opacity:1},
			{scale:"4 3", opacity: 0.5},
			{scale:"8 6", opacity:0},
		],
		options: 800
	}
}


/**
 * The <rl-display> Custom Element. Uses Shadow DOM, contents are not visible. To show stuff, use its JS API.
 */
export default class RlDisplay extends HTMLElement {
	#storage = new Storage<Id, {node:HTMLElement}>();
	#canvas = document.createElement("div");
	#canvasSize = [20, 10];

	/**
	 * Computes an optimal character size if we want to fit a given number of characters into a given area.
	 */
	static computeTileSize(tileCount: number[], area: number[], aspectRatioRange: number[]) {
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

	/** Number of columns (characters in horizontal direction) */
	get cols() { return this.#canvasSize[0]; }
	set cols(cols) {
		this.#canvasSize[0] = cols;
		this.style.setProperty("--canvas-width", String(cols));
	}

	/** Number of rows (characters in vertical direction) */
	get rows() { return this.#canvasSize[1]; }
	set rows(rows) {
		this.#canvasSize[1] = rows;
		this.style.setProperty("--canvas-height", String(rows));
	}

	scaleTo(scale: number, timing?: Timing) {
		let options = mergeTiming({duration:300, fill:"both" as FillMode}, timing);
		let a = this.animate([{"--scale": scale}], options);
		return waitAndCommit(a);
	}

	panTo(x: number, y: number, timing?: Timing) {
		const { cols, rows } = this;
		let props = {
			"--pan-dx": (cols-1)/2 - x,
			"--pan-dy": (rows-1)/2 - y
		}
		let options = mergeTiming({duration:300, fill:"both" as FillMode}, timing);
		let a = this.animate([props], options);
		return waitAndCommit(a);
	}

	panToCenter(timing?: Timing) {
		const { cols, rows } = this;
		return this.panTo((cols-1)/2, (rows-1)/2, timing);
	}

	/**
	 * Draws one character (and optionally removes it from its previous position).
	 */
	draw(x: number, y: number, visual: Visual, options: Partial<DrawOptions>={}) {
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
		updateProperties(node, {"--x":x, "--y":y, "z-index":zIndex});

		this.#applyDepth(x, y);

		return id;
	}

	async move(id: Id, x: number, y: number, timing?: Timing) {
		let data = this.#storage.getById(id);
		if (!data) { return; } // fixme if none

		let existing = this.#storage.getIdByPosition(x, y, data.zIndex);
		if (existing && existing != id) { this.delete(existing); }

		let { x:oldX, y:oldY } = data;
		this.#storage.update(id, {x, y});
		this.#applyDepth(oldX, oldY);
		data.node.hidden = false; // might have been hidden before; show it during the animation

		let props = {
			"--x": x,
			"--y": y
		};
		let options = mergeTiming({duration:150, fill:"both" as FillMode}, timing);
		let a = data.node.animate([props], options);
		await waitAndCommit(a);
		this.#applyDepth(x, y);
	}

	clear(x: number, y: number, zIndex=0) {
		let id = this.#storage.getIdByPosition(x, y, zIndex);
		if (id) { this.delete(id); }
	}

	delete(id: Id) {
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

	fx(id: Id, keyframes: (keyof typeof EFFECTS) | Keyframe[] | PropertyIndexedKeyframes, options?: Timing) {
		let record = this.#storage.getById(id);
		if (!record) { return; } // fixme if none

		if (typeof(keyframes) == "string") {
			let def = EFFECTS[keyframes];
			return record.node.animate(def.keyframes, options || def.options);
		} else {
			return record.node.animate(keyframes, options);
		}
	}

	connectedCallback() {
		const { shadowRoot } = this;

		// forward js->css props
		this.cols = this.cols;
		this.rows = this.rows;

		shadowRoot!.replaceChildren(
			createStyle(PRIVATE_STYLE),
			this.#canvas
		);
	}

	#applyDepth(x: number, y: number) {
		let ids = this.#storage.getIdsByPosition(x, y);
		let data = [...ids].map(id => this.#storage.getById(id)!);

		let maxZindex = -1/0;
		data.forEach(data => maxZindex = Math.max(maxZindex, data.zIndex));

		data.forEach(data => {
			data.node.hidden = data.zIndex < maxZindex;
		});
	}
}

function mergeTiming(options: KeyframeAnimationOptions, timing?: Timing) {
	if (timing) {
		if (typeof(timing) == "number") {
			options.duration = timing;
		} else {
			Object.assign(options, timing);
		}
	}
	return options;
}

async function waitAndCommit(a: Animation) {
	await a.finished;
	(a.effect as KeyframeEffect)!.target!.isConnected && a.commitStyles();
}

function createStyle(src: string) {
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
		display: block; /* not hidden with [hidden] */
		position: absolute;
		width: var(--tile-width);
		text-align: center;
		left: calc(var(--tile-width) * var(--x));
		top: calc(var(--tile-height) * var(--y));
		font-size: calc(var(--tile-height));
		line-height: 1;

		&[hidden] { color: transparent !important; }
	}
}
`;

customElements.define("rl-display", RlDisplay);
document.head.append(createStyle(PUBLIC_STYLE));

function updateProperties(node: HTMLElement, props: Record<string, string | number>) {
	for (let key in props) { node.style.setProperty(key, props[key] as string); }
}

function updateVisual(node: HTMLElement, visual: Visual) {
	if (visual.ch) { node.textContent = visual.ch; }
	let props: Record<string, string> = {};
	if (visual.fg) { props.color = visual.fg; }
	if (visual.bg) { props["background-color"] = visual.bg; }
	updateProperties(node, props);
}
