var i=document.querySelector("rl-display");function v(e,t,n,a){let o=Math.abs(e-n),r=Math.abs(t-a);return Math.max(o,r)}function m(e,t,n,a){let o=e-n,r=t-a;return Math.sqrt(o**2+r**2)}function z(e,t,n,a){let o=n-e,r=a-t,s;Math.abs(o)>=Math.abs(r)?s=Math.abs(o):s=Math.abs(r);let T=o/s,M=r/s,f=e,c=t,$=[];for(let R=0;R<s;R++)f+=T,c+=M,$.push([Math.round(f),Math.round(c)]);return $}function g(e){return new Promise(t=>setTimeout(t,e))}Array.prototype.random=function(){return this[Math.floor(Math.random()*this.length)]};String.prototype.capitalize=function(){return this.charAt(0).toUpperCase()+this.substring(1)};function re(e){let t={ch:e};switch(e){case"/":t.fg="saddlebrown";break;case".":t.fg="#aaa";break;case"#":t.fg="#777",t.bg="#222";break}return t}var k={center:[0,0],spawn1:[0,0],spawn2:[0,0],spawn3:[0,0]},B=[];function A(e){return k[`spawn${e}`]}function E(e){return k[e]}function w(e,t){return B.filter(n=>v(e,t,...n)==1)}function q(e,t){return B.some(n=>n[0]==e&&n[1]==t)}function ie(e,t,n){if(e==" ")return;switch(e){case"@":k.center=[t,n],e=".";break;case"1":case"2":case"3":k[`spawn${e}`]=[t,n],e=".";break}(e=="."||e=="/")&&B.push([t,n]);let a=re(e);i.draw(t,n,a)}function H(){let t=document.querySelector("[type=map]").textContent.trim().split(`
`),n=0;t.forEach((a,o)=>{n=Math.max(n,a.length),a.split("").forEach((r,s)=>ie(r,s+1,o+1))}),i.rows=t.length+2,i.cols=n+2}var se=[{name:"fire",color:"red"},{name:"frost",color:"dodgerblue"},{name:"poison",color:"lime"}],le=["Sharp","Rusty","Dangerous-looking"],ue=["of Vengeance","of Destiny","of Chaos"],me=["sword","dagger","saber"],pe=["Wooden","Oaken","Hickory"],ce=["short bow","bow","longbow"],y=[];function G(){return y}function U(e,t){for(let n of y)if(n.x==e&&n.y==t)return n}function P(e,t,n){e.x=t,e.y=n,y.push(e),i.draw(t,n,e.visual,{zIndex:1})}function j(e){let t=y.indexOf(e);y.splice(t,1),i.deleteAt(e.x,e.y,1)}function S(e){switch(e){case"sword":{let t=[],n=.5;Math.random()<n&&t.push(le.random()),t.push(me.random()),Math.random()>n&&t.push(ue.random());let a=["#999","#aaa","#ccc"].random();return{type:e,range:1,name:t.join(" "),visual:{ch:["(",")"].random(),fg:a}}}case"bow":{let t=[pe.random(),ce.random()].join(" ");return{type:e,name:t,range:4,visual:{ch:["{","}"].random(),fg:"saddlebrown"}}}case"wand":{let t=se.random();return{type:e,name:`Wand of ${t.name}`,range:3,visual:{ch:"I",fg:t.color}}}}}async function K(e,t){switch(e.type){case"sword":case"bow":{for(let n=0;n<t.length;n++){let a=t[n];n?await i.move("arrow",...a):i.draw(...a,{ch:"-",fg:"saddlebrown"},{id:"arrow",zIndex:4})}i.delete("arrow")}break;case"wand":{let n=[];for(let a of t){let o=i.draw(...a,{ch:"*",fg:e.visual.fg},{zIndex:4});n.push(o),await g(50)}await g(450),n.forEach(a=>i.delete(a))}break}}var u={name:"Hector the Barbarian",named:!0,id:"hero",x:0,y:0,visual:{ch:"@",fg:"goldenrod"},goal:{type:"idle"},weapon:S("sword")},l,de=[{name:"orc",visual:{ch:"o",fg:"green"},weaponType:"sword"},{name:"orc shaman",visual:{ch:"o",fg:"lime"},weaponType:"wand"},{name:"ogre",visual:{ch:"O",fg:"green"},weaponType:"sword"},{name:"ogre shaman",visual:{ch:"O",fg:"lime"},weaponType:"wand"},{name:"goblin",visual:{ch:"g",fg:"green"},weaponType:"sword"},{name:"goblin archer",visual:{ch:"g",fg:"blue"},weaponType:"bow"}];function W(){let t=[1,2,3].map(a=>{let o=A(a),r=m(u.x,u.y,...o);return{index:a,distance:r}});t.sort((a,o)=>a.distance-o.distance),t.shift();let n=t.random().index;switch(n){case 1:l=C();break;case 2:l=C();break;case 3:l=C();break}l.goal={type:"attack",target:u},F(l,...A(n))}function F(e,t,n){e.x=t,e.y=n,i.draw(e.x,e.y,e.visual,{id:e.id,zIndex:2})}function C(){let e=de.random();return{id:Math.random(),x:0,y:0,named:!1,goal:{type:"idle"},name:e.name,visual:e.visual,weapon:S(e.weaponType)}}async function V(e){let t=["fade-out","explode"];await i.fx(e.id,t.random()).finished,i.delete(e.id);let n=w(e.x,e.y);if(n.length>0&&Math.random()>.5){let{weapon:o}=e,r={x:0,y:0,visual:o.visual,name:o.name,weapon:o};P(r,...n.random())}let a=Math.random();if(a>.667)P({x:0,y:0,visual:{ch:"$",fg:"gold"},named:!0,name:"some gold"},e.x,e.y);else if(a>.333){let o={x:0,y:0,visual:{ch:"%",fg:e.visual.fg},edible:!0,name:`${e.name} corpse`};P(o,e.x,e.y)}}var ge=10,X=document.querySelector("#log"),L=[],d;function x(e,...t){return e.replace(/%(\w+)/g,(n,a)=>{let o=t.shift();if(!o)return"!!!";let r=n;switch(a.toLowerCase()){case"a":r=o.name,o.named||(r=`${r.charAt(0).match(/[aeiouy]/i)?"an ":"a "} ${r}`);break;case"the":r=o.name,o.named||(r=`the ${r}`);break;case"s":r=o.name;break}return a.charAt(0)==a.charAt(0).toUpperCase()&&(r=r.capitalize()),r})}function _(e,t){return x("%A attacks %a with his %s.",e,t,e.weapon)}function Y(e,t){if(t.edible){let n=["Tastes good.","Yummy!","Tough but nutritious."].random();return x(`%A eats %the. ${n}`,e,t)}else return x("%A picks up %the.",e,t)}function J(e){return x(["%The evades the attack.","The attack misses.","%The's armor protects him."].random(),e)}function Q(e){return x(["%The is killed!","%The is hit and slain.","%The is killed on the spot."].random(),e)}function D(){if(!(d&&!d.childElementCount)){for(d=document.createElement("div"),L.push(d);L.length>ge;)L.shift().remove();X.append(d)}}function b(e){let t=document.createElement("span");t.textContent=e,d.append(t," ")}function Z(){setInterval(()=>X.scrollTop+=3,20),D()}var p=[];function ne(e,t,n){return e.x=t,e.y=n,e==u&&i.panTo(t,n,100),i.move(e.id,t,n,100)}function he(e){let t=w(e.x,e.y);return ne(e,...t.random())}async function we(e,t,n){let a=_(e,t);if(b(a),n&&await K(e.weapon,n),t==u){let o=J(t);return b(o),i.fx(t.id,"pulse")}else{await V(t);let o=Q(t);b(o);let r=p.indexOf(t);p.splice(r),W(),p.push(l),e.goal={type:"idle"}}}function ye(e){let t=U(e.x,e.y);if(!t)return;let n=Y(e,t);b(n),j(t),t.weapon&&(e.weapon=t.weapon),e.goal={type:"idle"}}function te(e,t,n){return v(e.x,e.y,t.x,t.y)<=n}function xe(e){return e.every(t=>q(...t))}function O(e,t){let n=w(e.x,e.y),a=[],o=1/0,r=E("center"),s=m(e.x,e.y,t.x,t.y),T=m(e.x,e.y,...r),M=m(t.x,t.y,...r);return s>T&&s>M&&(t={x:r[0],y:r[1]}),n.forEach(f=>{let c=m(...f,t.x,t.y);c<o&&(o=c,a=[]),c==o&&a.push(f)}),ne(e,...a.random())}function be(e){let{goal:t,weapon:n}=e;switch(t.type){case"idle":return he(e);case"attack":if(te(e,t.target,n.range)){let a;return n.range>1&&(a=z(e.x,e.y,t.target.x,t.target.y),!xe(a))?O(e,t.target):we(e,t.target,a)}else return O(e,t.target);break;case"pickup":return te(e,t.target,0)?ye(e):O(e,t.target)}}async function ae(){D();let e=p.shift();if(await be(e),p.push(e),e==u&&e.goal.type=="idle"){let t=G();t.length>0?e.goal={type:"pickup",target:t[0]}:e.goal={type:"attack",target:l}}}function oe(){F(u,...E("center")),p.push(u),W(),p.push(l)}function ke(){Z(),H(),oe()}async function Pe(){for(;;)await ae(),await g(200)}ke();Pe();
