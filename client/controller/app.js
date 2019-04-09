"use strict";
agGrid.initialiseAgGridWithAngular1(angular);
var app = angular.module("myApp", ['slickCarousel', 'ngAnimate', 'ui.router', 'gridster', 'nvd3', 'ui.utils', 'cgBusy', 'ngCountTo', 'ngFileUpload', 'agGrid', 'FBAngular', 'ngSanitize', 'ui.select', 'rzModule', 'dndLists','toaster']).factory('HttpRetryService', HttpRetryService);

function HttpRetryService($http, $q) {
  var httpRetryService = {
    try: tryRequest
  };
  return httpRetryService;

  /**
   * Attempts to resolve a Promise, and retries if it fails
   * @param  promise {Promise}
   * @return {Promise}
   */
  function tryRequest(promise, numRetries) {
    return promise
      .then(function (response) {
        return response;
      }, function (response) {
        var config = angular.extend({
          retryCount: 0
        }, response.config);

        return _retry(config, numRetries || 3);
      });
  }
  function _retry(config, numRetries) {
    return $http(config)
      .then(function (response) {
        return response;
      }, function (response) {
        config.retryCount++;
        if (config.retryCount <= numRetries) {
          return retry(config, numRetries || 3);
        } else {
          return $q.reject(response);
        }
      });
  }
}
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      controller: "loginCtrl",
      templateUrl: '/client/views/login/index.html'
    })

    .state('dashboard', {
      url: '/dashboard',
      templateUrl: "/client/views/dashboard/index.html",
      controller: 'DashboardCtrl'
    })

    .state('container', {
      url: '/container',
      templateUrl: "/client/views/container/index.html",
      controller: 'ContainerCtrl'
    })

  $urlRouterProvider.otherwise("/login");
}]);

app.filter('trusted', ['$sce', function ($sce) {
  return $sce.trustAsResourceUrl;
}]);

app.directive('tooltip', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      $(element).hover(function () {
        // on mouseenter
        $(element).tooltip('show');
      }, function () {
        // on mouseleave
        $(element).tooltip('hide');
      });
    }
  };
});

app.filter('propsFilter', function () {
  return function (items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);

      items.forEach(function (item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});

app.directive('dhxScheduler', function () {
  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template: '<div class="dhx_cal_navline" ng-transclude></div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>',
    link: function ($scope, $element, $attrs, $controller) {
      //default state of the scheduler
      if (!$scope.scheduler)
        $scope.scheduler = {};
      $scope.scheduler.mode = $scope.scheduler.mode || "month";
      $scope.scheduler.date = $scope.scheduler.date || new Date();

      //watch data collection, reload on changes
      $scope.$watch($attrs.data, function (collection) {
        // scheduler.clearAll();
        // scheduler.parse(collection, "json");
        var dp = new dataProcessor("/dashboard/calender");
        dp.init(scheduler);
      }, true);

      //mode or date
      $scope.$watch(function () {
        return $scope.scheduler.mode + $scope.scheduler.date.toString();
      }, function (nv, ov) {
        var mode = scheduler.getState();
        if (nv.date != mode.date || nv.mode != mode.mode)
          scheduler.setCurrentView($scope.scheduler.date, $scope.scheduler.mode);
      }, true);

      //size of scheduler
      $scope.$watch(function () {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function () {
        scheduler.setCurrentView();
      });

      //styling for dhtmlx scheduler
      $element.addClass("dhx_cal_container");

      //init scheduler
      scheduler.init($element[0], $scope.scheduler.date, $scope.scheduler.mode);
    }
  }
});

app.directive('dhxTemplate', ['$filter', function ($filter) {
  scheduler.aFilter = $filter;
  return {
    restrict: 'AE',
    terminal: true,

    link: function ($scope, $element, $attrs, $controller) {
      $element[0].style.display = 'none';
      var template = $element[0].innerHTML;
      template = template.replace(/[\r\n]/g, "").replace(/"/g, "\\\"").replace(/\{\{event\.([^\}]+)\}\}/g, function (match, prop) {
        if (prop.indexOf("|") != -1) {
          var parts = prop.split("|");
          return "\"+scheduler.aFilter('" + (parts[1]).trim() + "')(event." + (parts[0]).trim() + ")+\"";
        }
        return '"+event.' + prop + '+"';
      });
      var templateFunc = Function('sd', 'ed', 'event', 'return "' + template + '"');
      scheduler.templates[$attrs.dhxTemplate] = templateFunc;
    }
  };
}]);

app.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});

// app.directive('exportTable', function(){
//   var link = function ($scope, elm, attr) {
//     $scope.$on('export-pdf', function (e, d) {
//       console.log("Enter success ");
//         elm.tableExport({ type: 'pdf', escape: false });
//     });
//     $scope.$on('export-excel', function (e, d) {
//         elm.tableExport({ type: 'excel', escape: false });
//     });
//     $scope.$on('export-doc', function (e, d) {
//         elm.tableExport({ type: 'doc', escape: false });
//     });
//     $scope.$on('export-csv', function (e, d) {
//         elm.tableExport({ type: 'csv', escape: false });
//     });
// }
// return {
//     restrict: 'C',
//     link: link
// }
// });

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push(function ($q,$injector) {
    return {
      'responseError': function (rejection) {
        console.log("We need to $q.reject it!",rejection);
        var toaster = $injector.get('toaster'); 
        toaster.pop('error', "Errors Found", '<span>Request Failing due to Some Technical Reasons at the following URL '+rejection.config.url+'</span>', 3000, 'trustedHtml');         
        if (rejection.status > 399) { // assuming that any code over 399 is an error
          $q.reject(rejection)
        }
        return rejection;
      }
    }
  })
});

