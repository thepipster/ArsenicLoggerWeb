
function AsLoggerCtrl($scope, $rootScope, $http, $compile){

    // Default values...
    $rootScope.isLoading = false;

    $scope.accountInfo = '';
    $scope.username = '';
    $scope.isLoggedIn = false;
    $scope.selectedPage = '';
    $scope.selectedTag = 'all';
    $scope.selectedHost = 'all';
    $scope.logLevel =  {value: 0, label: 'debug'};
    $scope.logs = null;

    $scope.logLevels = [
        {value: 0, label: 'debug'},
        {value: 1, label: 'info'},
        {value: 2, label: 'warn'},
        {value: 3, label: 'error'},
        {value: 4, label: 'fatal'}
    ];

    $scope.levelTagToValue = function(label){
        for (var i = 0; i<$scope.logLevels.length; i++){
            if ($scope.logLevels[i].label == label){
                return $scope.logLevels[i].value;
            }
        }
    };

    /**
     * Check to see if the log level string is great than the current log level
     * @param levelString
     */
    $scope.isLogLevelGreater = function(levelString){
        return ($scope.levelTagToValue(levelString) >= $scope.logLevel.value);
    }

    $scope.version = 0;
    $scope.environment = '';

    /**
     * Get the app version and environment
     */
    function getVersion(){

        $http.get('/api/version').success(function(data){

            if (data.result == 'ok'){
                $scope.version = data.version;
                $scope.environment = data.environment;
            }
            else {
                console.error("Error getting account info");
            }
        });

    };

    getVersion();

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

    function getHosts(){

        $http.get('/api/hosts').success(function(data){

            if (data.result == 'ok'){
                $scope.hosts = data.hosts;
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

        $scope.setPage('logs');

        getAccountInfo();
        getTags();
        getHosts();

        $scope.getStorageUsage();

        //$scope.getUsage();
        $scope.getLogs();

    }

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.currentLogPage = 1;
    $scope.logPageSize = 25;
    $scope.numberLogPages = 0;

    $scope.incLoggerPage = function(){
        $scope.currentLogPage++;
        console.log($scope.currentLogPage + ", " + $scope.numberLogPages);
        if ($scope.currentLogPage > $scope.numberLogPages) {
            $scope.currentLogPage = $scope.numberLogPages;
        }
        else {
            $scope.getLogs();
        }
    };

    $scope.decLoggerPage = function(){
        $scope.currentLogPage--;
        console.log($scope.currentLogPage + ", " + $scope.numberLogPages);
        if ($scope.currentLogPage < 1) {
            $scope.currentLogPage = $scope.numberLogPages = 1;
        }
        else {
            $scope.getLogs();
        }
    };

    $scope.getLogs = function(){

        $rootScope.isLoading = true;

        //app.get('/api/logs/:sinceDate', adminApi.getLogs);
        //app.get('/api/logs/:tag/:sinceDate', adminApi.getLogs);

        var url = '';

        if ($scope.selectedTag == 'all'){
            url = '/api/logs/' + $scope.logPageSize + '/' + $scope.currentLogPage;
        }
        else {
            url = '/api/logs/' +  $scope.logPageSize + '/' + $scope.selectedTag + '/' + $scope.currentLogPage;
        }

        $http.get(url).success(function(data){

            $rootScope.isLoading = false;

            if (data.result == 'ok'){
                $scope.logs = data.logs;
                console.log($scope.logPageSize + ', ' + data.total);

                $scope.numberLogPages = Math.floor(data.total / $scope.logPageSize);
                if (data.total % $scope.logPageSize > 0) $scope.numberLogPages++;

                console.log('Div = ' + (data.total / $scope.logPageSize));
                console.log('Remainder = ' + ($scope.logPageSize % data.total));

                setTimeout(function(){$('.logTooltip').tooltip({html:true});}, 250);
            }
            else {
                console.error("Error getting logs");
            }
        });

    };

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.deleteLogs = function(){

        ArsenicLogger.confirmDialog({
            message: "Are you sure, this can not be undone?",
            onYes: function(){
                $rootScope.isLoading = true;

                $http.delete('/api/logs').success(function(data){

                    $rootScope.isLoading = false;

                    if (data.result == 'ok'){
                        $scope.initialize();
                    }
                    else {
                        console.error("Error deleting logs");
                    }
                });
            }
        });

    }

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.noDocuments = 0;
    $scope.storageSize = 0;
    $scope.dataSize = 0;

    /**
     * Get stats on the amount of storage size being used
     */
    $scope.getStorageUsage = function(){

        //{"result":"ok","noDocs":13,"dataSize":7632,"storageSize":36864}

        $rootScope.isLoading = true;

        $http.get('/api/stats').success(function(data){

            $rootScope.isLoading = false;

            if (data.result == 'ok'){
                $scope.noDocuments = data.noDocs;
                $scope.storageSize = data.storageSize / (1024*1024);
                $scope.dataSize = data.dataSize;
                //console.log($scope.usage );
                $scope.lastUsageSync = new Date(); // Set sync date to now
            }
            else {
                console.error("Error getting storage usage");
            }
        });


    };

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.lastUsageSync = new Date(0);

    $scope.getUsage = function(){

        $rootScope.isLoading = true;

        var url = '/api/usage/' + $scope.lastUsageSync.getTime();

        $http.get(url).success(function(data){

            $rootScope.isLoading = false;

            if (data.result == 'ok'){
                $scope.usage = data.usage;
                //console.log($scope.usage );
                $scope.lastUsageSync = new Date(); // Set sync date to now
            }
            else {
                console.error("Error getting usage");
            }
        });

    };

    $scope.getCPUData = function(){

        var chartData = [];

        for (var k=0; k<$scope.hosts.length; k++){

            var series = {
                values: getCPUDataForHost($scope.hosts[k]),
                key: $scope.hosts[k]
            };

            chartData.push(series);

        }

        function getCPUDataForHost(host){
            var data = [];
            for (var i=0; i<$scope.usage.length; i++){
                if ($scope.usage[i].hostname == host){
                    var tm = new Date($scope.usage[i].time).getTime();
                    var val = $scope.usage[i].cpu;
                    data.push([tm, val]);
                }
            }
            return data;
        }

        return chartData;
    };

    $scope.getMemoryData = function(){

        var chartData = [];

        for (var k=0; k<$scope.hosts.length; k++){

            var series = {
                values: getMemoryDataForHost($scope.hosts[k]),
                key: $scope.hosts[k]
            };

            chartData.push(series);
        }

        function getMemoryDataForHost(host){

            var data = [];

            for (var i=0; i<$scope.usage.length; i++){
                if ($scope.usage[i].hostname == host){
                    var tm = new Date($scope.usage[i].time).getTime();
                    var val = $scope.usage[i].memory / (1024*1024);
                    data.push([tm, val]);
                }
            }
            return data;
        }

        return chartData;
    };


    /*
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
    */

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
                $scope.selectedPage = '';
            }
        });

    };

    // Check session is valid now
    $scope.checkSession();

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.selectTag = function(tag){
        $scope.selectedTag = tag;
        $scope.getLogs();
    }

    $scope.setLogLevel = function(level){
        $scope.logLevel = level;
    }

    $scope.selectHost = function(host){
        $scope.selectedHost = host;
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Support
    //
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Convert a stack object to a human readable string
     * @param stack
     * @returns {string}
     */
    $scope.stackToString = function(stack){

        var txt = "<div style='text-align: left; font-size: 10px; color: lightgreen'>";
        stack.forEach(function(obj){
            txt += obj.fileName + ":" + obj.line + ", "+ obj.functionName + "<br/>";
        });
        txt += "</div>";

        return txt;
    };

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
        $('.page-content').empty();

        switch(page){

            case 'logs':
                $('#LogsMenuItem').addClass('active');
                $scope.loadHTMLFragment('#LogsPage', 'html/logs-fragment.html');
                break;

            case 'usage':
                $('#UsageMenuItem').addClass('active');
                $scope.loadHTMLFragment('#UsagePage', 'html/usage-fragment.html');
                break;

            case 'settings':
                $('#SettingsMenuItem').addClass('active');
                $scope.loadHTMLFragment('#SettingsPage', 'html/settings-fragment.html');
                break;
        }
    };


}


