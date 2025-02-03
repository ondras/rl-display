var h=class{#t=[];getById(t){return this.#t.find(e=>e.id==t)}getIdsByPosition(t,e){return new Set(this.#t.filter(i=>i.x==t&&i.y==e).map(i=>i.id))}getIdByPosition(t,e,i){return this.#t.find(s=>s.x==t&&s.y==e&&s.zIndex==i)?.id}add(t,e){this.#t.push(Object.assign(e,{id:t}))}update(t,e){let i=this.#t.findIndex(s=>s.id==t);Object.assign(this.#t[i],e)}delete(t){let e=this.#t.findIndex(i=>i.id==t);this.#t.splice(e,1)}};var u={pulse:{keyframes:{scale:[1,1.6,1],offset:[0,.1,1]},options:500},"fade-in":{keyframes:{opacity:[0,1]},options:300},"fade-out":{keyframes:{opacity:[1,0]},options:300},explode:{keyframes:[{scale:.9,opacity:1},{scale:1},{scale:1.3},{scale:1.2},{scale:1.3},{scale:1.4},{scale:1.3},{scale:"2 1.5",opacity:1},{scale:"4 3",opacity:.5},{scale:"8 6",opacity:0}],options:800}},c=class extends HTMLElement{#t=new h;#s=document.createElement("div");#e=[20,10];static computeTileSize(t,e,i){let s=Math.floor(e[0]/t[0]),n=Math.floor(e[1]/t[1]),a=s/n;return a<i[0]?n=Math.floor(s/i[0]):a>i[1]&&(s=Math.floor(n*i[1])),[s,n]}constructor(){super(),this.attachShadow({mode:"open"}),this.#s.id="canvas"}get cols(){return this.#e[0]}set cols(t){this.#e[0]=t,this.style.setProperty("--canvas-width",t)}get rows(){return this.#e[1]}set rows(t){this.#e[1]=t,this.style.setProperty("--canvas-height",t)}scaleTo(t,e){let i={duration:300,fill:"both"};p(i,e);let s=this.animate([{"--scale":t}],i);return y(s)}panTo(t,e,i){let{cols:s,rows:n}=this,a={"--pan-dx":(s-1)/2-t,"--pan-dy":(n-1)/2-e},r={duration:300,fill:"both"};p(r,i);let o=this.animate([a],r);return y(o)}panToCenter(t){let{cols:e,rows:i}=this;return this.panTo((e-1)/2,(i-1)/2,t)}draw(t,e,i,s={}){let n=s.id||Math.random(),a=s.zIndex||0,r=this.#t.getIdByPosition(t,e,a);r&&r!=n&&this.delete(r);let o,d=this.#t.getById(n);return d?(this.#t.update(n,{x:t,y:e,zIndex:a}),o=d.node):(o=document.createElement("div"),this.#s.append(o),this.#t.add(n,{x:t,y:e,zIndex:a,node:o})),w(o,i),x(o,{"--x":t,"--y":e,zIndex:a}),this.#i(t,e),n}async move(t,e,i,s){let n=this.#t.getById(t),a=this.#t.getIdByPosition(e,i,n.zIndex);a&&a!=t&&this.delete(a);let{x:r,y:o}=n;this.#t.update(t,{x:e,y:i}),this.#i(r,o);let d={"--x":e,"--y":i},f={duration:150,fill:"both"};p(f,s);let m=n.node.animate([d],f);await y(m),this.#i(e,i)}clear(t,e,i=0){let s=this.#t.getIdByPosition(t,e,i);s&&this.delete(s)}delete(t){let e=this.#t.getById(t);e&&(e.node.remove(),this.#t.delete(t),this.#i(e.x,e.y))}clearAll(){}fx(t,e,i){let s=this.#t.getById(t);return typeof e=="string"&&(i=i||u[e].options,e=u[e].keyframes),s.node.animate(e,i)}connectedCallback(){let{shadowRoot:t}=this;this.cols=this.cols,this.rows=this.rows,t.replaceChildren(g(v),this.#s)}#i(t,e){let s=[...this.#t.getIdsByPosition(t,e)].map(a=>this.#t.getById(a)),n=-1/0;s.forEach(a=>n=Math.max(n,a.zIndex)),s.forEach(a=>{a.node.hidden=a.zIndex<n})}};function p(l,t){t&&(typeof t=="number"?l.duration=t:Object.assign(l,t))}async function y(l){await l.finished,l.effect.target.isConnected&&l.commitStyles()}function g(l){let t=document.createElement("style");return t.textContent=l,t}var I=`
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
`,v=`
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
`;customElements.define("rl-display",c);document.head.append(g(I));function x(l,t){for(let e in t)l.style.setProperty(e,t[e])}function w(l,t){t.ch&&(l.textContent=t.ch);let e={};t.fg&&(e.color=t.fg),t.bg&&(e["background-color"]=t.bg),x(l,e)}export{c as default};
