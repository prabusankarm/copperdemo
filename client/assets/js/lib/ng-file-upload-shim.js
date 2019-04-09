!function(){function e(e,t){window.XMLHttpRequest.prototype[e]=t(window.XMLHttpRequest.prototype[e])}function a(e,t,s){try{Object.defineProperty(e,t,{get:s})}catch(e){}}if(window.FileAPI||(window.FileAPI={}),!window.XMLHttpRequest)throw"AJAX is not supported. XMLHttpRequest is not defined.";if(FileAPI.shouldLoad=!window.FormData||FileAPI.forceLoad,FileAPI.shouldLoad){var n=function(s){if(!s.__listeners){s.upload||(s.upload={}),s.__listeners=[];var i=s.upload.addEventListener;s.upload.addEventListener=function(e,t){s.__listeners[e]=t,i&&i.apply(this,arguments)}}};e("open",function(i){return function(t,e,s){n(this),this.__url=e;try{i.apply(this,[t,e,s])}catch(e){-1<e.message.indexOf("Access is denied")&&(this.__origError=e,i.apply(this,[t,"_fix_for_ie_crossdomain__",s]))}}}),e("getResponseHeader",function(t){return function(e){return this.__fileApiXHR&&this.__fileApiXHR.getResponseHeader?this.__fileApiXHR.getResponseHeader(e):null==t?null:t.apply(this,[e])}}),e("getAllResponseHeaders",function(e){return function(){return this.__fileApiXHR&&this.__fileApiXHR.getAllResponseHeaders?this.__fileApiXHR.getAllResponseHeaders():null==e?null:e.apply(this)}}),e("abort",function(e){return function(){return this.__fileApiXHR&&this.__fileApiXHR.abort?this.__fileApiXHR.abort():null==e?null:e.apply(this)}}),e("setRequestHeader",function(i){return function(e,t){if("__setXHR_"===e){n(this);var s=t(this);s instanceof Function&&s(this)}else this.__requestHeaders=this.__requestHeaders||{},this.__requestHeaders[e]=t,i.apply(this,arguments)}}),e("send",function(o){return function(){var i=this;if(arguments[0]&&arguments[0].__isFileAPIShim){for(var e=arguments[0],t={url:i.__url,jsonp:!1,cache:!0,complete:function(e,t){e&&angular.isString(e)&&-1!==e.indexOf("#2174")&&(e=null),i.__completed=!0,!e&&i.__listeners.load&&i.__listeners.load({type:"load",loaded:i.__loaded,total:i.__total,target:i,lengthComputable:!0}),!e&&i.__listeners.loadend&&i.__listeners.loadend({type:"loadend",loaded:i.__loaded,total:i.__total,target:i,lengthComputable:!0}),"abort"===e&&i.__listeners.abort&&i.__listeners.abort({type:"abort",loaded:i.__loaded,total:i.__total,target:i,lengthComputable:!0}),void 0!==t.status&&a(i,"status",function(){return 0===t.status&&e&&"abort"!==e?500:t.status}),void 0!==t.statusText&&a(i,"statusText",function(){return t.statusText}),a(i,"readyState",function(){return 4}),void 0!==t.response&&a(i,"response",function(){return t.response});var s=t.responseText||(e&&0===t.status&&"abort"!==e?e:void 0);a(i,"responseText",function(){return s}),a(i,"response",function(){return s}),e&&a(i,"err",function(){return e}),i.__fileApiXHR=t,i.onreadystatechange&&i.onreadystatechange(),i.onload&&i.onload()},progress:function(e){if((e.target=i).__listeners.progress&&i.__listeners.progress(e),i.__total=e.total,i.__loaded=e.loaded,e.total===e.loaded){var t=this;setTimeout(function(){i.__completed||(i.getAllResponseHeaders=function(){},t.complete(null,{status:204,statusText:"No Content"}))},FileAPI.noContentTimeout||1e4)}},headers:i.__requestHeaders,data:{},files:{}},s=0;s<e.data.length;s++){var n=e.data[s];null!=n.val&&null!=n.val.name&&null!=n.val.size&&null!=n.val.type?t.files[n.key]=n.val:t.data[n.key]=n.val}setTimeout(function(){if(!FileAPI.hasFlash)throw'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';i.__fileApiXHR=FileAPI.upload(t)},1)}else{if(this.__origError)throw this.__origError;o.apply(i,arguments)}}}),window.XMLHttpRequest.__isFileAPIShim=!0,window.FormData=FormData=function(){return{append:function(e,t,s){t.__isFileAPIBlobShim&&(t=t.data[0]),this.data.push({key:e,val:t,name:s})},data:[],__isFileAPIShim:!0}},window.Blob=Blob=function(e){return{data:e,__isFileAPIBlobShim:!0}}}}(),function(){function e(){try{if(new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))return!0}catch(e){if(void 0!==navigator.mimeTypes["application/x-shockwave-flash"])return!0}return!1}function a(e){var t=0,s=0;if(window.jQuery)return jQuery(e).offset();if(e.offsetParent)for(;t+=e.offsetLeft-e.scrollLeft,s+=e.offsetTop-e.scrollTop,e=e.offsetParent;);return{left:t,top:s}}if(FileAPI.shouldLoad){if(FileAPI.hasFlash=e(),FileAPI.forceLoad&&(FileAPI.html5=!1),!FileAPI.upload){var t,s,i,n,o,l=document.createElement("script"),r=document.getElementsByTagName("script");if(window.FileAPI.jsUrl)t=window.FileAPI.jsUrl;else if(window.FileAPI.jsPath)s=window.FileAPI.jsPath;else for(i=0;i<r.length;i++)if(-1<(n=(o=r[i].src).search(/\/ng\-file\-upload[\-a-zA-z0-9\.]*\.js/))){s=o.substring(0,n+1);break}null==FileAPI.staticPath&&(FileAPI.staticPath=s),l.setAttribute("src",t||s+"FileAPI.min.js"),document.getElementsByTagName("head")[0].appendChild(l)}FileAPI.ngfFixIE=function(s,i,n){if(!e())throw'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';s.bind("mouseenter",function(){var e,t=i.parent();s.attr("disabled")?t&&t.removeClass("js-fileapi-wrapper"):(i.attr("__ngf_flash_")||(i.unbind("change"),i.unbind("click"),i.bind("change",function(e){o.apply(this,[e]),n.apply(this,[e])}),i.attr("__ngf_flash_","true")),t.addClass("js-fileapi-wrapper"),"input"===(e=s)[0].tagName.toLowerCase()&&e.attr("type")&&"file"===e.attr("type").toLowerCase()||(t.css("position","absolute").css("top",a(s[0]).top+"px").css("left",a(s[0]).left+"px").css("width",s[0].offsetWidth+"px").css("height",s[0].offsetHeight+"px").css("filter","alpha(opacity=0)").css("display",s.css("display")).css("overflow","hidden").css("z-index","900000").css("visibility","visible"),i.css("width",s[0].offsetWidth+"px").css("height",s[0].offsetHeight+"px").css("position","absolute").css("top","0px").css("left","0px")))});var o=function(t){for(var e=FileAPI.getFiles(t),s=0;s<e.length;s++)void 0===e[s].size&&(e[s].size=0),void 0===e[s].name&&(e[s].name="file"),void 0===e[s].type&&(e[s].type="undefined");t.target||(t.target={}),t.target.files=e,t.target.files!==e&&(t.__files_=e),(t.__files_||t.target.files).item=function(e){return(t.__files_||t.target.files)[e]||null}}},FileAPI.disableFileInput=function(e,t){t?e.removeClass("js-fileapi-wrapper"):e.addClass("js-fileapi-wrapper")}}}(),window.FileReader||(window.FileReader=function(){var i=this,s=!1;this.listeners={},this.addEventListener=function(e,t){i.listeners[e]=i.listeners[e]||[],i.listeners[e].push(t)},this.removeEventListener=function(e,t){i.listeners[e]&&i.listeners[e].splice(i.listeners[e].indexOf(t),1)},this.dispatchEvent=function(e){var t=i.listeners[e.type];if(t)for(var s=0;s<t.length;s++)t[s].call(i,e)},this.onabort=this.onerror=this.onload=this.onloadstart=this.onloadend=this.onprogress=null;var n=function(e,t){var s={type:e,target:i,loaded:t.loaded,total:t.total,error:t.error};return null!=t.result&&(s.target.result=t.result),s},t=function(e){var t;s||(s=!0,i.onloadstart&&i.onloadstart(n("loadstart",e))),"load"===e.type?(i.onloadend&&i.onloadend(n("loadend",e)),t=n("load",e),i.onload&&i.onload(t)):"progress"===e.type?(t=n("progress",e),i.onprogress&&i.onprogress(t)):(t=n("error",e),i.onerror&&i.onerror(t)),i.dispatchEvent(t)};this.readAsDataURL=function(e){FileAPI.readAsDataURL(e,t)},this.readAsText=function(e){FileAPI.readAsText(e,t)}});