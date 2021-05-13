import{Tablesort as n}from"./tablesort.js";let t,o,e;function c(){const n={item_table:document.getElementById("item_table")};o=new Proxy(n,{get:(n,t)=>(void 0!==n[t]&&null!==n[t]||(n[t]=document.getElementById(t)),n[t])});t=new Proxy({_header_cell(n){const t=f(o.header_cell_base).firstElementChild;return t.insertAdjacentHTML("beforeend",n),t},column_header_cell(n){const t=this._header_cell(n);return t.setAttribute("scope","col"),t},row_header_cell(n){const t=this._header_cell(n);return t.setAttribute("scope","row"),t},header(n){const t=f(o.header_base).firstElementChild;return t.appendChild(n),t},wiki_link(n){const t=f(o.wiki_link_base).firstElementChild;return t.href+=encodeURIComponent(n),t},wiki_search(n){const t=f(o.wiki_search_base).firstElementChild;return t.href+=encodeURIComponent(n),t}},{get:(n,t)=>(void 0===n[t]&&(n[t]=()=>f(o[t+"_base"]).firstElementChild),n[t])})}function r(){c();const n=[[o.save_file_input,"change",n=>file_opened(n)],[o.filter,"keyup",()=>filter_table()],[o.down_button,"click",()=>download_as_csv(e)],[document.body,"dragover",n=>n.preventDefault()],[document.body,"drop",n=>file_opened(n)],...[...u("summary")].map((n=>[n,"mousedown",n=>{n.preventDefault(),n.target.click()}]))];for(const[t,o,e]of n)t.addEventListener(o,e)}function file_opened(n){let t;if(n.preventDefault(),m(!0,!0),n instanceof window.DragEvent)n.dataTransfer.dropEffect="copy",t=n.dataTransfer.files[0];else{if(!(n.target instanceof window.HTMLInputElement))return void l(o.error);t=n.target.files[0]}const e=new FileReader;e.onload=function(){const n=w(e.result);p(["dist/items.xslt","dist/items-to-csv.xslt"]).then((function(t){const o=h(w(t[0]),n);a(_(h(w(t[1]),o)))})).finally((()=>m(!1,!0))).catch((()=>l(o.error)))},e.readAsText(t)}function i(){const n=localStorage.getItem("csv");n&&(m(!0,!1),e=n,a(n),m(!1,!1))}function s(n){return document.querySelector(n)}function u(n){return document.querySelectorAll(n)}function f(n){return n.content.cloneNode(!0)}function a(n){let o=t.table();const e=g(n);o=v(e,o),o=y(e,o),P(o),I(),C()}function d(n){n.hidden=!0}function l(n){n.hidden=!1}function m(n,t){const e=o.loading,c=s("label[for=save_file_input]");n?(l(e),t&&d(c)):(l(c),d(e))}function w(n){return(new DOMParser).parseFromString(n,"text/xml")}function p(n){const t=[];for(const o of n)t.push(fetch(o).then((n=>n.text())));return Promise.all(t)}function h(n,t){const o=new XSLTProcessor;o.importStylesheet(n);return o.transformToFragment(t,new Document)}function _(n){const t=n.firstChild;return e=t.wholeText,localStorage.setItem("csv",e),e}function g(n){return n.split("\n").map((n=>n.split(",")))}function k(n,t){n.appendChild(document.createTextNode(t))}function v(n,o){for(const e of n.slice(1,-1)){const n=o.insertRow();for(const[o,c]of e.entries())switch(o){case 0:n.appendChild(t.row_header_cell(c));break;case 1:{const t=n.insertCell(),o=b(c);t.appendChild(o),t.setAttribute("data-sort",c);break}default:k(n.insertCell(),x(c))}}return o}function y(n,o){const e=new DocumentFragment,c=n[0];for(const n of c)e.append(t.column_header_cell(n));return o.tHead.appendChild(t.header(e)),o}function b(n){switch(n){case"Silver":return t.silver();case"Gold":return t.gold();case"Iridium":return t.iridium();case"":default:return document.createTextNode("")}}function x(n){return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g," ")}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",r):r(),window.addEventListener("load",(function(){i(),window.location.origin.includes("127.0.0.1")||navigator.serviceWorker.register("dist/service-worker.js")}));const P=function(){let n=!1;return function(t){d(s("article")),n&&o.item_table.remove(),t=S(t);o.table_container.appendChild(t),l(s("article")),n=!0,o.filter.focus()}}();function R(n){const t=n.match(/\d/g);return t?Number(t.join("")):0}function S(n){const t=n.tFoot;let o=0,e=0;const c="filter_"+L;for(;t.rows[0];)t.rows[0].remove();for(const t of n.tBodies[0].rows)t.classList.contains(c)||(e+=R(t.cells[3].textContent),o+=R(t.cells[5].textContent));const r=t.insertRow(),i=()=>k(r.insertCell(),"");return k(r.insertCell(),"Total"),i(),i(),k(r.insertCell(),x(e)),i(),k(r.insertCell(),x(o)),n}function I(){const t=o.item_table,e=new n(t);n.extend("number",(n=>n.match(/\d/)),((n,t)=>R(n)-R(t)));const c=t.tHead.rows[0].cells;c[c.length-1].setAttribute("aria-sort","ascending");for(const n of c)n.addEventListener("keydown",(function(n){"Enter"!==n.key&&" "!==n.key||(n.preventDefault(),e.sortTable(n.srcElement))}))}function download_as_csv(n){const t=document.createElement("a");t.setAttribute("href","data:text/csv;charset=utf-8,"+encodeURIComponent(n)),t.setAttribute("download","Stardew Valley Items.csv"),d(t),document.body.appendChild(t),t.click(),document.body.removeChild(t)}let L=1;function filter_table(){const n=o.filter.value,t=o.item_table,e=t.tBodies[0].rows,c=RegExp(n,"i"),r=L-1-1,i="filter_"+L,s="filter_"+r;E();for(const n of e)n.textContent.match(c)||n.classList.add(i),n.classList.remove(s);const u=document.styleSheets[0];u.insertRule(`.${i} {visibility: collapse}`),r>=0&&u.deleteRule(1),S(t),L++}function C(){function n(n){const o=n.target;if(0!==o.cellIndex)return;const e=U(o.textContent);let r;D(e).finally((function(){E();const n=c.insertRow(o.parentElement.rowIndex);n.className="item_description",r=n.insertCell(),r.colSpan=6})).then((function(n){r.innerHTML=n,k(r," "),r.appendChild(t.wiki_link(e))})).catch((function(n){r.innerHTML=n.message,k(r," "),r.appendChild(t.wiki_search(e))}))}const e=o.item_table,c=e.tBodies[0];c.addEventListener("click",n),c.addEventListener("keydown",(function(t){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),n(t))})),e.addEventListener("beforeSort",E)}async function D(n){const t="https://stardewvalleywiki.com/mediawiki/api.php?"+new URLSearchParams({action:"query",format:"json",formatversion:"2",redirects:"",origin:"*",prop:"pageprops",titles:n}).toString(),o=await fetch(t),e=await o.json();try{return e.query.pages[0].pageprops.description}catch{throw Error("Item not found.")}}function E(){const n=u(".item_description");for(const t of n)t.remove()}const M=["Honey","Juice","Wine","Jelly","Aged Roe","Roe"];function U(n){if(n.includes("L. Goat Milk"))return"Large Goat Milk";if(n.includes("Pickled"))return"Pickles";for(const t of M)if(n.includes(t))return t;return n}
//# sourceMappingURL=item-finder.js.map