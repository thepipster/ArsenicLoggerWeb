
function ArsenicLoggerCtrl($scope, $http, $compile){

    function showActivity(){
        $('#LoadingSpinner').show();
    };

    function hideActivity(){
        $('#LoadingSpinner').hide();
    };

    // Default values...
    $scope.isLoading = false;
    $scope.username = '';
    $scope.isLoggedIn = false;
    $scope.selectedPage = '';

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.setPage = function(page){
        $scope.selectedPage = page;
    }

    // ////////////////////////////////////////////////////////////////////////////////

    // Check the session is still valid every 60 seconds
    setInterval(function(){$scope.checkSession()}, 30000);

    /**
     * Ask the server if the current session is still valid
     */
    $scope.checkSession = function(){

        $http.get('/api/auth/check').success(function(data){

            if (data.result == 'ok'){
                $scope.username = data.username;
                $scope.isLoggedIn = true;
                if ($scope.selectedPage == ''){
                    $scope.setPage('dashboard');
                }
            }
            else {
                $scope.isLoggedIn = false;
            }
        });

    },

    // Check session is valid now
    $scope.checkSession();

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Login!
     */
    /*
    $scope.doLogin = function(){

        showActivity();
        $http.post('/api/v1.0/checkuser/', $scope.userinfo).success(function(data){
            hideActivity();
            if (data.result == 'ok'){
                $scope.isLoggedIn = true;
                getChannels();
                HubMain.selectPage('videos');
            }
            else {
                HubMain.showMessage(data.error, "error");
            }
        });

    };
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Support
    //
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.loadHTMLFragment = function(targetDiv, pageFragmentURL){
        showActivity();
        $http.get(pageFragmentURL).success(function(data){
            hideActivity();
            $(targetDiv).html($compile(data)($scope));
        });
    };


    $scope.currentPage = 'videos';

    /**
     * Store the current page, options are; 'videos', 'stats', 'settings', 'users', 'billing'
     * @param page
     */
    $scope.onSelectPage = function(page){
        $scope.currentPage = page;
    }
}


