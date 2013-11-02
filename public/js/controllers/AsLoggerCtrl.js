
function AsLoggerCtrl($scope, $rootScope, $http, $compile){

    // Default values...
    $rootScope.isLoading = false;

    $scope.accountInfo = '';
    $scope.username = '';
    $scope.isLoggedIn = false;
    $scope.selectedPage = '';
    $scope.selectedTag = 'default';

    function getAccountInfo(){

        $http.get('/api/account').success(function(data){

            if (data.result == 'ok'){
                $scope.accountInfo = data.account;
            }
            else {
                console.error("Error getting account info");
            }
        });

    }

    function getTags(){

        $http.get('/api/tags').success(function(data){

            if (data.result == 'ok'){
                $scope.tags = data.tags;
            }
            else {
                console.error("Error getting tags");
            }
        });

    }

    getAccountInfo();
    getTags();

    // ////////////////////////////////////////////////////////////////////////////////

    // Check the session is still valid every 60 seconds
    setInterval(function(){$scope.checkSession()}, 30000);

    /**
     * Ask the server if the current session is still valid
     */
    $scope.checkSession = function(){

        $http.get('/api/auth/check').success(function(data){

            if (data.result == 'ok'){
                $scope.apiKey = data.apiKey;
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

    $scope.selectTag = function(tag){
        $scope.selectedTag = tag;
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Support
    //
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.loadHTMLFragment = function(targetDiv, pageFragmentURL){
        $rootScope.isLoading = true;
        $http.get(pageFragmentURL).success(function(data){
            $rootScope.isLoading = false;
            $(targetDiv).html($compile(data)($scope));
        });
    };

    /**
     * Store the current page, options are; 'dashboard', 'settings'
     * @param page
     */
    $scope.setPage = function(page){

        $scope.selectedPage = page;

        $('#MenuItems li').removeClass('active');

        switch(page){

            case 'dashboard':
                $('#AppsMenuItem').addClass('active');
                $scope.loadHTMLFragment('#DashboardPage', 'html/dashboard-fragment.html');
                break;

            case 'settings':
                $('#SettingsMenuItem').addClass('active');
                $scope.loadHTMLFragment('#SettingsPage', 'html/settings-fragment.html');
                break;
        }
    }


}


