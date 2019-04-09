app.controller('ContainerCtrl', ['$scope', '$timeout', '$http', '$rootScope', '$interval', '$window', 'Upload', '$state', '$stateParams', 'Fullscreen', 'HttpRetryService', 'toaster', '$document', function ($scope, $timeout, $http, $rootScope, $interval, $window, Upload, $state, $stateParams, Fullscreen, HttpRetryService, toaster, $document) {
    $scope.getImages = function(){        
        $http.get('/container/get-docker-image/').then(function (res) {
            console.log(res.data);
            $scope.containerImageList = res.data.imagesList;
        });
    };

    $scope.pushImage = function(tagName){
        $scope.imageDetails = {};
        $scope.imageDetails.image = 'sr9k1nt8/softura-docker';
        $scope.imageDetails.tagName = tagName;
        $scope.containerData = $http.post('/container/push-image/',$scope.imageDetails).then(function (res) {
            console.log(res.data);
            toaster.pop('success', "Image was pushed Successfully", '<span>'+tagName +'was updated to the container</span>', 3000, 'trustedHtml');
        });
    };

    $scope.getImagesUI = function(){
        
    }
}]);