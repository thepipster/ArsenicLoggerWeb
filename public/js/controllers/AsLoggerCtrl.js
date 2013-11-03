
function AsLoggerCtrl($scope, $rootScope, $http, $compile){

    // Default values...
    $rootScope.isLoading = false;

    $scope.accountInfo = '';
    $scope.username = '';
    $scope.isLoggedIn = false;
    $scope.selectedPage = '';
    $scope.selectedTag = 'all';

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

    // ////////////////////////////////////////////////////////////////////////////////

    /**
     * Once a user is logged in, get all the data that we need
     */
    $scope.initialize = function(){

        $scope.setPage('dashboard');

        getAccountInfo();
        getTags();

        $scope.getLogs();

    }

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.lastSync = new Date(0);

    $scope.getLogs = function(){

        $rootScope.isLoading = true;

        //app.get('/api/logs/:sinceDate', adminApi.getLogs);
        //app.get('/api/logs/:tag/:sinceDate', adminApi.getLogs);

        var url = '';

        if ($scope.selectedTag == 'all'){
            url = '/api/logs/' + $scope.lastSync.getTime();
        }
        else {
            url = '/api/logs/' + $scope.selectedTag + '/' + $scope.lastSync.getTime();
        }

        console.log("Getting logs, lastSync = ("+$scope.lastSync.getTime()+") " + $scope.lastSync);
        console.log(url);

        $http.get(url).success(function(data){

            $rootScope.isLoading = false;

            if (data.result == 'ok'){
                $scope.logs = data.logs;
                setTimeout(function(){$('.logTooltip').tooltip();}, 250);
            }
            else {
                console.error("Error getting logs");
            }
        });

    };

    var sampleLog = {
        "tag": "LoggerTest",
        "ip": "127.0.0.1",
        "hostname": "metis.home",
        "pid": 25529,
        "cpu": 21.1,
        "memory": 15941632,
        "message": "fatal test ",
        "accountId": "52755e0a6721dede61000001",
        "_id": "52756da7d40faab863000002",
        "__v": 0,
        "modified": "2013-11-02T21:24:55.763Z",
        "level": "fatal",
        "stack": [
            {
                "functionName": "anonymous",
                "fileName": "remote_test.js",
                "line": 43
            },
            {
                "functionName": "Module._compile",
                "fileName": "module.js",
                "line": 456
            },
            {
                "functionName": "Module._extensions..js",
                "fileName": "module.js",
                "line": 474
            },
            {
                "functionName": "Module.load",
                "fileName": "module.js",
                "line": 356
            }
        ]
    }

    // ////////////////////////////////////////////////////////////////////////////////

    // Check the session is still valid every 60 seconds
    setInterval(function(){$scope.checkSession()}, 30000);

    /**
     * Ask the server if the current session is still valid
     */
    $scope.checkSession = function(){

        $http.get('/api/auth/check').success(function(data){

            //console.log('checkSession', data);

            if (data.result == 'ok'){
                $scope.apiKey = data.apiKey;
                $scope.username = data.username;
                $scope.isLoggedIn = true;
                if ($scope.selectedPage == ''){
                    $scope.initialize();
                }
            }
            else {
                $scope.isLoggedIn = false;
            }
        });

    };

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
        $scope.getLogs();
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


