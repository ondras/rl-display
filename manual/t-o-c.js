export default class TOC extends HTMLElement {
	#hasContent = false;

	static get observedAttributes() {
		return ["selector"];
	}

	constructor() {
		super();
		this.attachShadow({mode:"open"});
	}

	get selector() { return this.getAttribute("selector") || "h2, h3"; }
	set selector(s) { return this.setAttribute("selector", s); }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
			case "selector":
				this.#hasContent && this.#build();
			break;
		}
    }

	connectedCallback() {
		this.shadowRoot.innerHTML = HTML;
		this.#hasContent = true;
		this.#build();
	}

	#build() {
		let ul = this.shadowRoot.querySelector("ul");
		ul.replaceChildren();

		let ulStack = [ul];

		[...document.querySelectorAll(this.selector)].forEach((node, index, all) => {
			let li = createItem(node);
			if (index == 0) {
				ulStack.at(-1).append(li);
				return;
			}

			let prevDepth = getNodeDepth(all[index-1]);
			let depth = getNodeDepth(node);

			if (depth < prevDepth && ulStack.length > 1) {
				ulStack.pop();
				ulStack.at(-1).append(li);
			} else if (depth > prevDepth) {
				let ul = document.createElement("ul");
				ulStack.at(-1).lastElementChild.append(ul);
				ulStack.push(ul);
				ul.append(li);
			} else { // same depth (or failsafe)
				ulStack.at(-1).append(li);
			}
		});
	}
}

function getNodeDepth(node) {
	return Number(node.tagName.replace(/[^\d]/g, ""));
}

function createItem(node) {
	let li = document.createElement("li");
	li.part = "li";
	let a = document.createElement("a");
	a.part = "a";
	a.textContent = node.textContent;
	if (node.id) {
		a.href = `#{node.id}`;
	} else {
		a.href = "#";
		a.onclick = e => {
			e.preventDefault();
			node.scrollIntoView();
		}
	}
	li.append(a);
	return li;
}

const HTML = `
	<slot></slot>
	<ul></ul>
`;
customElements.define("t-o-c", TOC);
