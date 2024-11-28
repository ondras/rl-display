const AsyncGeneratorFunction = (async function*() {}).constructor;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export default class ExAmple extends HTMLElement {
	#code = "";
	#ac;

	get #result() { return this.shadowRoot.querySelector(".result");}
	get #pre() { return this.shadowRoot.querySelector(".code");}
	get #textarea() { return this.shadowRoot.querySelector("textarea");}

	static fromScript(scriptNode) {
		let example = new this();
		example.code = scriptNode.textContent.trim();
		return example;
	}

	constructor() {
		super();
		this.attachShadow({mode:"open"});
	}

	get code() { return this.#code; }
	set code(code) {
		this.#code = code;
		this.isConnected && this.#evaluate();
	}

	connectedCallback() {
		const { shadowRoot } = this;
		shadowRoot.innerHTML = HTML;

		shadowRoot.querySelector("[name=result]").checked = true;
		shadowRoot.querySelector("[name=code]").checked = true;

		this.#pre.addEventListener("click", _ => {
			let height = this.#pre.offsetHeight;
			this.#pre.hidden = true;
			this.#textarea.hidden = false;
			this.#textarea.style.height = `${height}px`;
			this.#textarea.value = this.#code;
			this.#textarea.focus()
		});

		this.#textarea.addEventListener("blur", _ => {
			this.code = this.#textarea.value;
		});

		this.#evaluate();
	}

	async #evaluate() {
		this.#ac && this.#ac.abort();

		this.#result.replaceChildren();
		this.#textarea.hidden = true;
		this.#pre.hidden = false;
		this.#pre.textContent = this.#code;

		let ac = new AbortController();
		this.#ac = ac;

		let env = {
			sleep,
			signal: ac.signal
		}

		let keys = Object.keys(env);
		let values = Object.values(env);

		let func = new AsyncGeneratorFunction(...keys, this.#code);
		for await (let result of func(...values)) {
			this.#result.append(result);
		}
	}
}

const HTML = `
<style>
:host {
	display: block;
	background-color: #eee;
}

* {
	box-sizing: border-box;
}

nav {
	display: flex;
	justify-content: space-between;
	label {
		display: flex;
		align-items: center;
	}
}

textarea, .code {
	font-family: monospace;
	font-size: inherit;
	margin: 0;
	padding: 0;
	width: 100%;
}

nav:has([name=result]:not(:checked)) ~ .result { display: none; }
nav:has([name=code]:not(:checked)) ~ .code { display: none; }
</style>
<nav>
	<label><input type="checkbox" name="result">result</input></label>
	<label><input type="checkbox" name="code">code</input></label>
</nav>
<div class="result"></div>
<pre class="code"></pre>
<textarea></textarea>
`;

customElements.define("ex-ample", ExAmple);