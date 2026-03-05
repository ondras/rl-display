var f=class{};function p(r,e){return`${r},${e}`}var u=class extends f{#e=new Map;#i=new Map;#t=new Map;getById(e){return this.#e.get(e)}getIdsByPosition(e,t){return this.#t.get(p(e,t))||new Set}getIdByPosition(e,t,i){return[...this.getIdsByPosition(e,t)].find(n=>this.getById(n).zIndex==i)}add(e,t){this.#e.set(e,t);let i=p(t.x,t.y);this.#i.set(e,i),this.#n(e,i)}update(e,t){let i=this.getById(e);Object.assign(i,t);let a=this.#i.get(e),n=p(i.x,i.y);a!=n&&(this.#t.get(a).delete(e),this.#n(e,n),this.#i.set(e,n))}#n(e,t){this.#t.has(t)?this.#t.get(t).add(e):this.#t.set(t,new Set([e]))}delete(e){this.#e.delete(e);let t=this.#i.get(e);this.#t.get(t).delete(e),this.#i.delete(e)}clear(){this.#e.clear(),this.#i.clear(),this.#t.clear()}entries(){return this.#e.entries()}};var x={pulse:{keyframes:{scale:[1,1.6,1],offset:[0,.1,1]},options:500},"fade-in":{keyframes:{opacity:[0,1]},options:300},"fade-out":{keyframes:{opacity:[1,0]},options:300},jump:{keyframes:[{scale:1,translate:0},{scale:"1.2 0.8",translate:"0 20%"},{scale:"0.7 1.3",translate:"0 -70%"},{scale:1,translate:0}],options:600},explode:{keyframes:[{scale:.9,opacity:1},{scale:1},{scale:1.3},{scale:1.2},{scale:1.3},{scale:1.4},{scale:1.3},{scale:"2 1.5",opacity:1},{scale:"4 3",opacity:.5},{scale:"8 6",opacity:0}],options:800}},y="both",m=class extends HTMLElement{#e=new u;#i=document.createElement("div");overlap=!1;static computeTileSize(e,t,i){let a=Math.floor(t[0]/e[0]),n=Math.floor(t[1]/e[1]),s=a/n;return s<i[0]?n=Math.floor(a/i[0]):s>i[1]&&(a=Math.floor(n*i[1])),[a,n]}constructor(){super(),this.attachShadow({mode:"open"}),this.#i.id="canvas"}get cols(){return Number(this.style.getPropertyValue("--cols"))||20}set cols(e){this.style.setProperty("--cols",String(e))}get rows(){return Number(this.style.getPropertyValue("--rows"))||10}set rows(e){this.style.setProperty("--rows",String(e))}panTo(e,t,i=1,a){let{cols:n,rows:s}=this,l={"--pan-dx":((n-1)/2-e)*i,"--pan-dy":((s-1)/2-t)*i,"--scale":i},o=g({duration:300,fill:y},a),d=this.animate([l],o);return I(d)}panToCenter(e){let{cols:t,rows:i}=this;return this.panTo((t-1)/2,(i-1)/2,1,e)}draw(e,t,i,a={}){let n=a.id||Math.random(),s=a.zIndex||0,l=this.#e.getIdByPosition(e,t,s);l&&l!=n&&this.delete(l);let o,d=this.#e.getById(n);if(d){let{x:c,y:h}=d;this.#e.update(n,{x:e,y:t,zIndex:s}),(c!=e||h!=t)&&this.#t(c,h),o=d.node}else o=document.createElement("div"),this.#i.append(o),this.#e.add(n,{x:e,y:t,zIndex:s,node:o});return B(o,i),D(o,{"--x":e,"--y":t,"z-index":s}),a.part&&(o.part=a.part),this.#t(e,t),n}async move(e,t,i,a){let n=this.#e.getById(e);if(!n)return;let s=this.#e.getIdByPosition(t,i,n.zIndex);s&&s!=e&&this.delete(s);let{x:l,y:o}=n;this.#e.update(e,{x:t,y:i}),this.#t(l,o),n.node.hidden=!1;let d={"--x":t,"--y":i},c=g({duration:150,fill:y},a),h=n.node.animate([d],c);await I(h),this.#t(t,i)}delete(e){let t=this.#e.getById(e);t&&(t.node.remove(),this.#e.delete(e),this.#t(t.x,t.y))}deleteAt(e,t,i=0){let a=this.#e.getIdByPosition(e,t,i);a&&this.delete(a)}clear(){}fx(e,t,i){let a=this.#e.getById(e);if(a)if(typeof t=="string"){let n=x[t];return a.node.animate(n.keyframes,i||n.options)}else return a.node.animate(t,i)}connectedCallback(){this.shadowRoot.replaceChildren(b(w),this.#i),this.cols=this.cols,this.rows=this.rows}delegateEvent(e){let i=e.composedPath().shift();for(let[a,n]of this.#e.entries())if(n.node==i)return a}#t(e,t){if(this.overlap)return;let a=[...this.#e.getIdsByPosition(e,t)].map(s=>this.#e.getById(s)),n=-1/0;a.forEach(s=>n=Math.max(n,s.zIndex)),a.forEach(s=>{s.node.hidden=s.zIndex<n})}};function g(r,e){return e!==void 0&&(typeof e=="number"?r.duration=e:Object.assign(r,e)),r}async function I(r){await r.finished;try{r.commitStyles(),r.cancel()}catch{}}function b(r){let e=document.createElement("style");return e.textContent=r,e}var v=`
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
`;customElements.define("rl-display",m);document.head.append(b(v));function D(r,e){for(let t in e)r.style.setProperty(t,e[t])}function B(r,e){e.ch&&(r.textContent=e.ch);let t={};e.fg&&(t.color=e.fg),e.bg&&(t["background-color"]=e.bg),D(r,t)}export{x as EFFECTS,m as default};
