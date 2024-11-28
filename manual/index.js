const AsyncGeneratorFunction = (async function*() {}).constructor;

class ExAmple extends HTMLElement {
	#result = document.createElement("div");
	#pre = document.createElement("pre");

	constructor(scriptNode) {
		super();
		this.attachShadow({mode:"open"});

		let code = scriptNode.textContent.trim();
		this.#pre.className = "code";
		this.#pre.textContent = code;


		this.#result.className = "result";
		//this.#result.append(func());
	}

	async connectedCallback() {
		const { shadowRoot } = this;
		shadowRoot.innerHTML = HTML;
		shadowRoot.append(this.#result, this.#pre);

		shadowRoot.querySelector("[name=result]").checked = true;
		shadowRoot.querySelector("[name=code]").checked = true;

		let func = new AsyncGeneratorFunction(this.#pre.textContent);

		let gen = func();
		for await (let result of gen) {
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

nav:has([name=result]:not(:checked)) ~ .result { display: none; }
nav:has([name=code]:not(:checked)) ~ .code { display: none; }
</style>
<nav>
	<label><input type="checkbox" name="result">result</input></label>
	<label><input type="checkbox" name="code">code</input></label>
</nav>
`;

customElements.define("ex-ample", ExAmple);

function createExample(scriptNode) {
	let node = new ExAmple(scriptNode);
	scriptNode.replaceWith(node);
}

function createExamples() {
	let selector = `script[type="application/x-ample"]`;
	[...document.querySelectorAll(selector)].forEach(createExample);
}

customElements.whenDefined("rl-display").then(createExamples);
