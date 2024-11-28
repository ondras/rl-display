import ExAmple from "./ex-ample.js"


function createExample(scriptNode) {
	let node = ExAmple.fromScript(scriptNode);
	scriptNode.replaceWith(node);
}

function createExamples() {
	let selector = `script[type="application/x-ample"]`;
	[...document.querySelectorAll(selector)].forEach(createExample);
}

customElements.whenDefined("rl-display").then(createExamples);
