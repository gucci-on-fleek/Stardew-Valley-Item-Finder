import{Tablesort as n}from"./tablesort.js";let t,o,e;function c(){const n={item_table:document.getElementById("item_table")};o=new Proxy(n,{get:(n,t)=>(void 0!==n[t]&&null!==n[t]||(n[t]=document.getElementById(t)),n[t])});t=new Proxy({_header_cell(n){const t=a(o.header_cell_base).firstElementChild;return t.insertAdjacentHTML("beforeend",n),t},column_header_cell(n){const t=this._header_cell(n);return t.setAttribute("scope","col"),t},row_header_cell(n){const t=this._header_cell(n);return t.setAttribute("scope","row"),t},header(n){const t=a(o.header_base).firstElementChild;return t.appendChild(n),t},wiki_link(n){const t=a(o.wiki_link_base).firstElementChild;return t.href+=encodeURIComponent(n),t},wiki_search(n){const t=a(o.wiki_search_base).firstElementChild;return t.href+=encodeURIComponent(n),t}},{get:(n,t)=>(void 0===n[t]&&(n[t]=()=>a(o[t+"_base"]).firstElementChild),n[t])})}function r(){c();const n=[[o.save_file_input,"change",n=>i(n)],[o.filter,"keyup",()=>E()],[o.down_button,"click",()=>C(e)],[document.body,"dragover",n=>n.preventDefault()],[document.body,"drop",n=>i(n)],...[...f("summary")].map((n=>[n,"mousedown",n=>{n.preventDefault(),n.target.click()}]))];for(const[t,o,e]of n)t.addEventListener(o,e)}function i(n){let t;if(n.preventDefault(),w(!0,!0),n instanceof window.DragEvent)n.dataTransfer.dropEffect="copy",t=n.dataTransfer.files[0];else{if(!(n.target instanceof window.HTMLInputElement))return void m(o.error);t=n.target.files[0]}const e=new FileReader;e.onload=function(){const n=p(e.result);h(["./dist/items.xslt","./dist/items-to-csv.xslt"]).then((function(t){const o=_(p(t[0]),n);l(g(_(p(t[1]),o)))})).finally((()=>w(!1,!0))).catch((()=>m(o.error)))},e.readAsText(t)}function s(){const n=localStorage.getItem("csv");n&&(w(!0,!1),e=n,l(n),w(!1,!1))}function u(n){return document.querySelector(n)}function f(n){return document.querySelectorAll(n)}function a(n){return n.content.cloneNode(!0)}function l(n){let o=t.table();const e=k(n);o=y(e,o),o=b(e,o),R(o),L(),G()}function d(n){n.hidden=!0}function m(n){n.hidden=!1}function w(n,t){const e=o.loading,c=u("label[for=save_file_input]");n?(m(e),t&&d(c)):(m(c),d(e))}function p(n){return(new DOMParser).parseFromString(n,"text/xml")}function h(n){const t=[];for(const o of n)t.push(fetch(o).then((n=>n.text())));return Promise.all(t)}function _(n,t){const o=new XSLTProcessor;o.importStylesheet(n);return o.transformToFragment(t,new Document)}function g(n){const t=n.firstChild;return e=t.wholeText,localStorage.setItem("csv",e),e}function k(n){return n.split("\n").map((n=>n.split(",")))}function v(n,t){n.appendChild(document.createTextNode(t))}function y(n,o){for(const e of n.slice(1,-1)){const n=o.insertRow();for(const[o,c]of e.entries())switch(o){case 0:n.appendChild(t.row_header_cell(c));break;case 1:{const t=n.insertCell(),o=x(c);t.appendChild(o),t.setAttribute("data-sort",c);break}default:v(n.insertCell(),P(c))}}return o}function b(n,o){const e=new DocumentFragment,c=n[0];for(const n of c)e.append(t.column_header_cell(n));return o.tHead.appendChild(t.header(e)),o}function x(n){switch(n){case"Silver":return t.silver();case"Gold":return t.gold();case"Iridium":return t.iridium();case"":default:return document.createTextNode("")}}function P(n){return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g," ")}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",r):r(),window.addEventListener("load",(function(){s(),window.location.origin.includes("127.0.0.1")||navigator.serviceWorker.register("service-worker.js")}));const R=function(){let n=!1;return function(t){d(u("article")),n&&o.item_table.remove(),t=I(t);o.table_container.appendChild(t),m(u("article")),n=!0}}();function S(n){const t=n.match(/\d/g);return t?Number(t.join("")):0}function I(n){const t=n.tFoot;let o=0,e=0;const c="filter_"+D;for(;t.rows[0];)t.rows[0].remove();for(const t of n.tBodies[0].rows)t.classList.contains(c)||(e+=S(t.cells[3].textContent),o+=S(t.cells[5].textContent));const r=t.insertRow(),i=()=>v(r.insertCell(),"");return v(r.insertCell(),"Total"),i(),i(),v(r.insertCell(),P(e)),i(),v(r.insertCell(),P(o)),n}function L(){const t=o.item_table,e=new n(t),c=["Iridium","Gold","Silver",""];n.extend("number",(n=>n.match(/\d/)),((n,t)=>S(n)-S(t))),n.extend("quality",(n=>-1!==c.indexOf(n)),((n,t)=>c.indexOf(t)-c.indexOf(n)));const r=t.tHead.rows[0].cells;r[r.length-1].setAttribute("aria-sort","ascending");for(const n of r)n.addEventListener("keydown",(function(n){"Enter"!==n.key&&" "!==n.key||(n.preventDefault(),e.sort_table(n.srcElement))}))}function C(n){const t=document.createElement("a");t.setAttribute("href","data:text/csv;charset=utf-8,"+encodeURIComponent(n)),t.setAttribute("download","Stardew Valley Items.csv"),d(t),document.body.appendChild(t),t.click(),document.body.removeChild(t)}let D=1;function E(){const n=o.filter.value,t=o.item_table,e=t.tBodies[0].rows,c=RegExp(n,"i"),r=D-1-1,i="filter_"+D,s="filter_"+r;U();for(const n of e)n.textContent.match(c)||n.classList.add(i),n.classList.remove(s);const u=document.styleSheets[0];u.insertRule(`.${i} {visibility: collapse}`),r>=0&&u.deleteRule(1),I(t),D++}function G(){function n(n){const o=n.target;if(0!==o.cellIndex)return;const e=q(o.textContent);let r;M(e).finally((function(){U();const n=c.insertRow(o.parentElement.rowIndex);n.className="item_description",r=n.insertCell(),r.colSpan=6})).then((function(n){r.innerHTML=n,v(r," "),r.appendChild(t.wiki_link(e))})).catch((function(n){r.innerHTML=n.message,v(r," "),r.appendChild(t.wiki_search(e))}))}const e=o.item_table,c=e.tBodies[0];c.addEventListener("click",n),c.addEventListener("keydown",(function(t){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),n(t))})),e.addEventListener("beforeSort",U)}async function M(n){const t="https://stardewvalleywiki.com/mediawiki/api.php?"+new URLSearchParams({action:"query",format:"json",formatversion:"2",redirects:"",origin:"*",prop:"pageprops",titles:n}).toString(),o=await fetch(t),e=await o.json();try{return e.query.pages[0].pageprops.description}catch{throw Error("Item not found.")}}function U(){const n=f(".item_description");for(const t of n)t.remove()}const j=["Honey","Juice","Wine","Jelly","Aged Roe","Roe"];function q(n){if(n.includes("L. Goat Milk"))return"Large Goat Milk";if(n.includes("Pickled"))return"Pickles";for(const t of j)if(n.includes(t))return t;return n}
//# sourceMappingURL=item-finder.js.map