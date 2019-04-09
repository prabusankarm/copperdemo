!function(){"use strict";
angular.module("nvd3",[]).directive("nvd3",["nvd3Utils",function(o){
    return{restrict:"AE",scope:{data:"=",options:"=",api:"=?",events:"=?",config:"=?",onReady:"&?"},
    link:function(c,n,t){var a={extended:!1,visible:!0,disabled:!1,refreshDataOnly:!0,deepWatchOptions:!0,deepWatchData:!0,deepWatchDataDepth:2,debounce:10,debounceImmediate:!0};
    function r(a,n){a&&n&&angular.forEach(a,function(t,e){
        void 0===n[e]||null===n[e]?c._config.extended&&(n[e]=t.on):a.on(e+"._",n[e])})}
        function e(t){var e=o.deepExtend(function(t){switch(t){case"title":return{enable:!1,text:"Write Your Title",className:"h4",css:{width:c.options.chart.width+"px",textAlign:"center"}};case"subtitle":return{enable:!1,text:"Write Your Subtitle",css:{width:c.options.chart.width+"px",textAlign:"center"}};case"caption":return{enable:!1,text:"Figure 1. Write Your Caption text.",css:{width:c.options.chart.width+"px",textAlign:"center"}}}}(t),c.options[t]||{});c._config.extended&&(c.options[t]=e);var a=angular.element("<div></div>").html(e.html||"").addClass(t).addClass(e.className).removeAttr("style").css(e.css);e.html||a.text(e.text),e.enable&&("title"===t?n.prepend(a):"subtitle"===t?angular.element(n[0].querySelector(".title")).after(a):"caption"===t&&n.append(a))}function i(t,e){t!==e&&(c._config.disabled||(c._config.refreshDataOnly?c.api.update():c.api.refresh()))}c.isReady=!1,c._config=angular.extend(a,c.config),c.api={refresh:function(){c.api.updateWithOptions(c.options),c.isReady=!0},refreshWithTimeout:function(t){setTimeout(function(){c.api.refresh()},t)},update:function(){c.chart&&c.svg?c.svg.datum(c.data).call(c.chart):c.api.refresh()},updateWithTimeout:function(t){setTimeout(function(){c.api.update()},t)},updateWithOptions:function(a){c.api.clearElement(),!1!==angular.isDefined(a)&&c._config.visible&&(c.chart=nv.models[a.chart.type](),c.chart.id=Math.random().toString(36).substr(2,15),angular.forEach(c.chart,function(t,e){"_"===e[0]||0<=["clearHighlights","highlightPoint","id","options","resizeHandler","state","open","close","tooltipContent"].indexOf(e)||("dispatch"===e?(void 0!==a.chart[e]&&null!==a.chart[e]||c._config.extended&&(a.chart[e]={}),r(c.chart[e],a.chart[e])):0<=["bars","bars1","bars2","boxplot","bullet","controls","discretebar","distX","distY","interactiveLayer","legend","lines","lines1","lines2","multibar","pie","scatter","scatters1","scatters2","sparkline","stack1","stack2","sunburst","tooltip","x2Axis","xAxis","y1Axis","y2Axis","y3Axis","y4Axis","yAxis","yAxis1","yAxis2"].indexOf(e)||"stacked"===e&&"stackedAreaChart"===a.chart.type?(void 0!==a.chart[e]&&null!==a.chart[e]||c._config.extended&&(a.chart[e]={}),function a(n,i,o){n&&i&&angular.forEach(n,function(t,e){"_"===e[0]||("dispatch"===e?(void 0!==i[e]&&null!==i[e]||c._config.extended&&(i[e]={}),r(t,i[e])):"tooltip"===e?(void 0!==i[e]&&null!==i[e]||c._config.extended&&(i[e]={}),a(n[e],i[e],o)):"contentGenerator"===e?i[e]&&n[e](i[e]):-1===["axis","clearHighlights","defined","highlightPoint","nvPointerEventsClass","options","rangeBand","rangeBands","scatter","open","close","node"].indexOf(e)&&(void 0===i[e]||null===i[e]?c._config.extended&&(i[e]=t()):n[e](i[e])))})}(c.chart[e],a.chart[e],a.chart.type)):"focusHeight"===e&&"lineChart"===a.chart.type||"focusHeight"===e&&"lineWithFocusChart"===a.chart.type||("xTickFormat"!==e&&"yTickFormat"!==e||"lineWithFocusChart"!==a.chart.type)&&("tooltips"===e&&"boxPlotChart"===a.chart.type||("tooltipXContent"!==e&&"tooltipYContent"!==e||"scatterChart"!==a.chart.type)&&("x"!==e&&"y"!==e||"forceDirectedGraph"!==a.chart.type)&&(void 0===a.chart[e]||null===a.chart[e]?c._config.extended&&(a.chart[e]="barColor"===e?t()():t()):c.chart[e](a.chart[e]))))}),"sunburstChart"===a.chart.type?c.api.updateWithData(angular.copy(c.data)):c.api.updateWithData(c.data),(a.title||c._config.extended)&&e("title"),(a.subtitle||c._config.extended)&&e("subtitle"),(a.caption||c._config.extended)&&e("caption"),(a.styles||c._config.extended)&&function(){var t=o.deepExtend({classes:{"with-3d-shadow":!0,"with-transitions":!0,gallery:!1},css:{}},c.options.styles||{});c._config.extended&&(c.options.styles=t);angular.forEach(t.classes,function(t,e){t?n.addClass(e):n.removeClass(e)}),n.removeAttr("style").css(t.css)}(),nv.addGraph(function(){if(c.chart)return c.chart.resizeHandler&&c.chart.resizeHandler.clear(),c.chart.resizeHandler=nv.utils.windowResize(function(){c.chart&&c.chart.update&&c.chart.update()}),void 0!==a.chart.zoom&&-1<["scatterChart","lineChart","candlestickBarChart","cumulativeLineChart","historicalBarChart","ohlcBarChart","stackedAreaChart"].indexOf(a.chart.type)&&o.zoom(c,a),c.chart},a.chart.callback))},updateWithData:function(t){var e,a;t&&(d3.select(n[0]).select("svg").remove(),c.svg=d3.select(n[0]).append("svg"),(e=c.options.chart.height)&&(isNaN(+e)||(e+="px"),c.svg.attr("height",e).style({height:e})),(a=c.options.chart.width)?(isNaN(+a)||(a+="px"),c.svg.attr("width",a).style({width:a})):c.svg.attr("width","100%").style({width:"100%"}),c.svg.datum(t).call(c.chart))},clearElement:function(){if(n.find(".title").remove(),n.find(".subtitle").remove(),n.find(".caption").remove(),n.empty(),c.chart&&c.chart.tooltip&&c.chart.tooltip.id&&d3.select("#"+c.chart.tooltip.id()).remove(),nv.graphs&&c.chart)for(var t=nv.graphs.length-1;0<=t;t--)nv.graphs[t]&&nv.graphs[t].id===c.chart.id&&nv.graphs.splice(t,1);nv.tooltip&&nv.tooltip.cleanup&&nv.tooltip.cleanup(),c.chart&&c.chart.resizeHandler&&c.chart.resizeHandler.clear(),c.chart=null},getScope:function(){return c},getElement:function(){return n}},c._config.deepWatchOptions&&c.$watch("options",o.debounce(function(t){c._config.disabled||c.api.refresh()},c._config.debounce,c._config.debounceImmediate),!0),c._config.deepWatchData&&(1===c._config.deepWatchDataDepth?c.$watchCollection("data",i):c.$watch("data",i,2===c._config.deepWatchDataDepth)),c.$watch("config",function(t,e){t!==e&&(c._config=angular.extend(a,t),c.api.refresh())},!0),c._config.deepWatchOptions||c._config.deepWatchData||c.api.refresh(),angular.forEach(c.events,function(a,t){c.$on(t,function(t,e){return a(t,c,e)})}),n.on("$destroy",function(){c.api.clearElement()}),c.$watch("isReady",function(t){t&&c.onReady&&"function"==typeof c.onReady()&&c.onReady()(c,n)})}}}]).factory("nvd3Utils",function(){return{debounce:function(n,i,o){var c;return function(){var t=this,e=arguments,a=o&&!c;clearTimeout(c),c=setTimeout(function(){c=null,o||n.apply(t,e)},i),a&&n.apply(t,e)}},deepExtend:function(a){var n=this;return angular.forEach(arguments,function(t){t!==a&&angular.forEach(t,function(t,e){a[e]&&a[e].constructor&&a[e].constructor===Object?n.deepExtend(a[e],t):a[e]=t})}),a},zoom:function(e,t){var a=t.chart.zoom;if(void 0===a.enabled||null===a.enabled||a.enabled){var n,i,o,c,r,s=e.chart.xAxis.scale(),d=e.chart.yAxis.scale(),l=e.chart.xDomain||s.domain,h=e.chart.yDomain||d.domain,u=s.domain().slice(),p=d.domain().slice(),f=a.scale||1,g=a.translate||[0,0],v=a.scaleExtent||[1,10],m=a.useFixedDomain||!1,x=a.useNiceScale||!1,y=a.horizontalOff||!1,b=a.verticalOff||!1,_=a.unzoomEventType||"dblclick.zoom";x&&(s.nice(),d.nice()),n=function(t,e){return t[0]=Math.min(Math.max(t[0],e[0]),e[1]-e[1]/v[1]),t[1]=Math.max(e[0]+e[1]/v[1],Math.min(t[1],e[1])),t},o=function(){if(void 0!==a.zoomed){var t=a.zoomed(s.domain(),d.domain());y||l([t.x1,t.x2]),b||h([t.y1,t.y2])}else y||l(m?n(s.domain(),u):s.domain()),b||h(m?n(d.domain(),p):d.domain());e.chart.update()},c=function(){if(void 0!==a.unzoomed){var t=a.unzoomed(s.domain(),d.domain());y||l([t.x1,t.x2]),b||h([t.y1,t.y2])}else y||l(u),b||h(p);i.scale(f).translate(g),e.chart.update()},r=function(){void 0!==a.zoomend&&a.zoomend()},i=d3.behavior.zoom().x(s).y(d).scaleExtent(v).on("zoom",o).on("zoomend",r),e.svg.call(i),i.scale(f).translate(g).event(e.svg),"none"!==_&&e.svg.on(_,c)}}}})}();