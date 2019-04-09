app.controller('loginCtrl', ['$scope', '$state', '$http','$rootScope', function ($scope, $state, $http,$rootScope) {
    $scope.checkLogin = function (email, password) {
        $scope.loginCredentials ={};
        $scope.loginCredentials.email = email; 
        $scope.loginCredentials.password = password;
        $http.post('/login/authenticate', $scope.loginCredentials).then(function (res) {
            $scope.loginStatus = res.data;
            if($scope.loginStatus.status == 'success'){
                $rootScope.userDetails = {
                    userId : $scope.loginStatus.userDetails.UserId,
                    tenantId : $scope.loginStatus.userDetails.TenantId
                };
                $state.go('dashboard');
            }else{
                $scope.msg="Invalid Credentials..!"
            }
        });
    }
}]);
