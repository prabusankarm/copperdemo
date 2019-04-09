"format amd";!function(){"use strict";function z(t){return angular.isUndefined(t)||null===t}function t(T,t){if(void 0===t){if("function"!=typeof require)throw new Error("Moment cannot be found by angular-moment! Please reference to: https://github.com/urish/angular-moment");t=function(){try{return require("moment")}catch(t){throw new Error("Please install moment via npm. Please reference to: https://github.com/urish/angular-moment")}}()}return T.module("angularMoment",[]).constant("angularMomentConfig",{preprocess:null,timezone:null,format:null,statefulFilters:!0}).constant("moment",t).constant("amTimeAgoConfig",{withoutSuffix:!1,serverTime:null,titleFormat:null,fullDateThreshold:null,fullDateFormat:null,fullDateThresholdUnit:"day"}).directive("amTimeAgo",["$window","moment","amMoment","amTimeAgoConfig",function(v,w,F,$){return function(t,i,e){var n,r,u=null,m=$.withoutSuffix,f=$.titleFormat,l=$.fullDateThreshold,s=$.fullDateFormat,c=$.fullDateThresholdUnit,o=(new Date).getTime(),a=e.amTimeAgo,d="TIME"===i[0].nodeName.toUpperCase(),g=!i.attr("title");function p(){var t;if(r)t=r;else if($.serverTime){var e=(new Date).getTime()-o+$.serverTime;t=w(e)}else t=w();return t}function h(){u&&(v.clearTimeout(u),u=null)}function D(t){d&&i.attr("datetime",t)}function M(){if(h(),n){var t=F.preprocessDate(n);!function t(e){var n=p().diff(e,c),r=l&&l<=n;if(r?i.text(e.format(s)):i.text(e.from(p(),m)),f&&g&&i.attr("title",e.format(f)),!r){var o=Math.abs(p().diff(e,"minute")),a=3600;o<1?a=1:o<60?a=30:o<180&&(a=300),u=v.setTimeout(function(){t(e)},1e3*a)}}(t),D(t.toISOString())}}t.$watch(a,function(t){if(z(t)||""===t)return h(),void(n&&(i.text(""),D(""),n=null));n=t,M()}),T.isDefined(e.amFrom)&&t.$watch(e.amFrom,function(t){r=z(t)||""===t?null:w(t),M()}),T.isDefined(e.amWithoutSuffix)&&t.$watch(e.amWithoutSuffix,function(t){"boolean"==typeof t?(m=t,M()):m=$.withoutSuffix}),e.$observe("amFullDateThreshold",function(t){l=t,M()}),e.$observe("amFullDateFormat",function(t){s=t,M()}),e.$observe("amFullDateThresholdUnit",function(t){c=t,M()}),t.$on("$destroy",function(){h()}),t.$on("amMoment:localeChanged",function(){M()})}}]).service("amMoment",["moment","$rootScope","$log","angularMomentConfig",function(r,o,e,n){var a=null;this.changeLocale=function(t,e){var n=r.locale(t,e);return T.isDefined(t)&&o.$broadcast("amMoment:localeChanged"),n},this.changeTimezone=function(t){r.tz&&r.tz.setDefault?(r.tz.setDefault(t),o.$broadcast("amMoment:timezoneChanged")):e.warn("angular-moment: changeTimezone() works only with moment-timezone.js v0.3.0 or greater."),n.timezone=t,a=t},this.preprocessDate=function(t){return a!==n.timezone&&this.changeTimezone(n.timezone),n.preprocess?n.preprocess(t):!isNaN(parseFloat(t))&&isFinite(t)?r(parseInt(t,10)):r(t)}}]).filter("amParse",["moment",function(n){return function(t,e){return n(t,e)}}]).filter("amFromUnix",["moment",function(e){return function(t){return e.unix(t)}}]).filter("amUtc",["moment",function(e){return function(t){return e.utc(t)}}]).filter("amUtcOffset",["amMoment",function(n){return function(t,e){return n.preprocessDate(t).utcOffset(e)}}]).filter("amLocal",["moment",function(e){return function(t){return e.isMoment(t)?t.local():null}}]).filter("amTimezone",["amMoment","angularMomentConfig","$log",function(r,t,o){return function(t,e){var n=r.preprocessDate(t);return e?n.tz?n.tz(e):(o.warn("angular-moment: named timezone specified but moment.tz() is undefined. Did you forget to include moment-timezone.js ?"),n):n}}]).filter("amCalendar",["moment","amMoment","angularMomentConfig",function(t,o,e){function n(t,e,n){if(z(t))return"";var r=o.preprocessDate(t);return r.isValid()?r.calendar(e,n):""}return n.$stateful=e.statefulFilters,n}]).filter("amDifference",["moment","amMoment","angularMomentConfig",function(i,u,t){function e(t,e,n,r){if(z(t))return"";var o=u.preprocessDate(t),a=z(e)?i():u.preprocessDate(e);return o.isValid()&&a.isValid()?o.diff(a,n,r):""}return e.$stateful=t.statefulFilters,e}]).filter("amDateFormat",["moment","amMoment","angularMomentConfig",function(t,r,e){function n(t,e){if(z(t))return"";var n=r.preprocessDate(t);return n.isValid()?n.format(e):""}return n.$stateful=e.statefulFilters,n}]).filter("amDurationFormat",["moment","angularMomentConfig",function(r,t){function e(t,e,n){return z(t)?"":r.duration(t,e).humanize(n)}return e.$stateful=t.statefulFilters,e}]).filter("amTimeAgo",["moment","amMoment","angularMomentConfig",function(a,i,t){function e(t,e,n){var r,o;return z(t)?"":(t=i.preprocessDate(t),(r=a(t)).isValid()?(o=a(n),!z(n)&&o.isValid()?r.from(o,e):r.fromNow(e)):"")}return e.$stateful=t.statefulFilters,e}]).filter("amSubtract",["moment","angularMomentConfig",function(r,t){function e(t,e,n){return z(t)?"":r(t).subtract(parseInt(e,10),n)}return e.$stateful=t.statefulFilters,e}]).filter("amAdd",["moment","angularMomentConfig",function(r,t){function e(t,e,n){return z(t)?"":r(t).add(parseInt(e,10),n)}return e.$stateful=t.statefulFilters,e}]).filter("amStartOf",["moment","angularMomentConfig",function(n,t){function e(t,e){return z(t)?"":n(t).startOf(e)}return e.$stateful=t.statefulFilters,e}]).filter("amEndOf",["moment","angularMomentConfig",function(n,t){function e(t,e){return z(t)?"":n(t).endOf(e)}return e.$stateful=t.statefulFilters,e}]),"angularMoment"}var e=window&&window.process&&window.process.type;"function"==typeof define&&define.amd?define(["angular","moment"],t):"undefined"!=typeof module&&module&&module.exports&&"function"==typeof require&&!e?module.exports=t(require("angular"),require("moment")):t(angular,("undefined"!=typeof global&&void 0!==global.moment?global:window).moment)}();