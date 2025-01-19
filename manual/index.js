import XAmple from "https://cdn.jsdelivr.net/gh/ondras/x-ample/x-ample.js"


function createExamples() {
	let selector = `script[type="application/x-ample"]`;
	[...document.querySelectorAll(selector)].forEach(node => XAmple.replaceScript(node));
}

customElements.whenDefined("rl-display").then(createExamples);
