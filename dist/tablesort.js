function t(n,e){if(!(this instanceof t))return new t(n,e);if(!n||"TABLE"!==n.tagName)throw Error("Element must be a table");this.init(n,e||{})}const n=[],e=function(t){let n;return window.CustomEvent&&"function"==typeof window.CustomEvent?n=new CustomEvent(t):(n=document.createEvent("CustomEvent"),n.initCustomEvent(t,!1,!1,void 0)),n},o=function(t){return t.getAttribute("data-sort")||t.textContent||t.innerText||""},r=function(t,n){return(t=t.trim().toLowerCase())===(n=n.trim().toLowerCase())?0:t<n?1:-1},i=function(t,n){return[].slice.call(t).find((function(t){return t.getAttribute("data-sort-column-key")===n}))},s=function(t,n){return function(e,o){const r=t(e.td,o.td);return 0===r?n?o.index-e.index:e.index-o.index:r}};t.extend=function(t,e,o){if("function"!=typeof e||"function"!=typeof o)throw Error("Pattern and sort must be a function");n.push({name:t,pattern:e,sort:o})},t.prototype={init(t,n){const e=this;let o,r,i,s;if(e.table=t,e.thead=!1,e.options=n,t.rows&&t.rows.length>0)if(t.tHead&&t.tHead.rows.length>0){for(i=0;i<t.tHead.rows.length;i++)if("thead"===t.tHead.rows[i].getAttribute("data-sort-method")){o=t.tHead.rows[i];break}o||(o=t.tHead.rows[t.tHead.rows.length-1]),e.thead=!0}else o=t.rows[0];if(!o)return;const a=function(){e.current&&e.current!==this&&e.current.removeAttribute("aria-sort"),e.current=this,e.sortTable(this)};for(i=0;i<o.cells.length;i++)s=o.cells[i],s.setAttribute("role","columnheader"),"none"!==s.getAttribute("data-sort-method")&&(s.tabindex=0,s.addEventListener("click",a,!1),null!==s.getAttribute("data-sort-default")&&(r=s));r&&(e.current=r,e.sortTable(r))},sortTable(t,a){const f=this,c=t.getAttribute("data-sort-column-key"),d=t.cellIndex;let u=r,h="";const l=[];let m=f.thead?0:1;const b=t.getAttribute("data-sort-method");let w=t.getAttribute("aria-sort");if(f.table.dispatchEvent(e("beforeSort")),a||(w="ascending"===w?"descending":"descending"===w?"ascending":f.options.descending?"descending":"ascending",t.setAttribute("aria-sort",w)),!(f.table.rows.length<2)){if(!b){for(;l.length<3&&m<f.table.tBodies[0].rows.length;)h=(k=c?i(f.table.tBodies[0].rows[m].cells,c):f.table.tBodies[0].rows[m].cells[d])?o(k):"",h=h.trim(),h.length>0&&l.push(h),m++;if(!l)return}for(m=0;m<n.length;m++)if(h=n[m],b){if(h.name===b){u=h.sort;break}}else if(l.every(h.pattern)){u=h.sort;break}for(f.col=d,m=0;m<f.table.tBodies.length;m++){const t=[],n={};var g;let e=0,r=0;if(!(f.table.tBodies[m].rows.length<2)){for(g=0;g<f.table.tBodies[m].rows.length;g++){var k;h=f.table.tBodies[m].rows[g],"none"===h.getAttribute("data-sort-method")?n[e]=h:(k=c?i(h.cells,c):h.cells[f.col],t.push({tr:h,td:k?o(k):"",index:e})),e++}for("descending"===w?t.sort(s(u,!0)):(t.sort(s(u,!1)),t.reverse()),g=0;g<e;g++)n[g]?(h=n[g],r++):h=t[g-r].tr,f.table.tBodies[m].appendChild(h)}}f.table.dispatchEvent(e("afterSort"))}},refresh(){void 0!==this.current&&this.sortTable(this.current,!0)}};export{t as Tablesort};
//# sourceMappingURL=tablesort.js.map