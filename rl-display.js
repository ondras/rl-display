var u=class{},c=class extends u{#e=[];getById(e){return this.#e.find(t=>t.id==e)}getIdsByPosition(e,t){return new Set(this.#e.filter(i=>i.x==e&&i.y==t).map(i=>i.id))}getIdByPosition(e,t,i){return this.#e.find(n=>n.x==e&&n.y==t&&n.zIndex==i)?.id}add(e,t){this.#e.push(Object.assign(t,{id:e}))}update(e,t){let i=this.#e.findIndex(n=>n.id==e);Object.assign(this.#e[i],t)}delete(e){let t=this.#e.findIndex(i=>i.id==e);this.#e.splice(t,1)}};var b={pulse:{keyframes:{scale:[1,1.6,1],offset:[0,.1,1]},options:500},"fade-in":{keyframes:{opacity:[0,1]},options:300},"fade-out":{keyframes:{opacity:[1,0]},options:300},explode:{keyframes:[{scale:.9,opacity:1},{scale:1},{scale:1.3},{scale:1.2},{scale:1.3},{scale:1.4},{scale:1.3},{scale:"2 1.5",opacity:1},{scale:"4 3",opacity:.5},{scale:"8 6",opacity:0}],options:800}},h=class extends HTMLElement{#e=new c;#n=document.createElement("div");#t=[20,10];static computeTileSize(e,t,i){let n=Math.floor(t[0]/e[0]),a=Math.floor(t[1]/e[1]),s=n/a;return s<i[0]?a=Math.floor(n/i[0]):s>i[1]&&(n=Math.floor(a*i[1])),[n,a]}constructor(){super(),this.attachShadow({mode:"open"}),this.#n.id="canvas"}get cols(){return this.#t[0]}set cols(e){this.#t[0]=e,this.style.setProperty("--canvas-width",String(e))}get rows(){return this.#t[1]}set rows(e){this.#t[1]=e,this.style.setProperty("--canvas-height",String(e))}scaleTo(e,t){let i={duration:300,fill:"both"};m(i,t);let n=this.animate([{"--scale":e}],i);return y(n)}panTo(e,t,i){let{cols:n,rows:a}=this,s={"--pan-dx":(n-1)/2-e,"--pan-dy":(a-1)/2-t},l={duration:300,fill:"both"};m(l,i);let o=this.animate([s],l);return y(o)}panToCenter(e){let{cols:t,rows:i}=this;return this.panTo((t-1)/2,(i-1)/2,e)}draw(e,t,i,n={}){let a=n.id||Math.random(),s=n.zIndex||0,l=this.#e.getIdByPosition(e,t,s);l&&l!=a&&this.delete(l);let o,d=this.#e.getById(a);return d?(this.#e.update(a,{x:e,y:t,zIndex:s}),o=d.node):(o=document.createElement("div"),this.#n.append(o),this.#e.add(a,{x:e,y:t,zIndex:s,node:o})),v(o,i),g(o,{"--x":e,"--y":t,zIndex:s}),this.#i(e,t),a}async move(e,t,i,n){let a=this.#e.getById(e);if(!a)return;let s=this.#e.getIdByPosition(t,i,a.zIndex);s&&s!=e&&this.delete(s);let{x:l,y:o}=a;this.#e.update(e,{x:t,y:i}),this.#i(l,o);let d={"--x":t,"--y":i},p={duration:150,fill:"both"};m(p,n);let I=a.node.animate([d],p);await y(I),this.#i(t,i)}clear(e,t,i=0){let n=this.#e.getIdByPosition(e,t,i);n&&this.delete(n)}delete(e){let t=this.#e.getById(e);t&&(t.node.remove(),this.#e.delete(e),this.#i(t.x,t.y))}clearAll(){}fx(e,t,i){let n=this.#e.getById(e);if(n)if(typeof t=="string"){let a=b[t];return n.node.animate(a.keyframes,i||a.options)}else return n.node.animate(t,i)}connectedCallback(){let{shadowRoot:e}=this;this.cols=this.cols,this.rows=this.rows,e.replaceChildren(f(x),this.#n)}#i(e,t){let n=[...this.#e.getIdsByPosition(e,t)].map(s=>this.#e.getById(s)),a=-1/0;n.forEach(s=>a=Math.max(a,s.zIndex)),n.forEach(s=>{s.node.hidden=s.zIndex<a})}};function m(r,e){e&&(typeof e=="number"?r.duration=e:Object.assign(r,e))}async function y(r){await r.finished,r.effect.target.isConnected&&r.commitStyles()}function f(r){let e=document.createElement("style");return e.textContent=r,e}var D=`
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
	width: calc(var(--tile-width) * var(--canvas-width));
	height: calc(var(--tile-height) * var(--canvas-height));
	scale: var(--scale);
	translate:
	    calc(var(--tile-width) * var(--pan-dx) * var(--scale))
	    calc(var(--tile-height) * var(--pan-dy) * var(--scale));

	div {
		position: absolute;
		width: var(--tile-width);
		text-align: center;
		left: calc(var(--tile-width) * var(--x));
		top: calc(var(--tile-height) * var(--y));
		font-size: calc(var(--tile-height));
		line-height: 1;
	}
}
`;customElements.define("rl-display",h);document.head.append(f(D));function g(r,e){for(let t in e)r.style.setProperty(t,e[t])}function v(r,e){e.ch&&(r.textContent=e.ch);let t={};e.fg&&(t.color=e.fg),e.bg&&(t["background-color"]=e.bg),g(r,t)}export{h as default};
