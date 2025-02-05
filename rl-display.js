var u=class{},c=class extends u{#e=[];getById(e){return this.#e.find(t=>t.id==e)}getIdsByPosition(e,t){return new Set(this.#e.filter(i=>i.x==e&&i.y==t).map(i=>i.id))}getIdByPosition(e,t,i){return this.#e.find(n=>n.x==e&&n.y==t&&n.zIndex==i)?.id}add(e,t){this.#e.push(Object.assign(t,{id:e}))}update(e,t){let i=this.#e.findIndex(n=>n.id==e);Object.assign(this.#e[i],t)}delete(e){let t=this.#e.findIndex(i=>i.id==e);this.#e.splice(t,1)}};var b={pulse:{keyframes:{scale:[1,1.6,1],offset:[0,.1,1]},options:500},"fade-in":{keyframes:{opacity:[0,1]},options:300},"fade-out":{keyframes:{opacity:[1,0]},options:300},explode:{keyframes:[{scale:.9,opacity:1},{scale:1},{scale:1.3},{scale:1.2},{scale:1.3},{scale:1.4},{scale:1.3},{scale:"2 1.5",opacity:1},{scale:"4 3",opacity:.5},{scale:"8 6",opacity:0}],options:800}},h=class extends HTMLElement{#e=new c;#n=document.createElement("div");#t=[20,10];static computeTileSize(e,t,i){let n=Math.floor(t[0]/e[0]),s=Math.floor(t[1]/e[1]),a=n/s;return a<i[0]?s=Math.floor(n/i[0]):a>i[1]&&(n=Math.floor(s*i[1])),[n,s]}constructor(){super(),this.attachShadow({mode:"open"}),this.#n.id="canvas"}get cols(){return this.#t[0]}set cols(e){this.#t[0]=e,this.style.setProperty("--cols",String(e))}get rows(){return this.#t[1]}set rows(e){this.#t[1]=e,this.style.setProperty("--rows",String(e))}scaleTo(e,t){let i=m({duration:300,fill:"both"},t),n=this.animate([{"--scale":e}],i);return p(n)}panTo(e,t,i){let{cols:n,rows:s}=this,a={"--pan-dx":(n-1)/2-e,"--pan-dy":(s-1)/2-t},l=m({duration:300,fill:"both"},i),o=this.animate([a],l);return p(o)}panToCenter(e){let{cols:t,rows:i}=this;return this.panTo((t-1)/2,(i-1)/2,e)}draw(e,t,i,n={}){let s=n.id||Math.random(),a=n.zIndex||0,l=this.#e.getIdByPosition(e,t,a);l&&l!=s&&this.delete(l);let o,d=this.#e.getById(s);return d?(this.#e.update(s,{x:e,y:t,zIndex:a}),o=d.node):(o=document.createElement("div"),this.#n.append(o),this.#e.add(s,{x:e,y:t,zIndex:a,node:o})),w(o,i),f(o,{"--x":e,"--y":t,"z-index":a}),this.#i(e,t),s}async move(e,t,i,n){let s=this.#e.getById(e);if(!s)return;let a=this.#e.getIdByPosition(t,i,s.zIndex);a&&a!=e&&this.delete(a);let{x:l,y:o}=s;this.#e.update(e,{x:t,y:i}),this.#i(l,o),s.node.hidden=!1;let d={"--x":t,"--y":i},g=m({duration:150,fill:"both"},n),I=s.node.animate([d],g);await p(I),this.#i(t,i)}clear(e,t,i=0){let n=this.#e.getIdByPosition(e,t,i);n&&this.delete(n)}delete(e){let t=this.#e.getById(e);t&&(t.node.remove(),this.#e.delete(e),this.#i(t.x,t.y))}clearAll(){}fx(e,t,i){let n=this.#e.getById(e);if(n)if(typeof t=="string"){let s=b[t];return n.node.animate(s.keyframes,i||s.options)}else return n.node.animate(t,i)}connectedCallback(){let{shadowRoot:e}=this;this.cols=this.cols,this.rows=this.rows,e.replaceChildren(y(x),this.#n)}#i(e,t){let n=[...this.#e.getIdsByPosition(e,t)].map(a=>this.#e.getById(a)),s=-1/0;n.forEach(a=>s=Math.max(s,a.zIndex)),n.forEach(a=>{a.node.hidden=a.zIndex<s})}};function m(r,e){return e&&(typeof e=="number"?r.duration=e:Object.assign(r,e)),r}async function p(r){await r.finished,r.effect.target.isConnected&&r.commitStyles()}function y(r){let e=document.createElement("style");return e.textContent=r,e}var D=`
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
`,x=`
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
`;customElements.define("rl-display",h);document.head.append(y(D));function f(r,e){for(let t in e)r.style.setProperty(t,e[t])}function w(r,e){e.ch&&(r.textContent=e.ch);let t={};e.fg&&(t.color=e.fg),e.bg&&(t["background-color"]=e.bg),f(r,t)}export{h as default};
