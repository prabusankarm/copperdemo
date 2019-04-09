!function(e){var E="application/x-dnd",b="application/json",w="Text",C=["move","copy","link"];function x(e,n){return"all"==n?e:e.filter(function(e){return-1!=n.toLowerCase().indexOf(e)})}e.directive("dndDraggable",["$parse","$timeout",function(f,c){return function(o,i,l){i.attr("draggable","true"),l.dndDisableIf&&o.$watch(l.dndDisableIf,function(e){i.attr("draggable",!e)}),i.on("dragstart",function(n){if(n=n.originalEvent||n,"false"==i.attr("draggable"))return!0;A.isDragging=!0,A.itemType=l.dndType&&o.$eval(l.dndType).toLowerCase(),A.dropEffect="none",A.effectAllowed=l.dndEffectAllowed||C[0],n.dataTransfer.effectAllowed=A.effectAllowed;var a=o.$eval(l.dndDraggable),e=E+(A.itemType?"-"+A.itemType:"");try{n.dataTransfer.setData(e,angular.toJson(a))}catch(e){var r=angular.toJson({item:a,type:A.itemType});try{n.dataTransfer.setData(b,r)}catch(e){var t=x(C,A.effectAllowed);n.dataTransfer.effectAllowed=t[0],n.dataTransfer.setData(w,r)}}if(i.addClass("dndDragging"),c(function(){i.addClass("dndDraggingSource")},0),n._dndHandle&&n.dataTransfer.setDragImage&&n.dataTransfer.setDragImage(i[0],0,0),f(l.dndDragstart)(o,{event:n}),l.dndCallback){var d=f(l.dndCallback);A.callback=function(e){return d(o,e||{})}}n.stopPropagation()}),i.on("dragend",function(n){n=n.originalEvent||n,o.$apply(function(){var e=A.dropEffect;f(l[{copy:"dndCopied",link:"dndLinked",move:"dndMoved",none:"dndCanceled"}[e]])(o,{event:n}),f(l.dndDragend)(o,{event:n,dropEffect:e})}),A.isDragging=!1,A.callback=void 0,i.removeClass("dndDragging"),i.removeClass("dndDraggingSource"),n.stopPropagation(),c(function(){i.removeClass("dndDraggingSource")},0)}),i.on("click",function(e){l.dndSelected&&(e=e.originalEvent||e,o.$apply(function(){f(l.dndSelected)(o,{event:e})}),e.stopPropagation())}),i.on("selectstart",function(){this.dragDrop&&this.dragDrop()})}}]),e.directive("dndList",["$parse",function(o){return function(i,l,f){var a,c=(angular.forEach(l.children(),function(e){var n=angular.element(e);n.hasClass("dndPlaceholder")&&(a=n)}),a||angular.element("<li class='dndPlaceholder'></li>"));c.remove();var s=c[0],g=l[0],u={};function p(e){if(!e)return w;for(var n=0;n<e.length;n++)if(e[n]==w||e[n]==b||e[n].substr(0,E.length)==E)return e[n];return null}function v(e){return A.isDragging?A.itemType||void 0:e==w||e==b?null:e&&e.substr(E.length+1)||void 0}function D(e){return!u.disabled&&(!(!u.externalSources&&!A.isDragging)&&(!u.allowedTypes||null===e||e&&-1!=u.allowedTypes.indexOf(e)))}function y(e,n){var a=C;return n||(a=x(a,e.dataTransfer.effectAllowed)),A.isDragging&&(a=x(a,A.effectAllowed)),f.dndEffectAllowed&&(a=x(a,f.dndEffectAllowed)),a.length?e.ctrlKey&&-1!=a.indexOf("copy")?"copy":e.altKey&&-1!=a.indexOf("link")?"link":a[0]:"none"}function T(){return c.remove(),l.removeClass("dndDragover"),!0}function h(e,n,a,r,t,d){return o(e)(i,{callback:A.callback,dropEffect:a,event:n,external:!A.isDragging,index:void 0!==t?t:m(),item:d||void 0,type:r})}function m(){return Array.prototype.indexOf.call(g.children,s)}l.on("dragenter",function(e){e=e.originalEvent||e;var n=f.dndAllowedTypes&&i.$eval(f.dndAllowedTypes);u={allowedTypes:angular.isArray(n)&&n.join("|").toLowerCase().split("|"),disabled:f.dndDisableIf&&i.$eval(f.dndDisableIf),externalSources:f.dndExternalSources&&i.$eval(f.dndExternalSources),horizontal:f.dndHorizontalList&&i.$eval(f.dndHorizontalList)};var a=p(e.dataTransfer.types);if(!a||!D(v(a)))return!0;e.preventDefault()}),l.on("dragover",function(e){var n=p((e=e.originalEvent||e).dataTransfer.types),a=v(n);if(!n||!D(a))return!0;if(s.parentNode!=g&&l.append(c),e.target!=g){for(var r=e.target;r.parentNode!=g&&r.parentNode;)r=r.parentNode;if(r.parentNode==g&&r!=s){var t=r.getBoundingClientRect();if(u.horizontal)var d=e.clientX<t.left+t.width/2;else d=e.clientY<t.top+t.height/2;g.insertBefore(s,d?r:r.nextSibling)}}var o=n==w,i=y(e,o);return"none"==i?T():f.dndDragover&&!h(f.dndDragover,e,i,a)?T():(e.preventDefault(),o||(e.dataTransfer.dropEffect=i),l.addClass("dndDragover"),e.stopPropagation(),!1)}),l.on("drop",function(e){var n=p((e=e.originalEvent||e).dataTransfer.types),a=v(n);if(!n||!D(a))return!0;e.preventDefault();try{var r=JSON.parse(e.dataTransfer.getData(n))}catch(e){return T()}if((n==w||n==b)&&(a=r.type||void 0,r=r.item,!D(a)))return T();var t=n==w,d=y(e,t);if("none"==d)return T();var o=m();return f.dndDrop&&!(r=h(f.dndDrop,e,d,a,o,r))?T():(A.dropEffect=d,t||(e.dataTransfer.dropEffect=d),!0!==r&&i.$apply(function(){i.$eval(f.dndList).splice(o,0,r)}),h(f.dndInserted,e,d,a,o,r),T(),e.stopPropagation(),!1)}),l.on("dragleave",function(e){e=e.originalEvent||e;var n=document.elementFromPoint(e.clientX,e.clientY);g.contains(n)&&!e._dndPhShown?e._dndPhShown=!0:T()})}}]),e.directive("dndNodrag",function(){return function(e,n,a){n.attr("draggable","true"),n.on("dragstart",function(e){(e=e.originalEvent||e)._dndHandle||(e.dataTransfer.types&&e.dataTransfer.types.length||e.preventDefault(),e.stopPropagation())}),n.on("dragend",function(e){(e=e.originalEvent||e)._dndHandle||e.stopPropagation()})}}),e.directive("dndHandle",function(){return function(e,n,a){n.attr("draggable","true"),n.on("dragstart dragend",function(e){(e=e.originalEvent||e)._dndHandle=!0})}});var A={}}(angular.module("dndLists",[]));