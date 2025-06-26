var m=class{};function u(r,e){return`${r},${e}`}var c=class extends m{#e=new Map;#t=new Map;#i=new Map;getById(e){return this.#e.get(e)}getIdsByPosition(e,t){return this.#i.get(u(e,t))||new Set}getIdByPosition(e,t,i){return[...this.getIdsByPosition(e,t)].find(n=>this.getById(n).zIndex==i)}add(e,t){this.#e.set(e,t);let i=u(t.x,t.y);this.#t.set(e,i),this.#n(e,i)}update(e,t){let i=this.getById(e);Object.assign(i,t);let s=this.#t.get(e),n=u(i.x,i.y);s!=n&&(this.#i.get(s).delete(e),this.#n(e,n),this.#t.set(e,n))}#n(e,t){this.#i.has(t)?this.#i.get(t).add(e):this.#i.set(t,new Set([e]))}delete(e){this.#e.delete(e);let t=this.#t.get(e);this.#i.get(t).delete(e),this.#t.delete(e)}};var x={pulse:{keyframes:{scale:[1,1.6,1],offset:[0,.1,1]},options:500},"fade-in":{keyframes:{opacity:[0,1]},options:300},"fade-out":{keyframes:{opacity:[1,0]},options:300},jump:{keyframes:[{scale:1,translate:0},{scale:"1.2 0.8",translate:"0 20%"},{scale:"0.7 1.3",translate:"0 -70%"},{scale:1,translate:0}],options:600},explode:{keyframes:[{scale:.9,opacity:1},{scale:1},{scale:1.3},{scale:1.2},{scale:1.3},{scale:1.4},{scale:1.3},{scale:"2 1.5",opacity:1},{scale:"4 3",opacity:.5},{scale:"8 6",opacity:0}],options:800}},h=class extends HTMLElement{#e=new c;#t=document.createElement("div");#i=1;overlap=!1;static computeTileSize(e,t,i){let s=Math.floor(t[0]/e[0]),n=Math.floor(t[1]/e[1]),a=s/n;return a<i[0]?n=Math.floor(s/i[0]):a>i[1]&&(s=Math.floor(n*i[1])),[s,n]}constructor(){super(),this.attachShadow({mode:"open"}),this.#t.id="canvas"}get cols(){return Number(this.style.getPropertyValue("--cols"))||20}set cols(e){this.style.setProperty("--cols",String(e))}get rows(){return Number(this.style.getPropertyValue("--rows"))||10}set rows(e){this.style.setProperty("--rows",String(e))}scaleTo(e,t){let i=p({duration:300,fill:"both"},t),s=this.animate([{"--scale":e}],i);return y(s)}panTo(e,t,i=1,s){let{cols:n,rows:a}=this,l={"--pan-dx":((n-1)/2-e)*i,"--pan-dy":((a-1)/2-t)*i,"--scale":i},o=p({duration:300,fill:"both"},s),d=this.animate([l],o);return y(d)}panToCenter(e){let{cols:t,rows:i}=this;return this.panTo((t-1)/2,(i-1)/2,1,e)}draw(e,t,i,s={}){let n=s.id||Math.random(),a=s.zIndex||0,l=this.#e.getIdByPosition(e,t,a);l&&l!=n&&this.delete(l);let o,d=this.#e.getById(n);return d?(this.#e.update(n,{x:e,y:t,zIndex:a}),o=d.node):(o=document.createElement("div"),this.#t.append(o),this.#e.add(n,{x:e,y:t,zIndex:a,node:o})),v(o,i),g(o,{"--x":e,"--y":t,"z-index":a}),this.#n(e,t),n}async move(e,t,i,s){let n=this.#e.getById(e);if(!n)return;let a=this.#e.getIdByPosition(t,i,n.zIndex);a&&a!=e&&this.delete(a);let{x:l,y:o}=n;this.#e.update(e,{x:t,y:i}),this.#n(l,o),n.node.hidden=!1;let d={"--x":t,"--y":i},b=p({duration:150,fill:"both"},s),I=n.node.animate([d],b);await y(I),this.#n(t,i)}delete(e){let t=this.#e.getById(e);t&&(t.node.remove(),this.#e.delete(e),this.#n(t.x,t.y))}deleteAt(e,t,i=0){let s=this.#e.getIdByPosition(e,t,i);s&&this.delete(s)}clearAll(){}fx(e,t,i){let s=this.#e.getById(e);if(s)if(typeof t=="string"){let n=x[t];return s.node.animate(n.keyframes,i||n.options)}else return s.node.animate(t,i)}connectedCallback(){this.shadowRoot.replaceChildren(f(w),this.#t),this.cols=this.cols,this.rows=this.rows}#n(e,t){if(this.overlap)return;let s=[...this.#e.getIdsByPosition(e,t)].map(a=>this.#e.getById(a)),n=-1/0;s.forEach(a=>n=Math.max(n,a.zIndex)),s.forEach(a=>{a.node.hidden=a.zIndex<n})}};function p(r,e){return e&&(typeof e=="number"?r.duration=e:Object.assign(r,e)),r}async function y(r){await r.finished,r.effect.target.isConnected&&r.commitStyles()}function f(r){let e=document.createElement("style");return e.textContent=r,e}var D=`
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
`,w=`
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
`;customElements.define("rl-display",h);document.head.append(f(D));function g(r,e){for(let t in e)r.style.setProperty(t,e[t])}function v(r,e){e.ch&&(r.textContent=e.ch);let t={};e.fg&&(t.color=e.fg),e.bg&&(t["background-color"]=e.bg),g(r,t)}export{x as EFFECTS,h as default};
