app.controller('DashboardCtrl', ['$scope', '$timeout', '$http', '$rootScope', '$interval', '$window', 'Upload', '$state', '$stateParams', 'Fullscreen', 'HttpRetryService', 'toaster', '$document', function ($scope, $timeout, $http, $rootScope, $interval, $window, Upload, $state, $stateParams, Fullscreen, HttpRetryService, toaster, $document) {
  $scope.dashboard = {};
  $scope.chartTypes = [];
  $scope.numberTypes = [];
  $scope.mediaTypes = [];
  $scope.mapTypes = [];
  $scope.liveTypes = [];
  $scope.actionTypes = [];
  $scope.gridOptions = {};
  $scope.charts = {};
  $scope.numbers = {};
  $scope.media = {};
  $scope.action = {};
  $scope.maps = {};
  $scope.edit = true;
  $scope.flagStatus = true;
  $scope.multiChartConfig = {};
  $scope.changeReferesh = false;
  $scope.dashboardDisplayData = {};
  $scope.dashboardTile = {};
  $scope.lastRefreshTime = {};
  $scope.chart = {};
  $scope.dataSourceSelected ={};
  $scope.isFullscreen = false;
  $scope.widgetCustomization = {};
  $scope.stepValidity = false;
  $scope.shareValidity = true;
  $scope.updateWithWidgetChange = false;
  $scope.tableWidegtObj = {};
  $scope.tableWidgetArr = {};
  $scope.tempTableArr = [];
  $scope.lineChartConfig = false;
  $scope.requestUrlObj = {};
  var connection={};
  var connected=[];
  var previewConnection;
  var connectionFlag=false;
  $scope.demoChart={};
  var checkWidgetLoad={};
  $scope.carouselItems = {};
  $scope.slickConfig1Loaded={};
  $scope.slickConfig={};
  var stepsArray = [
    { value: 5, legend: 'Real Time' },
    { value: 10, legend: 'Near Real Time' },
    { value: 60, legend: 'Moderate' },
    { value: 300, legend: 'Low' },
    { value: 600, legend: 'Very Low' }
  ];
  // if (!$rootScope.userDetails) {
  //   $state.go('login');
  // } else {
  //   $scope.userId = $rootScope.userDetails.userId;
  //   $scope.tenantId = $rootScope.userDetails.tenantId;
  // }

  $scope.charts.useInteractiveGuideline=false;

  $scope.userId = 1;
  $scope.tenantId = 1;

  $scope.steps = [
    'Widget Configuration',
    'Data Source Configuration',
    'Preview'
  ];

  $scope.selection = $scope.steps[0];
  $scope.getCurrentStepIndex = function () {
    return _.indexOf($scope.steps, $scope.selection);
  };

  $scope.$watch('form.type', function (newVal, oldVal) {
    $scope.selection = $scope.steps[0];
    if ($scope.form) {
      $scope.form.configuration = {};
      $scope.form.category = "";
    }
  });

  $scope.goToStep = function (index, form) {
    if(connectionFlag){
      previewConnection.stop();
    }
    if (!_.isUndefined($scope.steps[index])) {
      if ($scope.getCurrentStepIndex() == 0) {
        if (angular.element('#output').val()) {
          $scope.selectedCellSize = angular.element('#output').val();
        }
      }
      if ($scope.getCurrentStepIndex() == 0) {
        if ((form.description == "" && form.type == "default" && form.name == "") || (!form.name || !form.description)) {
          $scope.stepValidity = true;
        } else if (form.type != "default") {
          if (form.description == "" || form.name == "" || !form.name || !form.description) {
            $scope.stepValidity = true;
          } else {
            if (form.type == 'chart' || form.type == 'number' || form.type == 'action' || form.type == 'map' || form.type == 'media') {
              if (form.category != '') {
                $scope.stepValidity = false;
                if (index == 2) {
                  if (form.configuration.dataSourceSelected) {
                    $scope.loadPreview(form);
                    $scope.selection = $scope.steps[index];
                  } else {
                    $scope.stepValidity = true;
                  }
                } else if (index == 1) {
                  $scope.selection = $scope.steps[index];
                }
              } else {
                $scope.stepValidity = true;
              }
            } else {
              $scope.stepValidity = false;
              $scope.selection = $scope.steps[index];
            }
          }
        } else if (form.type == "default") {
          if (form.type == "default") {
            $scope.stepValidity = true;
          }
        }
      } else if ($scope.getCurrentStepIndex() == 1) {
        if (index == 0) {
          $scope.selection = $scope.steps[index];
        }
        if (form.configuration.dataSourceSelected && $scope.hasNextStep()) {
          $scope.stepValidity = false;
          $scope.selection = $scope.steps[index];
          if(index!=0){          
          $scope.loadPreview(form);
          }

        } else {
          $scope.stepValidity = true;
        }
      } else if ($scope.getCurrentStepIndex() == 2) {
        $scope.selection = $scope.steps[index];
      }
    }
  };

  $scope.hasNextStep = function () {
    var stepIndex = $scope.getCurrentStepIndex();
    var nextStep = stepIndex + 1;
    return !_.isUndefined($scope.steps[nextStep]);
  };

  $scope.hasPreviousStep = function () {
    var stepIndex = $scope.getCurrentStepIndex();
    var previousStep = stepIndex - 1;
    return !_.isUndefined($scope.steps[previousStep]);
  };

//Close The connection in Previous Module 
  $scope.closePreviewConnection= function(){
  if($scope.getCurrentStepIndex()==2 || connectionFlag==true){
    previewConnection.stop();
  }
  }

  $scope.incrementStep = function (form) {
    if(connectionFlag){
      previewConnection.stop();
      connectionFlag=false;
    }
    if ($scope.getCurrentStepIndex() == 0) {
      if (angular.element('#output').val()) {
        $scope.selectedCellSize = angular.element('#output').val();
      }
    }
    if ($scope.getCurrentStepIndex() == 0) {
      if ((form.description == "" && form.type == "default" && form.name == "") || (!form.name || !form.description)) {
        $scope.stepValidity = true;
      } else if (form.type != "default") {
        if (form.description == "" || form.name == "" || !form.name || !form.description) {
          $scope.stepValidity = true;
        } else {
          if (form.type == 'chart' || form.type == 'number' || form.type == 'action' || form.type == 'map' || form.type == 'media') {
            if (form.category != '') {
              $scope.stepValidity = false;
              var stepIndex = $scope.getCurrentStepIndex();
              var nextStep = stepIndex + 1;
              $scope.selection = $scope.steps[nextStep];
            } else {
              $scope.stepValidity = true;
            }
          } else {
            $scope.stepValidity = false;
            var stepIndex = $scope.getCurrentStepIndex();
            var nextStep = stepIndex + 1;
            $scope.selection = $scope.steps[nextStep];
          }
        }
      } else if (form.type == "default") {
        $scope.stepValidity = true;
      }
    } else if ($scope.getCurrentStepIndex() == 1) {
      if (form.configuration.dataSourceSelected && $scope.hasNextStep()) {
        $scope.stepValidity = false;
        var stepIndex = $scope.getCurrentStepIndex();
        var nextStep = stepIndex + 1;
        $scope.selection = $scope.steps[nextStep];
      } else {
        $scope.stepValidity = true;
      }
    }
  };

  $scope.decrementStep = function () {
    if ($scope.hasPreviousStep()) {
      if(connectionFlag){
        previewConnection.stop();
      }
      var stepIndex = $scope.getCurrentStepIndex();
      var previousStep = stepIndex - 1;
      $scope.selection = $scope.steps[previousStep];
    }
  };

  $scope.gridsterOptions = {
    columns: 5,
    resizable: {
      enabled: false
    },
    draggable: {
      enabled: false
    }
  };

  $scope.dashboardDetails = {
    dashboardId: "",
    addWidgets: "",
    editable: ""
  };

  $scope.requestBody = {
    value: 0,
    children: []
  };

  $scope.requestHeader = {
    value: 0,
    children: []
  };

  $scope.mediaType = function (val) {
    $scope.form.configuration.dataSourceSelected.type = val;
  };

  $scope.cancelAddDataSource = function () {
    angular.element(document.querySelector("body")).removeClass("outer_add_dashboard_open");
  };

  $scope.addDataSource = function () {
    $scope.newDataSource = {
      dataSourceHeaders: [],
      dataSourceBody: [],
      dataSourceRefreshTime: 300,
      dataSourceRetryFrequency: 3,
      dataSourceRequestType: 'rest',
      dataSourceRestType: 'get',
      datasourceSignalRMessageLimit:200
    };
    $scope.add_datasource_form1.$setPristine();
    $scope.add_datasource_form.$setPristine();
  };

  $scope.loadTableCustomization = function (form) {
    $scope.tempTableArray = [];
    tableKeyArray = Object.keys($scope.dashboardTile[form.id][0]);
    tableKeyArray.forEach(element => {
      tempObj = {
        key: element
      }
      if ($scope.tableWidegtObj == {}) {
        $scope.tableWidegtObj[element] = element;
      }
      $scope.tempTableArray.push(tempObj);
    });
  };

   //Get the SignalR Connection From the Server HUB 
  function getConnectionSignalRInfo(apiBaseUrl) {
    return axios.post(`${apiBaseUrl}`, null )
      .then(resp => resp.data);
  }

  //To Create the SignarR connection 
  function createSignalRConnection(url,options) {
    return new signalR.HubConnectionBuilder()
    .withUrl(url,options)
    .build();      
  }

  //To Start the signalR Connection
  function startSignalRConnection(connection){
    connection.start().then(() => console.log('connected!'));
  }

  $scope.loadPreview = function (form) {
    $scope.requestUrl = [];
     if (form) 
     {
      if($scope.form.livecheckbox)
      {
        $scope.requestUrl=getSignalRDataSourceRequest(form.configuration.dataSourceSelected);
        $scope.SignalRrequestUrl=JSON.parse($scope.requestUrl[0].APIConfigJson).url;
        $scope.SignalRMethodName=JSON.parse($scope.requestUrl[0].APIConfigJson).signalrMethodName;
      }
     else if(form.category=="carousel"){
      $scope.requestUrl = getSharePointDataSourceRequest(form.configuration.dataSourceSelected);
      }
      else
      {
      $scope.requestUrl = getDataSourceRequest(form.configuration.dataSourceSelected);
      }
       if ($scope.requestUrl.length != 0) 
       {
        if (form.category == "markerMap") 
        {
          var mapOptions = {
            zoom: 2.75,
            center: new google.maps.LatLng(30, -95),
          }
          var infoWindow = new google.maps.InfoWindow();
          var createMarkerFixed = function (info) {
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: new google.maps.LatLng(info.latitude, info.longitude),
              title: "device location"
            });
            marker.content = '<div class="infoWindowContent">Device Id:' + info.deviceId + '</div>';
            google.maps.event.addListener(marker, 'click', function () {
              infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
              infoWindow.open($scope.map, marker);
            });
            $scope.markers.push(marker);
          }
          $scope.markers = [];
          if($scope.form.livecheckbox)
          {
            window.apiBaseUrl =$scope.SignalRrequestUrl;
            getConnectionInfo().then(info => {
               // make compatible with old and new SignalRConnectionInfo            
               info.url = info.url || info.endpoint;            
               const options = {
                 accessTokenFactory: () => info.accessToken
               };
                previewConnection = new signalR.HubConnectionBuilder()
                 .withUrl(info.url,options)
                 .configureLogging(signalR.LogLevel.Information)
                 .build();
                 previewConnection.on($scope.SignalRMethodName,  function(message) {
                  $scope.dashboardTile[form.id] = message;
                  $scope.map = new google.maps.Map(document.getElementById('map' + form.id), mapOptions);
            for (i = 0; i < $scope.dashboardTile[form.id].length; i++) {
              createMarkerFixed($scope.dashboardTile[form.id][i]);
            }
            $scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
        
              });               
               previewConnection.start()
                 .then(() => console.log('Preview connected!'))
                 .catch(console.error);
             }).catch(alert);
                 
             function getConnectionInfo() {
               return axios.post(`${apiBaseUrl}`, null )
                 .then(resp => resp.data);
             }
            connectionFlag=true;
          }


          else{
          $scope.dashboardDisplayData[form.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[form.id] = res.data;
            $scope.map = new google.maps.Map(document.getElementById('map' + form.id), mapOptions);
            for (i = 0; i < $scope.dashboardTile[form.id].length; i++) {
              createMarkerFixed($scope.dashboardTile[form.id][i]);
            }
            $scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml'); data
          });
        }
        } 
        else if (form.category == "heatMap") 
        {
          function toggleHeatmap() {
            heatmap.set(heatmap.getMap() ? null : map);
          }
          function changeGradient() {
            var gradient = [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 1)',
              'rgba(0, 191, 255, 1)',
              'rgba(0, 127, 255, 1)',
              'rgba(0, 63, 255, 1)',
              'rgba(0, 0, 255, 1)',
              'rgba(0, 0, 223, 1)',
              'rgba(0, 0, 191, 1)',
              'rgba(0, 0, 159, 1)',
              'rgba(0, 0, 127, 1)',
              'rgba(63, 0, 91, 1)',
              'rgba(127, 0, 63, 1)',
              'rgba(191, 0, 31, 1)',
              'rgba(255, 0, 0, 1)'
            ]
            heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
          }
          function changeRadius() {
            heatmap.set('radius', heatmap.get('radius') ? null : 20);
          }
          function changeOpacity() {
            heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
          }
          var heatMapOptions = {
            zoom: 2.75,
            center: new google.maps.LatLng(30, -95),
            mapTypeId: 'roadmap'
          }
          var infoWindow = new google.maps.InfoWindow();
          var createHeatMarker = function (info) {
            var heatmap = new google.maps.visualization.HeatmapLayer({
              map: $scope.heatMap,
              data: info
            });
            $scope.heatMarkers.push(heatmap);
          }
          $scope.heatMarkers = [];
          if($scope.form.livecheckbox){
            window.apiBaseUrl =$scope.SignalRrequestUrl;
            getConnectionInfo().then(info => {
               // make compatible with old and new SignalRConnectionInfo            
               info.url = info.url || info.endpoint;            
               const options = {
                 accessTokenFactory: () => info.accessToken
               };
                previewConnection = new signalR.HubConnectionBuilder()
                 .withUrl(info.url,options)
                 .configureLogging(signalR.LogLevel.Information)
                 .build();
               previewConnection.on($scope.SignalRMethodName,  function(message) {
                $scope.dashboardTile[form.id] =message;
                $scope.lastRefreshTime[form.id] = new Date();
                $scope.heatMap = new google.maps.Map(document.getElementById('heatmap' + form.id), heatMapOptions);
                $scope.heatMapValues = $scope.dashboardTile[form.id].map(function (val) {
              return { location: new google.maps.LatLng(val.latitude, val.longitude), weight: val.weight }
            });
            createHeatMarker($scope.heatMapValues);
       
              });               
               previewConnection.start()
                 .then(() => console.log(' Preview connected!'))
                 .catch(console.error);
             }).catch(alert);
                 
             function getConnectionInfo() {
               return axios.post(`${apiBaseUrl}`, null )
                 .then(resp => resp.data);
             }
            connectionFlag=true;
          }
          else{
          $scope.dashboardDisplayData[form.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[form.id] = res.data;
            $scope.lastRefreshTime[form.id] = new Date();
            $scope.heatMap = new google.maps.Map(document.getElementById('heatmap' + form.id), heatMapOptions);
            $scope.heatMapValues = $scope.dashboardTile[form.id].map(function (val) {
              return { location: new google.maps.LatLng(val.latitude, val.longitude), weight: val.weight }
            });
            createHeatMarker($scope.heatMapValues);
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
        }
        } 
        else if (form.type == "table") 
        {
          $scope.dashboardDisplayData[form.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            tableKeyArray = Object.keys(res.data[0]);
            var tempTableArray = [];
            tableKeyArray.forEach(element => {
              tempObj = {
                headerName: element,
                field: element
              }
              tempTableArray.push(tempObj);
            });
            $scope.gridOptions.api.setColumnDefs(tempTableArray);
            $scope.gridOptions.api.setRowData(res.data);
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
        } 
        else if (form.type == "calender") 
        {
          $scope.dashboardDisplayData[form.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[form.id] = res.data;
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          $scope.scheduler = { date: new Date(2018, 01, 01) };
        } 
        else if (form.type == "chart") 
        {
          if($scope.form.livecheckbox){
            window.apiBaseUrl =$scope.SignalRrequestUrl;
            connectionFlag=true;
            var DataElement=[];
            getConnectionSignalRInfo(apiBaseUrl).then(info => {
            // make compatible with old and new SignalRConnectionInfo            
              info.url = info.url || info.endpoint;            
              const options = {
                accessTokenFactory: () => info.accessToken
              };
              previewConnection = createSignalRConnection(info.url,options); 
              previewConnection.on($scope.SignalRMethodName,  function(message) {
               DataElement.push({xAxis:message.DataElements[0].dataElementValues[0].xAxis,yAxis:message.DataElements[0].dataElementValues[0].yAxis});
               elementName=message.DataElements[0].dataElementName;
               elementColor=message.DataElements[0].dataElementColor;
               var data=[];
               data.push({dataElementName:elementName,dataElementColor:elementColor,dataElementValues:DataElement});
               var finalJsonData={DataElements:data};
               $scope.$apply(function () {
               $scope.demoChart[form.id] = getJsonConfig(form);
               $scope.dashboardTile[form.id] = parseJsonStandard(finalJsonData, form);
               $scope.lastRefreshTime[form.id] = new Date();
                });
              });
              startSignalRConnection(previewConnection);
            }).catch(console.log());
          }
          else{
            $scope.dashboardDisplayData[form.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.demoChart[form.id] = getJsonConfig(form);
            $scope.dashboardTile[form.id] = parseJsonStandard(res, form);
            $scope.lastRefreshTime[form.id] = new Date();
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
        }
        } 
        else if (form.type == "number") 
        {
          if($scope.form.livecheckbox){           
            window.apiBaseUrl =$scope.SignalRrequestUrl;
            getConnectionSignalRInfo(apiBaseUrl).then(info => {
               // make compatible with old and new SignalRConnectionInfo            
               info.url = info.url || info.endpoint;            
               const options = {
                 accessTokenFactory: () => info.accessToken
               };
                previewConnection = createSignalRConnection(info.url,options);
                previewConnection.on($scope.SignalRMethodName,  function(message) {                
                $scope.dashboardTile[form.id] = message;
                $scope.lastRefreshTime[form.id]=new Date();
               });               
               startSignalRConnection(previewConnection);
              }).catch(alert);
            connectionFlag=true;
          }
          else{           
            $scope.dashboardDisplayData[form.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[form.id] = res.data;
            $scope.lastRefreshTime[form.id] = new Date();
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
        }
        }
       else if(form.category=='carousel'){
      $scope.dashboardDisplayData[form.id] = HttpRetryService.try($http.post('/dashboard/get-sharepointData',JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
          $scope.carouselItems[form.id] = res.data.values;
          $scope.lastRefreshTime[form.id] = new Date();
          $scope.slickConfig1Loaded[form.id] = true;
          $scope.slickCurrentIndex = 1;
          $scope.slickConfig[form.id] = {
              dots: false,
              autoplay: true,
              initialslide: 1,
              infinite: true,
              autoplayspeed: 1000,
              draggable:true,
              method: {}
          };
        }, function (res) {
          toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
        });
       }
      }
    }
  };
 
  $scope.addHeaderChild = function () {
    $scope.requestHeader.value += 1;
    $scope.tempObj = {};
    $scope.tempObj.val = $scope.requestHeader.value;
    $scope.requestHeader.children.push($scope.tempObj);
  };

  $scope.addBodyChild = function () {
    $scope.requestBody.value += 1;
    $scope.tempObj = {};
    $scope.tempObj.val = $scope.requestBody.value;
    $scope.requestBody.children.push($scope.tempObj);

  };

  $scope.removeHeaderChild = function (tempIndex) {
    $scope.requestHeader.children.splice(tempIndex, 1);
    $scope.newDataSource.dataSourceHeaders.splice(tempIndex + 1, 1);
  };

  $scope.removeBodyChild = function (tempIndex) {
    $scope.requestBody.children.splice(tempIndex, 1);
    $scope.newDataSource.dataSourceBody.splice(tempIndex + 1, 1);
  };

  $scope.generateRequest = function (val) {
    $scope.dataSourceData = {};
    $scope.dataSourceErrorData = {};
    if (val.dataSourceRequestType == 'rest') {
      if (val.dataSourceRestType == 'get') {
        var headersObj = {};
        if (val.dataSourceHeaders.length != 0) {
          val.dataSourceHeaders.forEach((header) => {
            headersObj[header.key] = header.value;
          });
        }
        $scope.requestObj = {
          method: val.dataSourceRestType.toUpperCase(),
          url: val.dataSourceRestURL,
          headers: headersObj
        };
        $scope.dataSourceResponse = $http($scope.requestObj).then(function (res) {
          $scope.dataSourceData = res;
        }, function error(res) {
          $scope.dataSourceErrorData = res;
        });
      } else if (val.dataSourceRestType == 'post') {
        var headersObj = {};
        var bodyObj = {};
        if (val.dataSourceHeaders.length != 0) {
          val.dataSourceHeaders.forEach((header) => {
            headersObj[header.key] = header.value;
          });
        }
        if (val.dataSourceBody.length != 0) {
          val.dataSourceBody.forEach((body) => {
            bodyObj[body.key] = body.value;
          });
        }
        $scope.requestObj = {
          method: val.dataSourceRestType.toUpperCase(),
          url: val.dataSourceRestURL,
          headers: headersObj,
          data: JSON.stringify(bodyObj)
        };
        $scope.dataSourceResponse = $http($scope.requestObj).then(function (res) {
          $scope.dataSourceData = res;
        }, function error(res) {
          $scope.dataSourceErrorData = res;
        });
      }
    }
    if (val.dataSourceRequestType == 'sharepoint') {
      console.log(val);
      $scope.requestObj = {};
      $scope.requestObj.url= val.dataSourceSharePointURL;
      $scope.requestObj.clientId= val.clientId;
      $scope.requestObj.clientSecret= val.clientSecret;
      $scope.requestObj.tableName= val.tableName;
      $scope.requestObj.sharepoint = true;
      $scope.dataSourceResponse = $http.post('/dashboard/get-sharepointData',$scope.requestObj).then(function (res) {
          $scope.dataSourceData = res;
        }, function error(res) {
          $scope.dataSourceErrorData = res;
        });
    }
    if (val.dataSourceRequestType == 'signalr') {
      window.apiBaseUrl =val.dataSourceSignalRURL;
            getConnectionInfo().then(info => {
               // make compatible with old and new SignalRConnectionInfo            
               info.url = info.url || info.endpoint;            
               const options = {
                 accessTokenFactory: () => info.accessToken
               };
              
                previewConnection = new signalR.HubConnectionBuilder()
                 .withUrl(info.url,options)
                 .configureLogging(signalR.LogLevel.Information)
                 .build();
               previewConnection.on(val.dataSourceMethodName,  function(message) {
                console.log(message);
             $scope.dataSourceData = message;       
             $scope.requestObj = {             
              url: val.dataSourceSignalRURL,
              signalrMethodName:val.dataSourceMethodName,              
              live:true,
              datasourceSignalRMessageLimit:val.datasourceSignalRMessageLimit,
            };       
               });               
               console.log('connecting...datasource');
                previewConnection.start()
                .then(() => console.log('connected!'))
                .catch(console.error);
              }).catch(alert);
                
              function getConnectionInfo() {
              return axios.post(`${apiBaseUrl}`, null )
                .then(resp => resp.data);
             }
            connectionFlag=true;
    }
  };

  $scope.saveDataSource = function (val) {
    console.log(val);
    $scope.dataSourceConfig = {};
    $scope.dataSourceConfig.tenantId = $scope.tenantId;
    $scope.dataSourceConfig.request = $scope.requestObj;
    $scope.dataSourceConfig.dataSourceName = val.dataSourceName;
    $scope.dataSourceConfig.dataSourceRefreshTime = val.dataSourceRefreshTime;
    $scope.dataSourceConfig.dataSourceRetryFrequency = val.dataSourceRetryFrequency;
    $http.post('/dashboard/create-new-datasource', $scope.dataSourceConfig).then(function (res) {
      if (res.data.status == 'success') {
        toaster.pop('success', "New Data Source Created", '<span>New Data Source Configuration Added Successfully</span>', 3000, 'trustedHtml');
        angular.element(document.querySelector("body")).removeClass("outer_add_dashboard_open");
        $scope.apiConfiguration();
      }
    }, function (res) {
      toaster.pop('Warning', "Data Source Creation Failed", '<span>New Data Source Creation Failed</span>', 3000, 'trustedHtml');
    });
    if (val.dataSourceRequestType == 'signalr') {
      if(connectionFlag==true){
        previewConnection.stop();
      }
    }
  };

  $scope.DatasourcecloseConnection=function(val){
  if (val.dataSourceRequestType == 'signalr') {
    if(connectionFlag==true){
      previewConnection.stop();
    }
  }
  }

  $scope.readOnlyMode = function () {
    $scope.gridsterOptions = {
      resizable: {
        enabled: false
      },
      draggable: {
        enabled: false
      }
    };
  };

  $scope.editWidget = function (widget) {
    $scope.editWidgetConfig = widget;
    if(widget.configuration.LiveStatus=="live")
    {
        $scope.dataSourceSelected.selected = {"DataSourceName":getSignalRDataSourceRequest(widget.configuration.dataSourceSelected)[0].DataSourceName};
    }
    else
    {
      $scope.dataSourceSelected.selected = {"DataSourceName":getDataSourceRequest(widget.configuration.dataSourceSelected)[0].DataSourceName};
    }  
    
    if (widget.type == 'table') {
      $scope.loadTableCustomization($scope.editWidgetConfig);
    }
  };

  $scope.editWidgetCustomization = function (widgetPreferences, editConfig, dashboard) {
    preferenceObj = JSON.parse(dashboard.WidgetPreferenceJson);
    preferenceObj[editConfig.id] = widgetPreferences;
    $scope.widgetPreferenceDetails = {};
    $scope.widgetPreferenceDetails.userId = $scope.userId;
    $scope.widgetPreferenceDetails.dashboardId = dashboard.DashboardId;
    $scope.widgetPreferenceDetails.widgetsId = dashboard.WidgetsId;
    $scope.widgetPreferenceDetails.widgetsPreferenceJson = JSON.stringify(preferenceObj);
    $http.post('/dashboard/widget-preference-update', $scope.widgetPreferenceDetails).then(function (res) {
      if (res.data.status == 'success') {
        $scope.editWidgetConfig = {};
        toaster.pop('success', "Chart Config Edited", '<span>Chart Configuration Modified Successfully"</span>', 3000, 'trustedHtml');
        angular.element(document.querySelector("body")).removeClass("config_widget");
      }
    }, function (res) {
      toaster.pop('Warning', "Chart Config Edit Failed", '<span>Chart Config Edit Failed</span>', 3000, 'trustedHtml');
    });
  };

  $scope.editWidgetCustomizationTable = function (tableJson, editConfig, dashboard, aliasName) {
    tempTableArray = [];
    tableJson.forEach(element => {
      tempObj = {
        field: element.key,
        headerName: aliasName[element.key]
      }
      tempTableArray.push(tempObj);
    });
    preferenceObj = JSON.parse(dashboard.WidgetPreferenceJson);
    preferenceObj[editConfig.id] = tempTableArray;
    $scope.widgetPreferenceDetails = {};
    $scope.widgetPreferenceDetails.userId = $scope.userId;
    $scope.widgetPreferenceDetails.dashboardId = dashboard.DashboardId;
    $scope.widgetPreferenceDetails.widgetsId = dashboard.WidgetsId;
    $scope.widgetPreferenceDetails.widgetsPreferenceJson = JSON.stringify(preferenceObj);
    $http.post('/dashboard/widget-preference-update', $scope.widgetPreferenceDetails).then(function (res) {
      if (res.data.status == 'success') {
        $scope.editWidgetConfig = {};
        toaster.pop('success', "Table Config Edited", '<span>Table Configuration Modified Successfully"</span>', 3000, 'trustedHtml');
        $scope.dashboardDetails.dashboardId = "";
        $scope.dashboardDetails.addWidgets = "";
        $scope.dashboardDetails.editable = "";
        $scope.refresh();
        $scope.DashboarddataLoad(editConfig);
        angular.element(document.querySelector("body")).removeClass("edit_widget");
        angular.element(document.querySelector("body")).removeClass("config_widget");
      }
    }, function (res) {
      toaster.pop('Warning', "Table Config Edit Failed", '<span>Table Config Edit Failed</span>', 3000, 'trustedHtml');
    });
  }

  $scope.editMode = function () {
    $scope.gridsterOptions = {
      resizable: {
        enabled: true,
        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
        start: function (event, $element, widget) {
        },
        resize: function (event, $element, widget) {
        },
        stop: function (event, $element, widget) {
          $scope.resizeWidget(widget);
        }
      },
      draggable: {
        enabled: true,
        handle: 'header .draggable',
        stop: function (event, $element, widget) {
          $scope.DashboarddataLoad(widget);
        }
      }
    };
  };

  $scope.fullScreenWidgetInit = function (val) {
    for (i = 0; i <= val; i++) {
      temp = "isFullscreen" + i;
      $scope[temp] = false;
    }
  };

  $scope.fullScreenWidget = function (val) {
    if ($scope.flagStatus) {
      Fullscreen.enable(document.getElementById("isFullscreen" + val));
      $scope.flagStatus = !$scope.flagStatus;
    } else {
      Fullscreen.cancel();
      $scope.flagStatus = !$scope.flagStatus;
    }
  };

  $scope.resizeWidget = function (widget) {
    var index = $scope.dashboard.widgets.findIndex((obj) => (obj.id === widget.id));
    $scope.dashboard.widgets.splice(index, 1);
    $scope.dashboard.widgets.push(widget);
    $scope.updateWithWidgetChange = true;
    $scope.multiChartConfig[widget.id] = [];
    if(widget.category!="carousel"){
      $scope.DashboarddataLoad(widget);
    }
  };

  $scope.editDashboard = function () {
    $scope.edit = !$scope.edit;
    if (!$scope.edit) {
      $scope.editMode();
    } else {
      $scope.readOnlyMode();
    }
  };

  $scope.cancelEdit = function (dashboard) {
    $scope.editDashboard();
    $scope.editWidgetConfig = {};
    $scope.dashboardDetails.dashboardId = dashboard;
    $scope.dashboardDetails.addWidgets = "";
    $scope.dashboardDetails.editable = "";
    $scope.refresh();
    angular.element(document.querySelector(".scroll_widget_main")).removeClass("open");
  };

  $scope.cancelEditConfiguration = function (dashboard) {
    $scope.dashboardDetails.dashboardId = dashboard;
    $scope.dashboardDetails.addWidgets = "";
    $scope.dashboardDetails.editable = "";
    $scope.refresh();
  };

  function getWidget(id) {
    $http.get('/dashboard/dashboard-widget-list/' + id).then(function (res) {
      if (res.data.status = "success") {
        $scope.dashboardWidget = res.data.widgets;
        $scope.dashboard.widgetsId = $scope.dashboardWidget.WidgetsId;
        $scope.dashboard.id = $scope.dashboardWidget.DashboardId;
        $scope.dashboard.widgets = JSON.parse($scope.dashboardWidget.DashboardWidgetsJson);
        $scope.tempTableArr = [];
        if ($scope.dashboardDetails.addWidgets && $scope.dashboardDetails.editable) {
          $scope.addWidget();
        }
      }
    });
  };

  $scope.DashboarddataLoad = function (tempObj) {
    $scope.widgetPreference = JSON.parse($scope.selectedDashboard.WidgetPreferenceJson);
    if (tempObj) {
      if (tempObj.configuration.dataSourceSelected) {
        $scope.requestUrl = [];       
        if (tempObj.category == "markerMap") {
          var mapOptions = {
            zoom: 2.75,
            center: new google.maps.LatLng(30, -95),
          }
          var infoWindow = new google.maps.InfoWindow();
          var createMarkerFixed = function (info) {
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: new google.maps.LatLng(info.latitude, info.longitude),
              title: "device location"
            });
            marker.content = '<div class="infoWindowContent">Device Id:' + info.deviceId + '</div>';
            google.maps.event.addListener(marker, 'click', function () {
              infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
              infoWindow.open($scope.map, marker);
            });
            $scope.markers.push(marker);
          }
          $scope.markers = [];
          if(tempObj.configuration.LiveStatus=="live"){
            $scope.requestUrl=getSignalRDataSourceRequest(tempObj.configuration.dataSourceSelected);
            $scope.SignalRrequestUrl=JSON.parse($scope.requestUrl[0].APIConfigJson).url;
            $scope.SignalRMethodName=JSON.parse($scope.requestUrl[0].APIConfigJson).signalrMethodName;
           console.log();
            window.apiBaseUrl =$scope.SignalRrequestUrl;
            getConnectionInfo().then(info => {
               // make compatible with old and new SignalRConnectionInfo            
               info.url = info.url || info.endpoint;            
               const options = {
                 accessTokenFactory: () => info.accessToken
               };
               
               $scope.connection[tempObj.id] = new signalR.HubConnectionBuilder()
                 .withUrl(info.url,options)
                 .configureLogging(signalR.LogLevel.Information)
                 .build();
               $scope.connection[tempObj.id].on($scope.SignalRMethodName,function (message) {
               $scope.dashboardTile[tempObj.id] = message;
               $scope.lastRefreshTime[tempObj.id] = new Date();
               $scope.map = new google.maps.Map(document.getElementById('map' + tempObj.id), mapOptions);
               for (i = 0; i < $scope.dashboardTile[tempObj.id].length; i++) {
                 createMarkerFixed($scope.dashboardTile[tempObj.id][i]);
               }
               $scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
            
            
             });        
             $scope.connection[tempObj.id].start()
             .then(() => console.log('connected!'))
             .catch(console.error);
             }).catch(alert);
             function getConnectionInfo() {
               return axios.post(`${apiBaseUrl}`, null )
                 .then(resp => resp.data);
             }
          

          }
          else{
          $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
          $scope.dashboardDisplayData[tempObj.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[tempObj.id] = res.data;
            $scope.lastRefreshTime[tempObj.id] = new Date();
            $scope.map = new google.maps.Map(document.getElementById('map' + tempObj.id), mapOptions);
            for (i = 0; i < $scope.dashboardTile[tempObj.id].length; i++) {
              createMarkerFixed($scope.dashboardTile[tempObj.id][i]);
            }
            $scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          if (tempObj.configuration.updateFrequency) {
            if ($scope.requestUrlObj[tempObj.id]) {
              $interval.cancel($scope.requestUrlObj[tempObj.id]);
            }
            $scope.requestUrlObj[tempObj.id] = $interval(function () {
              HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
                $scope.lastRefreshTime[tempObj.id] = new Date();
                $scope.dashboardTile[tempObj.id] = res.data;
                $scope.lastRefreshTime[tempObj.id] = new Date();
                if ($scope.markerCluster) {
                  $scope.markerCluster.clearMarkers();
                }
                $scope.map = new google.maps.Map(document.getElementById('map' + tempObj.id), mapOptions);
                for (i = 0; i < $scope.dashboardTile[tempObj.id].length; i++) {
                  createMarkerFixed($scope.dashboardTile[tempObj.id][i]);
                }
                $scope.markerCluster = new MarkerClusterer($scope.map, $scope.markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
              }, function (res) {
                toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
              });
            }, tempObj.configuration.updateFrequency * 1000);
          }
        }
        } else if (tempObj.category == "heatMap") {
          function toggleHeatmap() {
            heatmap.set(heatmap.getMap() ? null : map);
          }
          function changeGradient() {
            var gradient = [
              'rgba(0, 255, 255, 0)',
              'rgba(0, 255, 255, 1)',
              'rgba(0, 191, 255, 1)',
              'rgba(0, 127, 255, 1)',
              'rgba(0, 63, 255, 1)',
              'rgba(0, 0, 255, 1)',
              'rgba(0, 0, 223, 1)',
              'rgba(0, 0, 191, 1)',
              'rgba(0, 0, 159, 1)',
              'rgba(0, 0, 127, 1)',
              'rgba(63, 0, 91, 1)',
              'rgba(127, 0, 63, 1)',
              'rgba(191, 0, 31, 1)',
              'rgba(255, 0, 0, 1)'
            ]
            heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
          }
          function changeRadius() {
            heatmap.set('radius', heatmap.get('radius') ? null : 20);
          }
          function changeOpacity() {
            heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
          }
          var heatMapOptions = {
            zoom: 2.75,
            center: new google.maps.LatLng(30, -95),
            mapTypeId: 'roadmap'
          }
          var infoWindow = new google.maps.InfoWindow();
          var createHeatMarker = function (info) {
            var heatmap = new google.maps.visualization.HeatmapLayer({
              map: $scope.heatMap,
              data: info
            });
            $scope.heatMarkers.push(heatmap);
          }
          $scope.heatMarkers = [];

          if(tempObj.configuration.LiveStatus=="live"){
        $scope.requestUrl=getSignalRDataSourceRequest(tempObj.configuration.dataSourceSelected);
        $scope.SignalRrequestUrl=JSON.parse($scope.requestUrl[0].APIConfigJson).url;
        $scope.SignalRMethodName=JSON.parse($scope.requestUrl[0].APIConfigJson).signalrMethodName;
           
          window.apiBaseUrl =$scope.SignalRrequestUrl;
            getConnectionInfo().then(info => {
               // make compatible with old and new SignalRConnectionInfo            
               info.url = info.url || info.endpoint;            
               const options = {
                 accessTokenFactory: () => info.accessToken
               };
               $scope.connection[tempObj.id] = new signalR.HubConnectionBuilder()
                 .withUrl(info.url,options)
                 .configureLogging(signalR.LogLevel.Information)
                 .build();
                 $scope.connection[tempObj.id].on($scope.SignalRMethodName,function (message) {
               $scope.dashboardTile[tempObj.id] =message;
               $scope.lastRefreshTime[tempObj.id] = new Date();
               $scope.heatMap = new google.maps.Map(document.getElementById('heatmap' + tempObj.id), heatMapOptions);
               $scope.heatMapValues = $scope.dashboardTile[tempObj.id].map(function (val) {
                 return { location: new google.maps.LatLng(val.latitude, val.longitude), weight: val.weight }
               });
               createHeatMarker($scope.heatMapValues);
         
              });        
              $scope.connection[tempObj.id].start()
              .then(() => console.log('connected!'))
              .catch(console.error);
              }).catch(alert);
              function getConnectionInfo() {
                return axios.post(`${apiBaseUrl}`, null )
                  .then(resp => resp.data);
              }

 
           }
            else{
          $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
          $scope.dashboardDisplayData[tempObj.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[tempObj.id] = res.data;
            $scope.lastRefreshTime[tempObj.id] = new Date();
            $scope.heatMap = new google.maps.Map(document.getElementById('heatmap' + tempObj.id), heatMapOptions);
            $scope.heatMapValues = $scope.dashboardTile[tempObj.id].map(function (val) {
              return { location: new google.maps.LatLng(val.latitude, val.longitude), weight: val.weight }
            });
            createHeatMarker($scope.heatMapValues);
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          if (tempObj.configuration.updateFrequency) {
            if ($scope.requestUrlObj[tempObj.id]) {
              $interval.cancel($scope.requestUrlObj[tempObj.id]);
            }
            $scope.requestUrlObj[tempObj.id] = $interval(function () {
              HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
                $scope.dashboardTile[tempObj.id] = res.data;
                $scope.lastRefreshTime[tempObj.id] = new Date();
                $scope.heatMap = new google.maps.Map(document.getElementById('heatmap' + tempObj.id), heatMapOptions);
                $scope.heatMapValues = $scope.dashboardTile[tempObj.id].map(function (val) {
                  return { location: new google.maps.LatLng(val.latitude, val.longitude), weight: val.weight }
                });
                createHeatMarker($scope.heatMapValues);
              }, function (res) {
                toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
              });
            }, tempObj.configuration.updateFrequency * 1000);
          }
        }
        } else if (tempObj.type == "table") {
          $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
          $scope.dashboardDisplayData[tempObj.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[tempObj.id] = res.data;
            tableKeyArray = Object.keys(res.data[0]);
            if ($scope.widgetPreference[tempObj.id]) {
              var tempTableArray = $scope.widgetPreference[tempObj.id];
            } else {
              var tempTableArray = [];
              tableKeyArray.forEach(element => {
                tempTableObj = {
                  headerName: element,
                  field: element
                }
                tempTableArray.push(tempTableObj);
              });
            }
            $scope.tableWidgetArr[tempObj.id] = $scope.gridOptions;
            $scope.tableWidgetArr[tempObj.id].columnDefs = tempTableArray;
            $scope.tableWidgetArr[tempObj.id].onGridReady = function (params) {
              params.api.setRowData($scope.dashboardTile[tempObj.id]);
            };
            var strTemp = "#myGrid" + tempObj.id;
            var eGridDiv = angular.element($(strTemp))
            if (!$scope.tempTableArr.includes(tempObj.id)) {
              $scope.tempTableArr.push(tempObj.id);
              new agGrid.Grid(eGridDiv[0], $scope.tableWidgetArr[tempObj.id]);
            } else {
              $scope.tableWidgetArr[tempObj.id].api.setRowData($scope.dashboardTile[tempObj.id]);
            }
            $scope.lastRefreshTime[tempObj.id] = new Date();
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          if (tempObj.configuration.updateFrequency) {
            if ($scope.requestUrlObj[tempObj.id]) {
              $interval.cancel($scope.requestUrlObj[tempObj.id]);
            }
            $scope.requestUrlObj[tempObj.id] = $interval(function () {
              $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
              HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
                $scope.tableWidgetArr[tempObj.id].api.setRowData($scope.dashboardTile[tempObj.id]);

                $scope.lastRefreshTime[tempObj.id] = new Date();
              }, function (res) {
                toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
              });
            }, tempObj.configuration.updateFrequency * 1000);
          }

        } else if (tempObj.type == "calender") {
          $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
          $scope.dashboardDisplayData[tempObj.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[tempObj.id] = res.data;
            $scope.lastRefreshTime[tempObj.id] = new Date();
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          if (tempObj.configuration.updateFrequency) {
            if ($scope.requestUrlObj[tempObj.id]) {
              $interval.cancel($scope.requestUrlObj[tempObj.id]);
            }
            $scope.requestUrlObj[tempObj.id] = $interval(function () {
              $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
              HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
                $scope.dashboardTile[tempObj.id] = res.data;
                $scope.lastRefreshTime[tempObj.id] = new Date();
              }, function (res) {
                toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
              });
            }, tempObj.configuration.updateFrequency * 1000);
          }
        } else if (tempObj.type == "chart") {  
          if(tempObj.configuration.LiveStatus=="live"){
            $scope.requestUrl=getSignalRDataSourceRequest(tempObj.configuration.dataSourceSelected);
            window.apiBaseUrl=JSON.parse($scope.requestUrl[0].APIConfigJson).url;
            $scope.SignalRMethodName=JSON.parse($scope.requestUrl[0].APIConfigJson).signalrMethodName;
            var DataElement=[];   
          if(!(checkWidgetLoad[tempObj.id])){
            getConnectionSignalRInfo(apiBaseUrl).then(info => {
              // make compatible with old and new SignalRConnectionInfo            
              info.url = info.url || info.endpoint;            
              const options = {
                accessTokenFactory: () => info.accessToken
              };
               connection[tempObj.id] = createSignalRConnection(info.url,options);   
               connected.push(connection[tempObj.id]);    
               startSignalRConnection(connection[tempObj.id]);
               checkWidgetLoad[tempObj.id]=true;   
               connection[tempObj.id].on($scope.SignalRMethodName,  function(message) {
               if(tempObj.configuration.SignalRMessageLimit==DataElement.length){
                DataElement.shift();  
                DataElement.push({xAxis:message.DataElements[0].dataElementValues[0].xAxis,yAxis:message.DataElements[0].dataElementValues[0].yAxis});
               }
               else{
               DataElement.push({xAxis:message.DataElements[0].dataElementValues[0].xAxis,yAxis:message.DataElements[0].dataElementValues[0].yAxis});
               }
               elementName=message.DataElements[0].dataElementName;
               elementColor=message.DataElements[0].dataElementColor;               
               var data=[];
               data.push({dataElementName:elementName,dataElementColor:elementColor,dataElementValues:DataElement});
               var finalJsonData={DataElements:data};
               
               $scope.$apply(function () {
               $scope.demoChart[tempObj.id] = getJsonConfig(tempObj);
               $scope.dashboardTile[tempObj.id] = parseJsonStandard(finalJsonData, tempObj);
               $scope.lastRefreshTime[tempObj.id] = new Date(); 
              });
            if ($scope.widgetPreference[tempObj.id]) {
                  widgetPreferenceObj = getJsonConfig(tempObj);
                  for (key in widgetPreferenceObj.chart) {
                    if(key == "xAxis" || key == "yAxis" || key == "x2Axis" || key == "y1Axis" || key == "y2Axis"){
                      $scope.widgetPreference[tempObj.id][key].tickFormat = widgetPreferenceObj.chart[key].tickFormat;
                    }
                    else{
                      $scope.widgetPreference[tempObj.id][key] = widgetPreferenceObj.chart[key];
                    }
                  }
                  $scope.multiChartConfig[tempObj.id] = {chart:$scope.widgetPreference[tempObj.id]};
                } 
                else {
                  $scope.multiChartConfig[tempObj.id] = getJsonConfig(tempObj);
                }          
              }); 
            }).catch(console.log());
          }      
          }
          else{
          $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
          $scope.dashboardDisplayData[tempObj.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[tempObj.id] = parseJsonStandard(res, tempObj);
            if ($scope.widgetPreference[tempObj.id]) {
              widgetPreferenceObj = getJsonConfig(tempObj);
              for (key in widgetPreferenceObj.chart) {
                if(key == "xAxis" || key == "yAxis" || key == "x2Axis" || key == "y1Axis" || key == "y2Axis"){
                  $scope.widgetPreference[tempObj.id][key].tickFormat = widgetPreferenceObj.chart[key].tickFormat;
                }else{
                  $scope.widgetPreference[tempObj.id][key] = widgetPreferenceObj.chart[key];
                }
              }
              $scope.multiChartConfig[tempObj.id] = {chart:$scope.widgetPreference[tempObj.id]};
            } else {
              $scope.multiChartConfig[tempObj.id] = getJsonConfig(tempObj);
            }
            $scope.lastRefreshTime[tempObj.id] = new Date();
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          if (tempObj.configuration.updateFrequency) {
            if ($scope.requestUrlObj[tempObj.id]) {
              $interval.cancel($scope.requestUrlObj[tempObj.id]);
            }
            $scope.requestUrlObj[tempObj.id] = $interval(function () {
              $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
              HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
                $scope.dashboardTile[tempObj.id] = parseJsonStandard(res, tempObj);
                $scope.lastRefreshTime[tempObj.id] = new Date();
              }, function (res) {
                toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
              });
            }, tempObj.configuration.updateFrequency * 1000);
          } 
        }     
        } else if (tempObj.type == "number") {  
            if(tempObj.configuration.LiveStatus=="live"){
              console.log("entered");
              $scope.requestUrl=getSignalRDataSourceRequest(tempObj.configuration.dataSourceSelected);
              $scope.SignalRrequestUrl=JSON.parse($scope.requestUrl[0].APIConfigJson).url;
              $scope.SignalRMethodName=JSON.parse($scope.requestUrl[0].APIConfigJson).signalrMethodName;
              window.apiBaseUrl =$scope.SignalRrequestUrl;
              console.log($scope.SignalRrequestUrl);
              console.log($scope.SignalRMethodName);
              getConnectionInfo().then(info => {
                 // make compatible with old and new SignalRConnectionInfo            
                 info.url = info.url || info.endpoint;            
                 const options = {
                   accessTokenFactory: () => info.accessToken
                 };
                 console.log(info)
                 connection[tempObj.id] = new signalR.HubConnectionBuilder()
                   .withUrl(info.url,options)
                   .configureLogging(signalR.LogLevel.Information)
                   .build();
                   console.log(connection[tempObj.id]);
                   connection[tempObj.id].on($scope.SignalRMethodName,function (message) {
                     console.log(message);
                     $scope.$apply(function () {
                     $scope.dashboardTile[tempObj.id] = message;
                     $scope.lastRefreshTime[tempObj.id]=new Date();
                      });
                    });        
                    connection[tempObj.id].start()
                }).catch(alert);
                function getConnectionInfo() {
                  return axios.post(`${apiBaseUrl}`, null )
                    .then(resp => resp.data);
                }
          }
          else{          
          $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
          $scope.dashboardDisplayData[tempObj.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
            $scope.dashboardTile[tempObj.id] = res.data;
            $scope.lastRefreshTime[tempObj.id] = new Date();
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          if (tempObj.configuration.updateFrequency) {
            $interval(function () {
              $scope.requestUrl = getDataSourceRequest(tempObj.configuration.dataSourceSelected);
              HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
                $scope.dashboardTile[tempObj.id] = res.data;
                $scope.lastRefreshTime[tempObj.id] = new Date();
              }, function (res) {
                toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
              });
            }, tempObj.configuration.updateFrequency * 1000);
          }
        }
      
        }else if(tempObj.category=='carousel'){          
           $scope.requestUrl = getSharePointDataSourceRequest(tempObj.configuration.dataSourceSelected);
           $scope.dashboardDisplayData[tempObj.id] = HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
           $scope.carouselItems[tempObj.id] = res.data.values;
           $scope.slickConfig1Loaded[tempObj.id] = true;
           $scope.slickCurrentIndex = 1;
           $scope.slickConfig[tempObj.id] = {
              dots: false,
              autoplay: true,
              initialslide: 1,
              infinite: true,
              autoplayspeed: 1000,
              centerMode: true,
              adaptiveHeight: true,
              method: {}
          };
         
            $scope.lastRefreshTime[tempObj.id] = new Date();
          }, function (res) {
            toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
          });
          if (tempObj.configuration.updateFrequency) {
            $interval(function () {
              $scope.requestUrl = getSharePointDataSourceRequest(tempObj.configuration.dataSourceSelected);
              HttpRetryService.try($http(JSON.parse($scope.requestUrl[0].APIConfigJson)), $scope.requestUrl[0].RetryFrequency).then(function (res) {
                $scope.carouselItems[tempObj.id]= res.data.values;
                $scope.lastRefreshTime[tempObj.id] = new Date();
              }, function (res) {
                toaster.pop('Warning', "API Failed", '<span>API Failed even after retrying</span>', 3000, 'trustedHtml');
              });
            }, tempObj.configuration.updateFrequency * 1000);
          }       
      }
    }
  };
  }

  function parseJsonStandard(res, tempObj) {
    if(tempObj.livecheckbox){     
      resArr = res.DataElements;
      }
      else{
      resArr = res.data.DataElements;
      }
    $scope.widgetChartStatusFlag = false;
    if (tempObj.category == 'pie' || tempObj.category == 'donut' || tempObj.category == 'halfDonut') {
      resTempArr = [];
      resTempObj = {};
      try {
        resArr.forEach((obj) => {
          if (obj.hasOwnProperty('label') && obj.hasOwnProperty('value')) {
            resTempObj.x = obj.label;
            resTempObj.y = obj.value;
            resTempArr.push(resTempObj);
            resTempObj = {};
          }
        });
      } catch (err) {
        
      }
    } else if (tempObj.category == 'line' || tempObj.category == 'multiBar' || tempObj.category == 'linefocus' || tempObj.category == 'lineBar') {
      resTempArr = [];
      resTempObj = {};
      try {
        resArr.forEach((obj) => {
          tempValuesobj = {};
          tempValuesArr = [];
          obj.dataElementValues.forEach((temp) => {
            if (temp.hasOwnProperty('xAxis') && temp.hasOwnProperty('yAxis')) {
              tempValuesobj.x = temp.xAxis;
              tempValuesobj.y = temp.yAxis;
              tempValuesArr.push(tempValuesobj);
              tempValuesobj = {};
            }
          });
          resTempObj.values = tempValuesArr;
          resTempObj.key = obj.dataElementName;
          if (obj.bar) {
            resTempObj.bar = true;
          }
          if (obj.dataElementColor) {
            resTempObj.color = obj.dataElementColor;
          }
          resTempArr.push(resTempObj);
          resTempObj = {};
        });
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'stackedArea' || tempObj.category == 'cumulativeLine' || tempObj.category == 'historicalBar') {
      resTempArr = [];
      resTempObj = {};
      try {
        resArr.forEach((obj) => {
          tempValuesArr = [];
          resTempObj.values = [];
          resTempObj.key = obj.dataElementName;
          obj.dataElementValues.forEach((temp) => {
            values = [];
            if (temp.hasOwnProperty('xAxis') && temp.hasOwnProperty('yAxis')) {
              values.push(temp.xAxis);
              values.push(temp.yAxis);
              tempValuesArr.push(values);
              values = [];
            }
          });
          if (obj.bar) {
            resTempObj.bar = true;
          }
          if (obj.dataElementColor) {
            resTempObj.color = obj.dataElementColor;
          }
          resTempObj.values = tempValuesArr;
          resTempArr.push(resTempObj);
          resTempObj = {};
        });
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'boxPlot') {
      resTempArr = [];
      resTempObj = {};
      try {
        resArr.forEach((obj) => {
          if (obj.hasOwnProperty('dataElementName') && obj.hasOwnProperty('dataElementValues')) {
            resTempObj.label = obj.dataElementName;
            resTempObj.values = obj.dataElementValues;
            resTempArr.push(resTempObj);
            resTempObj = {};
          }
        });
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'multiBarHorizontal' || tempObj.category == 'discreteBar') {
        resTempArr = [];
        dataElementValues = [];
        resTempObj = {};
      try {
        resArr.forEach((obj) => {
          tempValuesobj = {};
          tempValuesArr = [];
          resTempObj.key = obj.dataElementName;
          obj.dataElementValues.forEach((temp) => {
            if (temp.hasOwnProperty('xAxis') && temp.hasOwnProperty('yAxis')) {
              tempValuesobj.label = temp.xAxis;
              tempValuesobj.value = temp.yAxis;
              tempValuesArr.push(tempValuesobj);
              tempValuesobj = {};
            }
          })
          resTempObj.values = tempValuesArr;
          resTempObj.color = obj.dataElementColor;
          resTempArr.push(resTempObj);
          resTempObj = {};
        });
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'scatter') {
      resTempArr = [];
      resTempObj = {};
      try {
        resArr.forEach((obj) => {
          tempValuesobj = {};
          tempValuesArr = [];
          obj.dataElementValues.forEach((temp) => {
            if (temp.hasOwnProperty('xAxis') && temp.hasOwnProperty('yAxis') && temp.hasOwnProperty('size') && temp.hasOwnProperty('shape')) {
              tempValuesobj.x = temp.xAxis;
              tempValuesobj.y = temp.yAxis;
              tempValuesobj.size = temp.size;
              tempValuesobj.shape = temp.shape;
              tempValuesArr.push(tempValuesobj);
              tempValuesobj = {};
            }
          })
          resTempObj.values = tempValuesArr;
          resTempObj.key = obj.dataElementName;
          resTempArr.push(resTempObj);
          resTempObj = {};
        });
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'scatterLine') {
      resTempArr = [];
      resTempObj = {};
      try {
        resArr.forEach((obj) => {
          tempValuesobj = {};
          tempValuesArr = [];
          obj.dataElementValues.forEach((temp) => {
            if (temp.hasOwnProperty('xAxis') && temp.hasOwnProperty('yAxis')) {
              tempValuesobj.x = temp.xAxis;
              tempValuesobj.y = temp.yAxis;
              if (temp.size || temp.shape) {
                tempValuesobj.size = temp.size;
                tempValuesobj.shape = temp.shape;
              }
              tempValuesArr.push(tempValuesobj);
              tempValuesobj = {};
            }
          });
          resTempObj.values = tempValuesArr;
          resTempObj.key = obj.dataElementName;
          resTempObj.slope = obj.slope;
          resTempObj.intercept = obj.intercept;
          resTempArr.push(resTempObj);
          resTempObj = {};
        });
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'bullet') {
      try {
        if(tempObj.livecheckbox){     
          if (res.DataElements.hasOwnProperty('title') && res.DataElements.hasOwnProperty('ranges')) {
            resTempArr = res.DataElements;
           }
          }
          else{
          if (res.data.DataElements.hasOwnProperty('title') && res.data.DataElements.hasOwnProperty('ranges')) {
            resTempArr = res.data.DataElements;
            }
          }
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'candlestick' || tempObj.category == 'ohlc') {
      try {
        resArr.forEach((obj) => {
          resTempArr = [];
          resTempObj = {};
          if (obj.hasOwnProperty('dataElementValues')) {
            resTempObj.values = obj.dataElementValues;
            resTempArr.push(resTempObj);
          }
        });
      } catch (err) {
        console.log(err, "err");
      }
    } else if (tempObj.category == 'sparkline') {
      resTempArr = [];
      resTempObj = {};
      try {
        resArr.forEach((obj) => {
          tempValuesobj = {};
          obj.dataElementValues.forEach((temp) => {
            if (temp.hasOwnProperty('xAxis') && temp.hasOwnProperty('yAxis')) {
              tempValuesobj.x = temp.xAxis;
              tempValuesobj.y = temp.yAxis;
              resTempArr.push(tempValuesobj);
              tempValuesobj = {};
            }
          })
          resTempObj = {};
        });
      } catch (err) {
        console.log(err, "err");
      }
    }
    if (resTempArr.length == 0) {
      $scope.widgetChartStatusFlag = true;
    }
    return resTempArr;
  }

  function getJsonConfig(tempObj) {
    switch (tempObj.category) {
      case 'pie':
        resWidgetConfig = $scope.pieChart;
        break;
      case 'donut':
        resWidgetConfig = $scope.donutChart;
        break;
      case 'halfDonut':
        resWidgetConfig = $scope.halfDonutChart;
        break;
      case 'line':
        resWidgetConfig = $scope.lineChart;
        break;
      case 'stackedArea':
        resWidgetConfig = $scope.stackedAreaChart;
        break;
      case 'discreteBar':
        resWidgetConfig = $scope.discreteBarChart;
        break;
      case 'cumulativeLine':
        resWidgetConfig = $scope.cumulativeLineChart;
        break;
      case 'boxPlot':
        resWidgetConfig = $scope.boxPlotChart;
        break;
      case 'multiBar':
        resWidgetConfig = $scope.multiBarChart;
        break;
      case 'historicalBar':
        resWidgetConfig = $scope.historicalBarChart;
        break;
      case 'multiBarHorizontal':
        resWidgetConfig = $scope.multiBarHorizontalChart;
        break;
      case 'scatter':
        resWidgetConfig = $scope.scatterChart;
        break;
      case 'lineBar':
        resWidgetConfig = $scope.linePlusBarChart;
        break;
      case 'scatterLine':
        resWidgetConfig = $scope.scatterLineChart;
        break;
      case 'linefocus':
        resWidgetConfig = $scope.lineWithFocusChart;
        break;
      case 'bullet':
        resWidgetConfig = $scope.bulletChart;
        break;
      case 'candlestick':
        resWidgetConfig = $scope.candlestickBarChart;
        break;
      case 'ohlc':
        resWidgetConfig = $scope.ohlcBarChart;
        break;
      case 'sparkline':
        resWidgetConfig = $scope.sparklinePlus;
        break;
      default:
        console.log("not found");
    }
    return resWidgetConfig;
  }

  $scope.dataLoadTODashboard = function (widgetList) {
    if (widgetList) {
      for (widget in widgetList) {
        $scope.DashboarddataLoad(widgetList[widget]);
      }
    }
  };

  $scope.fileUpload = function (picture) {
    Upload.upload({
      url: '/dashboard/upload-dashboard-image',
      data: {
        dashboardPic: picture
      }
    }).then(function (resp) {
      toaster.pop('success', "Image Uploaded", '<span>Image Uploaded Successfully"</span>', 3000, 'trustedHtml');
      $scope.uploadedPicture = resp.data;
      $scope.form.configuration.dataSourceSelected = {};
      $scope.form.configuration.dataSourceSelected.url = $scope.uploadedPicture;
    });
  };

  $scope.clear = function () {
    $scope.dashboard.widgets = [];
  };

  $scope.addWidget = function () {
    $scope.selection = $scope.steps[0];
    $scope.stepValidity = false;
    $scope.add_widget_form.$setPristine();
    for (i = 0; i <= 16; i++) {
      angular.element(document.querySelector(".tcs-selected")).removeClass("tcs-selected");
    }
    var timestamp = (Number(new Date().getTime()) / 10000000).toString().split(".")[1];
    var id = timestamp + $scope.dashboard.widgets.length;
    $scope.dashboard.widgets.push({
      id: id,
      name: "",
      type: 'default',
      description: '',
      category: '',
      configuration: {}
    });
    var index = $scope.dashboard.widgets.findIndex((obj) => (obj.id === id));
    $scope.openSettings($scope.dashboard.widgets[index], index);
    $scope.dashboard.widgets.splice(index, 1);
  };

  $scope.openSettings = function (widget) {
    $scope.form = {
      id: widget.id,
      name: widget.name,
      description: widget.description,
      sizeX: widget.sizeX,
      sizeY: widget.sizeY,
      col: widget.col,
      row: widget.row,
      type: widget.type,
      category: widget.category,
      configuration: {}
    };
  };

  $scope.cancelWidget = function (widget) {
    $scope.closePreviewConnection();
  }

  $scope.remove = function (widget) {
    $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
    if(checkWidgetLoad[widget.id]){
      connection[widget.id].stop();
    }
    toaster.pop('warning', "Widget Removed", '<span>Widget was Removed Successfuly</span>', 3000, 'trustedHtml');
  };

  $scope.saveDashboardWidgets = function (dashboard, flag) {
    $scope.dashboardWidgetSave = {};
    $scope.dashboardWidgetSave.dashboardId = dashboard.DashboardId;
    $scope.dashboardWidgetSave.userId = $scope.userId;
    $scope.dashboardWidgetSave.dashboardWidgetId = $scope.dashboard.widgetsId;
    $scope.dashboardWidgetSave.dashboardWidgets = $scope.dashboard.widgets;
    $http.post('/dashboard/save-dashboard', $scope.dashboardWidgetSave).then(function (res) {
      if (res.data.status == 'success') {
        if (flag) {
          $scope.edit = !$scope.edit;
          angular.element(document.querySelector(".scroll_widget_main")).removeClass("open");
        }
        $scope.dashboardDetails.dashboardId = dashboard.DashboardId;
        $scope.dashboardDetails.addWidgets = "";
        $scope.dashboardDetails.editable = "";
        toaster.pop('success', "Dashboard Saved", '<span>Dashboard Saved Successfully</span>', 3000, 'trustedHtml');
        //For Carousel Widget 
        //$scope.refresh();
       }
    }, function (res) {
      toaster.pop('error', "Dashboard Save Failed", '<span>Dashboard Save Failed</span>', 3000, 'trustedHtml');
    });
  };

  $scope.updateDashboardCancel = function () {

  };

  $scope.updateDashboard = function (dashboard, updatedName) {
    if (updatedName) {
      $scope.updateDashboardDetails = {};
      $scope.updateDashboardDetails.DashboardName = updatedName;
      $scope.updateDashboardDetails.DashboardID = dashboard.DashboardId;
      $scope.updateDashboardDetails.UserId = $scope.userId;
      $http.post('/dashboard/update-dashboard', $scope.updateDashboardDetails).then(function (res) {
        if (res.data.status == 'success') {
          toaster.pop('success', "Dashboard Details Saved", '<span>New Dashboard Name Updated</span>', 3000, 'trustedHtml');
          $scope.getDashboards();
          $scope.dashboardDetails.dashboardId = dashboard.DashboardId;
          $scope.dashboardDetails.addWidgets = "";
          $scope.dashboardDetails.editable = "";
          $scope.refresh();
        }
      }, function (res) {
        toaster.pop('error', "Dashboard Details Save Failed", '<span>New Dashboard Name Update Failed</span>', 3000, 'trustedHtml');
      });
    }
  };

  $scope.deleteConfirmation = function (id) {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this Dashboard!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          $http.delete('/dashboard/delete-dashboard/' + $scope.userId + "/" + id).then(function (res) {
            if (res.data.status == 'success') {
              $scope.dashboardDetails.dashboardId = "";
              $scope.dashboardDetails.addWidgets = "";
              $scope.dashboardDetails.editable = "";
              swal("Selected Dashboard has been deleted!", {
                icon: "success",
              });
              $scope.refresh();
            }
          });
        } else {
          swal("Delete operation cancelled!");
        }
      });
  };

  $scope.closeConnection=function(index){
  connected[index].stop()
  }

  $scope.submitConfiguration = function () {
    $scope.dashboardSave = {};
    if ($scope.selectedCellSize) {
      var tempWidgetSize = $scope.selectedCellSize.split("x");
      $scope.form.sizeX = parseInt(tempWidgetSize[1]);
      $scope.form.sizeY = parseInt(tempWidgetSize[0]);
    }
    if($scope.form.livecheckbox){
      $scope.form.configuration.LiveStatus="live";
    }
    else{
      $scope.form.configuration.LiveStatus="Not live";
    }
    $scope.dashboard.widgets.push($scope.form);
    $scope.dashboardSave.dashboardId = $scope.dashboard.id;
    $scope.dashboardSave.userId = $scope.userId;
    $scope.dashboardSave.dashboardWidgets = $scope.dashboard.widgets;
    $scope.dashboardSave.dashboardWidgetId = $scope.dashboard.widgetsId;
    $http.post('/dashboard/save-dashboard', $scope.dashboardSave).then(function (res) {
      if (res.data.status == 'success') {
        toaster.pop('success', "Widget Saved", '<span>Widget Was Added To Dashboard Successfully</span>', 3000, 'trustedHtml');
        angular.element(document.querySelector("body")).removeClass("addwidget_open");
          
        //check if its start
        if(connectionFlag){
          previewConnection.stop()
        }
        checkWidgetLoad[$scope.form.id]=true;
       if($scope.form.category!="carousel"){   
          $scope.DashboarddataLoad($scope.form);
       }
      }
    }, function (res) {
      toaster.pop('Warning', "Dashboard Save Failed", '<span>Dashboard Save Failed</span>', 3000, 'trustedHtml');
    });
  };

  $scope.editConfiguration = function (editWidgetConfig) {
    $scope.editDashboardSave = {};
    var index = $scope.dashboard.widgets.findIndex((obj) => (obj.id === editWidgetConfig.id));
    $scope.dashboard.widgets.splice(index, 1);
    $scope.dashboard.widgets.push(editWidgetConfig);
    $scope.editDashboardSave.dashboardId = $scope.dashboard.id;
    $scope.editDashboardSave.userId = $scope.userId;
    $scope.editDashboardSave.dashboardWidgets = $scope.dashboard.widgets;
    $scope.editDashboardSave.dashboardWidgetId = $scope.dashboard.widgetsId;
    $http.post('/dashboard/save-dashboard', $scope.editDashboardSave).then(function (res) {
      if (res.data.status == 'success') {
        $scope.editWidgetConfig = {};
        if(checkWidgetLoad[editWidgetConfig.id]){
          connection[editWidgetConfig.id].stop();
        }
        checkWidgetLoad[editWidgetConfig.id]=false;   
        $scope.DashboarddataLoad(editWidgetConfig);
        toaster.pop('success', "Widget Details Edited", '<span>Widget Details Modified Successfully</span>', 3000, 'trustedHtml');
      }
    }, function (res) {
      toaster.pop('Warning', "Widget Details Edit Failed", '<span>Widget Details Edit Failed</span>', 3000, 'trustedHtml');
    });
  };

  $scope.getDashboards = function () {
    $http.post('/dashboard/dashboard-list/', { userId: $scope.userId }).then(function (res) {
      if (res.data.status == 'success') {
        $scope.dashboardList = res.data.dashboardList;
      }
    });
  };

  $scope.dataSourceChangeEdit = function (val) {
    $scope.editWidgetConfig.configuration.dataSourceSelected = val.DataSourceId;
    $scope.editWidgetConfig.configuration.updateFrequency = val.RefreshTime;
  }

  $scope.cloneDashboard = function (dashboardId) {
    $scope.cloneDashboardDetails = {
      dashboardId: dashboardId,
      userId: $scope.userId
    }
    $http.post('/dashboard/clone-dashboard/', $scope.cloneDashboardDetails).then(function (res) {
      $scope.dashboardClone = res.data;
      if ($scope.dashboardClone.status == "success") {
        toaster.pop('success', "Dashboard Cloned", '<span>Dashboard was Successfully Cloned</span>', 3000, 'trustedHtml');
        angular.element(document.querySelector("body")).removeClass("add_dashboard_open");
        $scope.dashboardDetails.dashboardId = $scope.dashboardClone.dashboardId;
        $scope.dashboardDetails.addWidgets = "";
        $scope.dashboardDetails.editable = 1;
        $scope.refresh();
      }
    }, function (res) {
      toaster.pop('Warning', "Dashboard Clone Failed", '<span>Dashboard Clone Failed</span>', 3000, 'trustedHtml');
    });
  };

  $scope.changeDashboard = function (id) {
    $scope.updateTime = {};
    $scope.updateTime.id = id;
    $scope.updateTime.userId = $scope.userId;
    $http.post('/dashboard/save-dashboard-accesstime', $scope.updateTime).then(function (res) {
      if (res.data.status == 'success') {
        angular.element(document.querySelector("body")).removeClass("add_dashboard_open");
        $scope.dashboardDetails.dashboardId = id;
        $scope.dashboardDetails.addWidgets = "";
        $scope.dashboardDetails.editable = "";
        $scope.changeReferesh = true;
        $scope.refresh();
      }
    });
  };

  $scope.newDashboard = function () {
    $scope.selection = $scope.steps[0];
    angular.element(document.querySelector("body")).removeClass("add_dashboard_open");
    var timestamp = (Number(new Date().getTime()) / 10000000).toString().split(".")[1];
    $scope.dashboard = {}
    $scope.dashboard.dashboardName = "untitled" + timestamp;
    $scope.dashboard.userId = $scope.userId;
    $http.post('/dashboard/create-new-dashboard', $scope.dashboard).then(function (res) {
      $scope.dashboardSaveResData = res.data;
      if ($scope.dashboardSaveResData.status == 'success') {
        toaster.pop('success', "Dashboard Created", '<span>New Dashboard was Successfully Created</span>', 3000, 'trustedHtml');
        $scope.dashboardDetails.dashboardId = $scope.dashboardSaveResData.dashboardId;
        $scope.dashboardDetails.addWidgets = 1;
        $scope.dashboardDetails.editable = 1;
        $scope.refresh();
      }
    }, function (res) {
      toaster.pop('Warning', "Dashboard Creation Failed", '<span>Dashboard Creation Failed</span>', 3000, 'trustedHtml');
    });
  };

  $scope.changeDefault = function (val) {
    $scope.markDefault = {}
    $scope.markDefault.dashboardId = JSON.parse(val).DashboardId;
    $scope.markDefault.userId = $scope.userId
    swal({
      title: "Set " + JSON.parse(val).DashboardName + " as your default dashboard!",
      icon: "warning",
      buttons: true,
      dangerMode: false,
    })
      .then((changeDefault) => {
        if (changeDefault) {
          swal(JSON.parse(val).DashboardName + "set as Default dashboard!", {
            icon: "success",
          });
          $http.post('/dashboard/mark-default', $scope.markDefault).then(function (res) {
            if (res.data.status == "success") {
              $scope.dashboardDetails.dashboardId = "";
              $scope.dashboardDetails.addWidgets = 0;
              $scope.dashboardDetails.editable = 0;
              $scope.refresh();
            }
          });
        } else {
          swal("Change default Cancelled!");
          $scope.getDashboards();
        }
      });
  };

  $scope.refresh = function () {
    if (!$scope.edit) {
      $scope.editMode();
    } else {
      $scope.readOnlyMode();
    }
    if ($scope.dashboardDetails.dashboardId != '') {
      $http.post('/dashboard/dashboard-details/', { dashboardId: $scope.dashboardDetails.dashboardId }).then(function (res) {
        $scope.dashboardData = res.data;
        if ($scope.dashboardData.status == 'success') {
          $scope.selectedDashboard = $scope.dashboardData.dashboardDetails;
          getWidget($scope.selectedDashboard.DashboardId);
          $scope.editModeConfig();
        }
      });
    } else {
      $scope.getDashboardList = $http.post('/dashboard/dashboard-list/', { userId: $scope.userId }).then(function (res) {
        $scope.dashboardData = res.data;
        $scope.changeReferesh = true;
        if ($scope.dashboardData.status == 'success') {
          $scope.dashboardList = $scope.dashboardData.dashboardList;
          if ($scope.dashboardData.dashboardList.length != 0) {
            if ($scope.dashboardData.dashboardList.filter(item => item.DefaultDashboard == true).length) {
              $scope.selectedDashboard = $scope.dashboardData.dashboardList.filter(item => item.DefaultDashboard == true)[0];
              getWidget($scope.selectedDashboard.DashboardId);
              $scope.editModeConfig();
            } else {
              $scope.selectedDashboard = $scope.dashboardData.dashboardList[0];
              getWidget($scope.dashboardData.dashboardList[0].DashboardId);
              $scope.editModeConfig();
            }
          } else {
            $scope.selectedDashboard = "";
          }
        }
      });
    }
  };

  $scope.editModeConfig = function () {
    if ($scope.dashboardDetails.addWidgets && $scope.dashboardDetails.editable) {
      angular.element(document.querySelector("body")).addClass("grid_Editmode");
      angular.element(document.querySelector("body")).addClass("addwidget_open");
      $scope.edit = false;
    } else if ($scope.dashboardDetails.editable) {
      angular.element(document.querySelector("body")).addClass("grid_Editmode");
      $scope.edit = false;
    }
    if ($scope.changeReferesh) {
      $scope.changeReferesh = false;
    } else {
      $scope.getDashboards();
    }
  };

  $scope.closeAddModal = function () {
    angular.element(document.querySelector("body")).removeClass("add_dashboard_open");
  };

  (function () {
    $http.post('/dashboard/user-list', { userId: $scope.userId, tenantId: $scope.tenantId }).then(function (res) {
      $scope.UserList = res.data;
      if ($scope.UserList.status == 'success') {
        $scope.UserListData = $scope.UserList.userList;
      }
    });
  }());

  $scope.widgetsConfig = function () {
    $http.get('/dashboard/config').then(function (res) {
      if (res.data.status == "success") {
        $scope.widgetConfigList = res.data.widgetConfigList;
        for (i = 0; i < $scope.widgetConfigList.length; i++) {
          configureWidgets($scope.widgetConfigList[i]);
        }
      }
    });
  };

  $scope.getTemplates = function () {
    $http.post('/dashboard/getTemplatesList', { tenantId: $scope.tenantId }).then(function (res) {
      if (res.data.status == "success") {
        $scope.templateList = res.data.templateList;
      }
    });
  }

  $scope.useTemplateDashboard = function (dashboard) {
    angular.element(document.querySelector("body")).removeClass("add_dashboard_open");
    var timestamp = (Number(new Date().getTime()) / 10000000).toString().split(".")[1];
    $scope.templateDashboard = {}
    $scope.templateDashboard.dashboardName = dashboard.TemplateName + timestamp;
    $scope.templateDashboard.userId = $scope.userId;
    $scope.templateDashboard.templateWidgets = dashboard.TemplateWidgetsJson;
    $http.post('/dashboard/templates-dashboard', $scope.templateDashboard).then(function (res) {
      if (res.data.status == "success") {
        toaster.pop('success', "Template Cloned", '<span>Template was Successfully Cloned</span>', 3000, 'trustedHtml');
        angular.element(document.querySelector("body")).removeClass("add_dashboard_open");
        $scope.dashboardDetails.dashboardId = res.data.dashboardId;
        $scope.dashboardDetails.addWidgets = "";
        $scope.dashboardDetails.editable = 1;
        $scope.refresh();
      }
    });
  }

  function configureWidgets(obj) {
    tempConfigJson = obj.WidgetConfigJson;
    if (obj.WidgetType == 'chart') {
      configureWidget('chart', { name: tempConfigJson.name, image: tempConfigJson.image, value: tempConfigJson.value }, obj.WidgetConfigJson.config);
    } else if (obj.WidgetType == 'media') {
      configureWidget('media', { name: tempConfigJson.name, image: tempConfigJson.image, value: tempConfigJson.value });
    } else if (obj.WidgetType == 'map') {
      configureWidget('map', { name: tempConfigJson.name, image: tempConfigJson.image, value: tempConfigJson.value });
    } else if (obj.WidgetType == 'number') {
      configureWidget('number', { name: tempConfigJson.name, image: tempConfigJson.image, value: tempConfigJson.value });
    } else if (obj.WidgetType == 'live') {
      configureWidget('live', { name: tempConfigJson.name, image: tempConfigJson.image, value: tempConfigJson.value });
    } else if (obj.WidgetType == 'action') {
      configureWidget('action', { name: tempConfigJson.name, image: tempConfigJson.image, value: tempConfigJson.value });
    } else if (obj.WidgetType == 'table') {
      configureWidgetTableDefault(obj.WidgetConfigJson);
    }
  }

  function configureWidget(type, configObj, configuration) {
    $scope[type + 'Types'].push(configObj);
    if (type == 'chart' && configObj.value != 'donut' && configObj.value != 'halfDonut' && configObj.value != 'scatterLine') {
      configureWidgetChartDefault(configuration);
    } else if (type == 'chart') {
      configureWidgetChartSpecial(configObj.value, configuration);
    }
  }

  function configureWidgetChartDefault(configuration) {
    for (let temp in configuration) {
      if (temp == "yAxis" || temp == "xAxis" || temp == "x2Axis" || temp == "y1Axis" || temp == "y2Axis") {
        for (val in configuration[temp]) {
          $scope[configuration.type].chart[temp][val] = configuration[temp][val];
        }
      }else if (temp=="tooltip"){
        for (val in configuration[temp]) {
          if($scope[configuration.type].chart[temp]){
            $scope[configuration.type].chart[temp][val] = configuration[temp][val];
          }else{
            $scope[configuration.type].chart[temp] = configuration[temp];
          }
        }
      }else {
        $scope[configuration.type].chart[temp] = configuration[temp];
      }
    }
  }

  function configureWidgetTableDefault(configuration) {
    for (let temp in configuration) {
      $scope.gridOptions[temp] = configuration[temp];
    }
  }

  function configureWidgetChartSpecial(type, configuration) {
    for (let temp in configuration) {
      if (temp == "yAxis" || temp == "xAxis") {
        for (val in configuration[temp]) {
          $scope[type + "Chart"].chart[temp][val] = configuration[temp][val];
        }
      } else {
        $scope[type + "Chart"].chart[temp] = configuration[temp];
      }
    }
  }

  $scope.apiConfiguration = function () {
    $http.post('/dashboard/getApiConfig', { tenantId: $scope.tenantId }).then(function (res) {
     apiarray=[];
     apiSignalrArray=[];
     apiSharePointArray=[];
     console.log(res.data);
      if (res.data.status == "success") {  
        var count = Object.keys(res.data.apiConfigList).length;      
        for(i = 0;i < count;i++){         
          if(JSON.parse(res.data.apiConfigList[i].APIConfigJson).live){          
            apiSignalrArray.push(res.data.apiConfigList[i]);            
          }
          else if(JSON.parse(res.data.apiConfigList[i].APIConfigJson).sharepoint){          
            apiSharePointArray.push(res.data.apiConfigList[i]);            
          }
          else{  
           apiarray.push(res.data.apiConfigList[i]);       
          }
        }
        $scope.apiConfigList=apiarray;
        $scope.apiSignalrRConfigList=apiSignalrArray;
        $scope.apiSharePointConfigList=apiSharePointArray;

      }
    });
  };

  function getDataSourceRequest(dataSourceID) {    
    return $scope.apiConfigList.filter(element => element.DataSourceId == dataSourceID);
  }

  function getSignalRDataSourceRequest(dataSourceID){
    return $scope.apiSignalrRConfigList.filter(element => element.DataSourceId == dataSourceID);
  }

  function getSharePointDataSourceRequest(dataSourceID){
    return $scope.apiSharePointConfigList.filter(element => element.DataSourceId == dataSourceID);
  }

  $scope.dataSourceChange = function (val) {
    $scope.form.configuration.dataSourceSelected = val.DataSourceId;
    $scope.form.configuration.updateFrequency = val.RefreshTime;
    tempArr = [];
    for (i = 0; i < stepsArray.length; i++) {
      if (stepsArray[i].value >= val.RefreshTime) {
        tempArr.push(stepsArray[i]);
      }
      if (i == stepsArray.length - 1) {
        $scope.slider.options.stepsArray = [];
        $scope.slider.options.stepsArray = tempArr;
      }
    }
  };

  $scope.shareInit = function () {
    $scope.shareUserDetails = {};
    $scope.shareDashboardForm.$setPristine();
  };

  $scope.shareUserChange = function (shareUserDetails) {
    $scope.shareUserDetails = shareUserDetails;
    if ($scope.shareUserDetails) {
      $scope.shareValidity = false;
    } else {
      $scope.shareValidity = true;
    }
  };

  $scope.shareDashboard = function (selectedDashboard) {
    $scope.shareDashboardDetails = {};
    $scope.shareDashboardDetails.userId = $scope.userId;
    $scope.shareDashboardDetails.dashboardId = selectedDashboard;
    $scope.shareDashboardDetails.shareUserId = $scope.shareUserDetails.UserId;
    swal({
      title: "Are you sure?",
      text: "Sharing will also copy your widgets configurations and preferences",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          $http.post('/dashboard/share-dashboard', $scope.shareDashboardDetails).then(function (res) {
            if (res.data.status == "success") {
              swal("Selected Dashboard has been Shared!", {
                icon: "success",
              });
            }
          });
        } else {
          swal("Share operation cancelled!");
        }
      });
  }

  $scope.pieChart = {
    chart: {
      x: function (d) { return d.x; },
      y: function (d) { return d.y; }
    }
  };

  $scope.halfDonutChart = {
    chart: {
      x: function (d) { return d.x; },
      y: function (d) { return d.y; },
      pie: {
        startAngle: function (d) { return d.startAngle / 2 - Math.PI / 2 },
        endAngle: function (d) { return d.endAngle / 2 - Math.PI / 2 }
      }
    }
  };

  $scope.donutChart = {
    chart: {
      x: function (d) { return d.x; },
      y: function (d) { return d.y; }
    }
  };

  $scope.lineChart = {
    chart: {
      x: function (d) {
        if (typeof d.x == "number") {
          return d.x;
        } else if (typeof d.x == "string") {
          return new Date(d.x).getTime();
        }
      },
      y: function (d) { return d.y; },
      yAxis: {
        tickFormat: function (d) {
          return d3.format('.02f')(d);
        }
      },
      xAxis: {
        tickFormat: function (d) {
          if (d>66600000) {
            return d3.time.format('%x')(new Date(d));
          }else{
            return d;
          }
        }
      }
    }
  };

  $scope.stackedAreaChart = {
    chart: {
      x: function (d) { return d[0]; },
      y: function (d) { return d[1]; },
      xAxis: {
        tickFormat: function (d) {
          return d3.time.format('%x')(new Date(d))
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return d3.format(',.2f')(d);
        }
      }
    }
  };

  $scope.discreteBarChart = {
    chart: {
      x: function (d) { return d.label; },
      y: function (d) { return d.value; },
      valueFormat: function (d) {
        return d3.format(',.4f')(d);
      },
      xAxis: {},
      yAxis: {}
    }
  };

  $scope.boxPlotChart = {
    chart: {
      x: function (d) { return d.label; },
      //y: function(d){return d.values.Q3;},
    }
  };

  $scope.scatterChart = {
    chart: {
      tooltipContent: function (key) {
        return '<h3>' + key + '</h3>';
      },
      xAxis: {
        tickFormat: function (d) {
          return d3.format('.02f')(d);
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return d3.format('.02f')(d);
        }
      }
    }
  };

  $scope.lineWithFocusChart = {
    chart: {
      xAxis: {
        tickFormat: function (d) {
          return d3.format(',f')(d);
        }
      },
      x2Axis: {
        tickFormat: function (d) {
          return d3.format(',f')(d);
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return d3.format(',.2f')(d);
        }
      },
      y2Axis: {
        tickFormat: function (d) {
          return d3.format(',.2f')(d);
        }
      }
    }
  };

  $scope.scatterLineChart = {
    chart: {
      tooltipContent: function (key) {
        return '<h3>' + key + '</h3>';
      },
      xAxis: {
        tickFormat: function (d) {
          return d3.format('.02f')(d);
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return d3.format('.02f')(d);
        },
      }
    }
  };

  $scope.linePlusBarChart = {
    chart: {
      x: function(d,i) { 
        return d.x },
      xAxis: {
        tickFormat: function (d) {
          if (d>66600000) {
            return d3.time.format('%Y')(new Date(d));
          }else{
            return d;
          }
        }
      },
      x2Axis: {
        tickFormat: function (d) {
          return d3.time.format('%b-%Y')(new Date(d))
        }
      },
      y1Axis: {},
      y2Axis: {}
    }
  };

  $scope.bulletChart = {
    chart: {}
  };

  $scope.candlestickBarChart = {
    chart: {
      x: function (d) { return d['date']; },
      y: function (d) { return d['close']; },
      xAxis: {
        tickFormat: function (d) {
          return d3.time.format('%x')(new Date(new Date() - (20000 * 86400000) + (d * 86400000)));
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return '$' + d3.format(',.1f')(d);
        }
      }
    }
  };

  $scope.cumulativeLineChart = {
    chart: {
      x: function (d) { return d[0]; },
      y: function (d) { return d[1] / 100; },
      xAxis: {
        tickFormat: function (d) {
          if (d>66600000) {
            return d3.time.format('%x')(new Date(d));
          }else{
            return d;
          }
        }
      },
      average: function (d) { return d.mean / 100; }
    }
  };

  $scope.multiBarChart = {
    chart: {
      xAxis: {
        tickFormat: function (d) {
          return d3.format(',f')(d);
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return d3.format(',.1f')(d);
        }
      }
    }
  };

  $scope.historicalBarChart = {
    chart: {
      x: function (d) { return d[0]; },
      y: function (d) { return d[1] / 100000; },
      valueFormat: function (d) {
        return d3.format(',.1f')(d);
      },
      xAxis: {
        tickFormat: function (d) {
          return d3.time.format('%x')(new Date(d))
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return d3.format(',.1f')(d);
        }
      },
      tooltip: {
        keyFormatter: function (d) {
          return d3.time.format('%x')(new Date(d));
        }
      }
    }
  };

  $scope.sparklinePlus = {
    chart: {
      x: function (d, i) { return i; },
    }
  };

  $scope.ohlcBarChart = {
    chart: {
      x: function (d) { return d['date']; },
      y: function (d) { return d['close']; },
      xAxis: {
        tickFormat: function (d) {
          return d3.time.format('%x')(new Date(new Date() - (20000 * 86400000) + (d * 86400000)));
        }
      },
      yAxis: {
        tickFormat: function (d) {
          return '$' + d3.format(',.1f')(d);
        }
      }
    }
  };

  $scope.multiBarHorizontalChart = {
    chart: {
      x: function (d) { return d.label; },
      y: function (d) { return d.value; },
      yAxis: {
        tickFormat: function (d) {
          return d3.format(',.2f')(d);
        }
      },
      xAxis: {}
    }
  };

  $scope.slider = {
    value: 5,
    options: {
      showTicksValues: true,
      stepsArray: [
        { value: 5, legend: 'Real Time' },
        { value: 10, legend: 'Near Real Time' },
        { value: 60, legend: 'Moderate' },
        { value: 300, legend: 'Low' },
        { value: 600, legend: 'Very Low' }
      ]
    }
  };

  $scope.SignalRslider = {
    value: 5,
    options: {
      showTicksValues: true,
      stepsArray: [
        { value: 100 },
        { value: 200 },
        { value: 300 },
        { value: 400 },
        { value: 500 }
      ]
    }
  };

  $scope.addWidgetSlider = {
    value: 3,
    options: {
      showTicksValues: true,
      floor: 0,
      ceil: 5
    }
  };

  $scope.DownloadPrint=function(){
    window.print();
  }

  //Download a pdf (induvial widget)
  $scope.DownloadWidget=function(index,widget,type){
    var id="isFullscreen1"+index;
    if(widget.category=="number"||widget.category=="numberUnit"||widget.category=="numberSignalR"||widget.type=="table"||widget.type=="action"||widget.type=="calendar")
     {
      if(type=="pdf"){
          html2canvas(document.getElementById(id)).then(canvas => {
           var img=canvas.toDataURL("image/png");
            var doc=new jsPDF();
            doc.addImage(img,'PNG',20,20)
            doc.save(widget.name);
          });
          }
      else if(type=="image"){
            html2canvas(document.getElementById(id)).then(canvas => {
            var img=canvas.toDataURL("image/png");
            var link = document.createElement('a');
              link.download = widget.name;
              link.href = img;
              link.click();
        });
        }   
        else{}   
      }
  //Image Widget
  else if(widget.category=="image")
  { 
    //Download image from local file
      if(type=="pdf"){
        html2canvas(document.getElementById(id)).then(canvas => {
         var img=canvas.toDataURL("image/png");
          var doc=new jsPDF();
          doc.addImage(img,'PNG',20,20)
          doc.save(widget.name);
        });
          }
       else if(type=="image"){
        html2canvas(document.getElementById(id)).then(canvas => {
            var img=canvas.toDataURL("image/png");           
            var link = document.createElement('a');
              link.download = widget.name;
              link.href = img;
              link.click();
        });
     }
  else{}
  }
//Map Widget
  else if(widget.category=="markerMap")
  {
    if(type=="pdf"){
      var mapid="#map"+widget.id;
      var doc = new jsPDF();
      var html=$(mapid).html();
      console.log (html);
      doc.fromHTML($(mapid).get(0), 15, 15, {      
          'width': 500             
      });
      doc.save(widget.name);
                }
    else if(type=="image")
    {
      var mapid="map"+widget.id;
          html2canvas(document.getElementById(mapid), {
            useCORS: true,           
            onrendered: function(canvas){          
                // Convert and download as image 
                Canvas2Image.saveAsPNG(canvas,500,500,widget.name);                 
                }
                });
    }
    }
  else if(widget.category=="heatMap")
  {
    if(type=="pdf")
    {
      var mapid="heatmap"+widget.id;
      html2canvas(document.getElementById(mapid), {
        useCORS: true,       
        onrendered: function(canvas) {           
           document.body.appendChild(canvas);
            // Convert and download as image 
            Canvas2Image.saveAsPNG(canvas);                 
            $("#img-out").append(canvas);
            var doc = new jsPDF();
            var img=canvas.toDataURL("image/png");
            var doc=new jsPDF({
              format: "a4"
             });
           doc.addImage(img, "PNG");
           doc.save("pdfnew.pdf");
            }
            });
    }    
    
    else if(type=="image")
    {
      var mapid="heatmap"+widget.id;     
      html2canvas(document.getElementById(mapid), {
                useCORS: true,              
                onrendered: function(canvas) {            
                    Canvas2Image.saveAsPNG(canvas,500,500,widget.name);                     
             }
            });          
    }
  }
  
  else if(widget.type=="chart")
  {
     var svgelem=document.getElementById(id).querySelector('svg');
     if(type=='pdf'){
          svgAsPngUri(svgelem, {top:0,scale:1}, function(uri) {
             var pdf = new jsPDF('p', 'pt', 'letter');
             pdf.addImage(uri, 'png', 0, 0);
             pdf.save(widget.name);
         });
       }
     else if(type=='image')
          {
         saveSvgAsPng(svgelem, widget.name+type,{top:0,scale:2});
          }       
      }  
     else{}
 
  }

}]);