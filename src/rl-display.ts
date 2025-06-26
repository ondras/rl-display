import { MapStorage as Storage } from "./storage.ts";

/** Optional timing data for animated methods */
export type Timing = number | KeyframeAnimationOptions;

/** Entity Id can by any JS value */
export type Id = any;

/** Definition of visual properties for a drawn character */
export interface Visual {
	/** character */        ch?: string;
	/** foreground color */ fg?: string;
	/** background color */ bg?: string;
}

/** Additional optional options for the draw() method */
export interface DrawOptions {
	/** id for animation/move referencing */
	id?: Id;

	/** depth */
	zIndex?: number;
}

/** Pre-built effects */
export const EFFECTS = {
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
	"jump": {
		keyframes: [
			{scale:1, translate:0},
			{scale:"1.2 0.8", translate:"0 20%"},
			{scale:"0.7 1.3", translate:"0 -70%"},
			{scale:1, translate:0},
		],
		options: 600
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
	#scale = 1;

	/** By default, only the top-most character is draw. Set overlap=true to draw all of them. */
	overlap = false;

	/**
	 * Computes an optimal character size if we want to fit a given number of characters into a given area.
	 */
	static computeTileSize(tileCount: number[], area: number[], aspectRatioRange: number[]): number[] {
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
	get cols(): number { return Number(this.style.getPropertyValue("--cols")) || 20; }
	set cols(cols: number) { this.style.setProperty("--cols", String(cols)); }

	/** Number of rows (characters in vertical direction) */
	get rows(): number { return Number(this.style.getPropertyValue("--rows")) || 10; }
	set rows(rows: number) { this.style.setProperty("--rows", String(rows)); }

	/** Set the zoom amount, maintaining the position set by panTo() */
	scaleTo(scale: number, timing?: Timing): Promise<void> {
		let options = mergeTiming({duration:300, fill:"both" as FillMode}, timing);
		let a = this.animate([{"--scale": scale}], options);
		return waitAndCommit(a);
	}

	/** Center the viewport above a given position */
	panTo(x: number, y: number, scale=1, timing?: Timing): Promise<void> {
		const { cols, rows } = this;
		let props = {
			"--pan-dx": ((cols-1)/2 - x) * scale,
			"--pan-dy": ((rows-1)/2 - y) * scale,
			"--scale": scale
		}
		let options = mergeTiming({duration:300, fill:"both" as FillMode}, timing);
		let a = this.animate([props], options);
		return waitAndCommit(a);
	}

	/** Reset the viewport back to the center of the canvas */
	panToCenter(timing?: Timing): Promise<void> {
		const { cols, rows } = this;
		return this.panTo((cols-1)/2, (rows-1)/2, 1, timing);
	}

	/**
	 * Draws one character (and optionally removes it from its previous position).
	 */
	draw(x: number, y: number, visual: Visual, options: Partial<DrawOptions>={}): Id {
		let id = options.id || Math.random();
		let zIndex = options.zIndex || 0;

		let existing = this.#storage.getIdByPosition(x, y, zIndex);
		if (existing && existing != id) { this.delete(existing); }

		let node: HTMLElement;
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

	/** Move a previously drawn character to a different position */
	async move(id: Id, x: number, y: number, timing?: Timing): Promise<void> {
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

	/** Remove a character from anywhere, based on its id */
	delete(id: Id) {
		let data = this.#storage.getById(id);
		if (data) {
			data.node.remove();
			this.#storage.delete(id);
			this.#applyDepth(data.x, data.y);
		}
	}

	/** Remove a character from a position (without requiring its id) */
	deleteAt(x: number, y: number, zIndex=0) {
		let id = this.#storage.getIdByPosition(x, y, zIndex);
		if (id) { this.delete(id); }
	}

	/** @ignore */
	clearAll() {
		// FIXME
	}

	/** Apply an animation effect. Either a pre-built string or a standardized Keyframe definition. */
	fx(id: Id, keyframes: (keyof typeof EFFECTS) | Keyframe[] | PropertyIndexedKeyframes, options?: Timing): Animation | undefined {
		let record = this.#storage.getById(id);
		if (!record) { return; } // fixme if none

		if (typeof(keyframes) == "string") {
			let def = EFFECTS[keyframes];
			return record.node.animate(def.keyframes, options || def.options);
		} else {
			return record.node.animate(keyframes, options);
		}
	}

	/** @ignore */
	connectedCallback() {
		this.shadowRoot!.replaceChildren(createStyle(PRIVATE_STYLE), this.#canvas);
		this.cols = this.cols;
		this.rows = this.rows;
	}

	#applyDepth(x: number, y: number) {
		if (this.overlap) { return; }

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
	width: calc(var(--tile-width) * var(--cols));
	height: calc(var(--tile-height) * var(--rows));
	scale: var(--scale);
	translate:
	    calc(var(--tile-width) * var(--pan-dx))
	    calc(var(--tile-height) * var(--pan-dy));

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
