var f=class{};function p(a,e){return`${a},${e}`}var u=class extends f{#e=new Map;#i=new Map;#t=new Map;getById(e){return this.#e.get(e)}getIdsByPosition(e,t){return this.#t.get(p(e,t))||new Set}getIdByPosition(e,t,i){return[...this.getIdsByPosition(e,t)].find(n=>this.getById(n).zIndex==i)}add(e,t){this.#e.set(e,t);let i=p(t.x,t.y);this.#i.set(e,i),this.#n(e,i)}update(e,t){let i=this.getById(e);Object.assign(i,t);let s=this.#i.get(e),n=p(i.x,i.y);s!=n&&(this.#t.get(s).delete(e),this.#n(e,n),this.#i.set(e,n))}#n(e,t){this.#t.has(t)?this.#t.get(t).add(e):this.#t.set(t,new Set([e]))}delete(e){this.#e.delete(e);let t=this.#i.get(e);this.#t.get(t).delete(e),this.#i.delete(e)}entries(){return this.#e.entries()}};var x={pulse:{keyframes:{scale:[1,1.6,1],offset:[0,.1,1]},options:500},"fade-in":{keyframes:{opacity:[0,1]},options:300},"fade-out":{keyframes:{opacity:[1,0]},options:300},jump:{keyframes:[{scale:1,translate:0},{scale:"1.2 0.8",translate:"0 20%"},{scale:"0.7 1.3",translate:"0 -70%"},{scale:1,translate:0}],options:600},explode:{keyframes:[{scale:.9,opacity:1},{scale:1},{scale:1.3},{scale:1.2},{scale:1.3},{scale:1.4},{scale:1.3},{scale:"2 1.5",opacity:1},{scale:"4 3",opacity:.5},{scale:"8 6",opacity:0}],options:800}},y="both",m=class extends HTMLElement{#e=new u;#i=document.createElement("div");overlap=!1;static computeTileSize(e,t,i){let s=Math.floor(t[0]/e[0]),n=Math.floor(t[1]/e[1]),r=s/n;return r<i[0]?n=Math.floor(s/i[0]):r>i[1]&&(s=Math.floor(n*i[1])),[s,n]}constructor(){super(),this.attachShadow({mode:"open"}),this.#i.id="canvas"}get cols(){return Number(this.style.getPropertyValue("--cols"))||20}set cols(e){this.style.setProperty("--cols",String(e))}get rows(){return Number(this.style.getPropertyValue("--rows"))||10}set rows(e){this.style.setProperty("--rows",String(e))}panTo(e,t,i=1,s){let{cols:n,rows:r}=this,d={"--pan-dx":((n-1)/2-e)*i,"--pan-dy":((r-1)/2-t)*i,"--scale":i},o=g({duration:300,fill:y},s),l=this.animate([d],o);return I(l)}panToCenter(e){let{cols:t,rows:i}=this;return this.panTo((t-1)/2,(i-1)/2,1,e)}draw(e,t,i,s={}){let n=s.id||Math.random(),r=s.zIndex||0,d=this.#e.getIdByPosition(e,t,r);d&&d!=n&&this.delete(d);let o,l=this.#e.getById(n);if(l){let{x:c,y:h}=l;this.#e.update(n,{x:e,y:t,zIndex:r}),(c!=e||h!=t)&&this.#t(c,h),o=l.node}else o=document.createElement("div"),this.#i.append(o),this.#e.add(n,{x:e,y:t,zIndex:r,node:o});return B(o,i),D(o,{"--x":e,"--y":t,"z-index":r}),s.part&&(o.part=s.part),this.#t(e,t),n}async move(e,t,i,s){let n=this.#e.getById(e);if(!n)return;let r=this.#e.getIdByPosition(t,i,n.zIndex);r&&r!=e&&this.delete(r);let{x:d,y:o}=n;this.#e.update(e,{x:t,y:i}),this.#t(d,o),n.node.hidden=!1;let l={"--x":t,"--y":i},c=g({duration:150,fill:y},s),h=n.node.animate([l],c);await I(h),this.#t(t,i)}delete(e){let t=this.#e.getById(e);t&&(t.node.remove(),this.#e.delete(e),this.#t(t.x,t.y))}deleteAt(e,t,i=0){let s=this.#e.getIdByPosition(e,t,i);s&&this.delete(s)}clearAll(){}fx(e,t,i){let s=this.#e.getById(e);if(s)if(typeof t=="string"){let n=x[t];return s.node.animate(n.keyframes,i||n.options)}else return s.node.animate(t,i)}connectedCallback(){this.shadowRoot.replaceChildren(b(w),this.#i),this.cols=this.cols,this.rows=this.rows}delegateEvent(e){let i=e.composedPath().shift();for(let[s,n]of this.#e.entries())if(n.node==i)return s}#t(e,t){if(this.overlap)return;let s=[...this.#e.getIdsByPosition(e,t)].map(r=>this.#e.getById(r)),n=-1/0;s.forEach(r=>n=Math.max(n,r.zIndex)),s.forEach(r=>{r.node.hidden=r.zIndex<n})}};function g(a,e){return e!==void 0&&(typeof e=="number"?a.duration=e:Object.assign(a,e)),a}async function I(a){await a.finished,a.effect.target.isConnected&&(a.commitStyles(),a.cancel())}function b(a){let e=document.createElement("style");return e.textContent=a,e}var v=`
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
`;customElements.define("rl-display",m);document.head.append(b(v));function D(a,e){for(let t in e)a.style.setProperty(t,e[t])}function B(a,e){e.ch&&(a.textContent=e.ch);let t={};e.fg&&(t.color=e.fg),e.bg&&(t["background-color"]=e.bg),D(a,t)}export{x as EFFECTS,m as default};
