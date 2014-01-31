function AsLoggerCtrl($scope, $rootScope, $http, $compile) {

    // Default values...
    $rootScope.isLoading = false;

    $scope.accountInfo = '';
    $scope.username = '';
    $scope.isLoggedIn = false;
    $scope.selectedTag = 'all';
    $scope.selectedHost = 'all';
    $scope.selectedPage = '';

    $scope.logLevel = {
        value: 0,
        label: 'debug'
    };
    $rootScope.logs = [];

    $scope.logLevels = [{
        value: 0,
        label: 'debug'
    }, {
        value: 1,
        label: 'info'
    }, {
        value: 2,
        label: 'warn'
    }, {
        value: 3,
        label: 'error'
    }, {
        value: 4,
        label: 'fatal'
    }];

    $scope.levelTagToValue = function(label) {
        for (var i = 0; i < $scope.logLevels.length; i++) {
            if ($scope.logLevels[i].label == label) {
                return $scope.logLevels[i].value;
            }
        }
    };

    /**
     * Check to see if the log level string is great than the current log level
     * @param levelString
     */
    $scope.isLogLevelGreater = function(levelString) {
        return ($scope.levelTagToValue(levelString) >= $scope.logLevel.value);
    }

    $scope.version = 0;
    $scope.environment = '';

    /**
     * Get the app version and environment
     */

    function getVersion() {

        $http.get('/api/version').success(function(data) {

            if (data.result == 'ok') {
                $scope.version = data.version;
                $scope.environment = data.environment;
            }
            else {
                console.error("Error getting account info");
            }
        });

    };

    getVersion();

    function getAccountInfo() {

        $http.get('/api/account').success(function(data) {

            if (data.result == 'ok') {
                $scope.accountInfo = data.account;
            }
            else {
                console.error("Error getting account info");
            }
        });

    }

    function getTags() {

        $http.get('/api/tags').success(function(data) {

            if (data.result == 'ok') {
                $scope.tags = data.tags;
            }
            else {
                console.error("Error getting tags");
            }
        });

    }

    function getHosts() {

        $http.get('/api/hosts').success(function(data) {

            if (data.result == 'ok') {
                $scope.hosts = data.hosts;
            }
            else {
                console.error("Error getting tags");
            }
        });

    }

    /**
     * Timer to get whatever data is relevant based on current page
     */
    setInterval(function() {
        if ($scope.selectedPage == 'logs' && $scope.getLiveLogs) {
            //console.log('getting logs');
            $scope.getLogs()
        }
    }, 5000);

    setInterval(function() {
        if ($scope.selectedPage == 'logs' && $scope.getLiveLogs) {
            getTags();
            getHosts();
        }
    }, 30000);


    // ////////////////////////////////////////////////////////////////////////////////

    /**
     * Once a user is logged in, get all the data that we need
     */
    $scope.initialize = function() {

        $scope.setPage('logs');

        getAccountInfo();
        getTags();
        getHosts();

        $scope.getStorageUsage();

        $scope.getLogs();

    }

    // ////////////////////////////////////////////////////////////////////////////////
    //
    // Getting logs
    //
    // ////////////////////////////////////////////////////////////////////////////////

    var HOURS_PER_PAGE = 3 * 60 * 60 * 1000; /* ms */

    $scope.pageDateRanges = null;
    $scope.currentLogPage = 0;
    $scope.logPageSize = 25;
    $scope.lastSync = null;

    // ////////////////////////////////////////////////////////////////////////////////

    var resetLogs = function(){
        $rootScope.logs = [];
        $scope.lastSync = null;
    }

    // ////////////////////////////////////////////////////////////////////////////////

    var resetPageDateRanges = function(){
        $scope.pageDateRanges = [{
            start: new Date(0), //new Date(Date.now() - HOURS_PER_PAGE),
            end: new Date()
        }];
        $scope.currentLogPage = 0;
    }

    resetPageDateRanges();


    // ////////////////////////////////////////////////////////////////////////////////

    $scope.getNewerLogs = function() {

        $scope.currentLogPage--;

        if ($scope.currentLogPage < 0) {
            $scope.currentLogPage = 0;
        }
        else {
            console.log("Page " + $scope.currentLogPage, $scope.pageDateRanges[$scope.currentLogPage]);
            resetLogs();
            if ($scope.getLiveLogs){
                $scope.getLogs();            
            }
            else {
                $scope.getLogsBySearch();            
            }
        }

    };

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.getOlderLogs = function() {

        $scope.currentLogPage++;

        if (!$scope.pageDateRanges[$scope.currentLogPage]) {
            $scope.pageDateRanges[$scope.currentLogPage] = {};
        }

        var endDate = new Date($scope.pageDateRanges[$scope.currentLogPage - 1].start);
        var startDate = new Date(endDate.getTime() - HOURS_PER_PAGE);

        $scope.pageDateRanges[$scope.currentLogPage] = {
            start: startDate,
            end: endDate
        };

        resetLogs();
        if ($scope.getLiveLogs){
            $scope.getLogs();            
        }
        else {
            $scope.getLogsBySearch();            
        }
    };

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.lastSync = new Date(0);

    $scope.getLogs = function() {

        $scope.getLiveLogs = true;

        if (!$scope.pageDateRanges){
            alert('reseting date ranges!');
            resetPageDateRanges();
        }

        $rootScope.isLoading = true;

        //app.get('/api/logs/:level/:tag/:pageSize/:page/:host', adminApi.getLogs);

        // If we're on the first page, keep pushing out the end date to now!
        if ($scope.currentLogPage == 0){
            $scope.pageDateRanges[$scope.currentLogPage].end = new Date();    
        }

        $scope.pageStartDate = $scope.pageDateRanges[$scope.currentLogPage].start;
        $scope.pageEndDate = $scope.pageDateRanges[$scope.currentLogPage].end;

        var startDate = $scope.pageStartDate;

        // Set the start date to use as last sync flag so we don't get duplicated data
        if ($scope.lastSync) {
            startDate = $scope.lastSync;
        }

        // http://localhost:3010/api/logs/debug/all/all/Fri%20Jan%2031%202014%2010:06:58%20GMT-0500%20(EST)/Fri%20Jan%2031%202014%2011:06:58%20GMT-0500%20(EST)
        // http://localhost:3010/api/logs/debug/all/all/Wed Dec 31 1969 19:00:00 GMT-0500 (EST)/Fri Jan 31 2014 11:36:25 GMT-0500 (EST)

        var url = '/api/logs/' + $scope.logLevel.label + '/' + $scope.selectedTag + '/' + $scope.selectedHost + '/' + startDate + '/' + $scope.pageEndDate;
        var queryTime = new Date();

        console.log(url);

        $http.get(url).success(function(data) {

            $rootScope.isLoading = false;

            $scope.lastSync = queryTime;

            if (data.result == 'ok') {
                _processLogs(data.logs);
            }
            else {
                console.error("Error getting logs");
            }
        });

    };

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.searchTerm = "";

    $scope.getLogsBySearch = function() {

        $scope.getLiveLogs = false;

        resetLogs();
        resetPageDateRanges();

        $rootScope.isLoading = true;

        $http.get('/api/search/' + $scope.searchTerm).success(function(data) {

            $rootScope.isLoading = false;

            if (data.result == 'ok') {
                _processLogs(data.logs);
            }
            else {
                console.error("Error getting logs");
            }
        });

    };

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.selectTag = function(tag) {
        $scope.selectedTag = tag;
        resetLogs();
        resetPageDateRanges();        
        $scope.getLogs();
    }

    $scope.setLogLevel = function(level) {
        $scope.logLevel = level;
        resetLogs();
        resetPageDateRanges();        
        $scope.getLogs();
    }

    $scope.selectHost = function(host) {
        $scope.selectedHost = host;
        resetLogs();
        resetPageDateRanges();        
        $scope.getLogs();
    }

    // ////////////////////////////////////////////////////////////////////////////////

    var _processLogs = function(logs){

        if (!logs || logs.length == 0){
            console.warn('no results!');
            return;
        }

        if ($rootScope.logs.length == 0){
            // This is the first run for the current settings, so lets get the oldest date from the returned logs and set that to the start date of this page
            $scope.pageDateRanges[$scope.currentLogPage].start = logs[logs.length-1].modified;
            $scope.pageStartDate = $scope.pageDateRanges[$scope.currentLogPage].start;
        }

        $rootScope.logs = logs.concat($rootScope.logs);

        var MAX_NO_PER_PAGE = 200;
        
        // Keep the list under control by removing any entries over the maximum number and push everything else to an older page
        if ($rootScope.logs.length > MAX_NO_PER_PAGE) {
            for (var i = MAX_NO_PER_PAGE; i < $rootScope.logs.length; i++) {
                if (i == MAX_NO_PER_PAGE) {
                    $scope.pageDateRanges[$scope.currentLogPage].end = $rootScope.logs[i].modified;
                    $scope.pageDateRanges.start = $rootScope.logs[i].modified;
                }
                $rootScope.logs.pop(i);
            }
        }

        setTimeout(function() {
            $('.logTooltip').tooltip({
                html: true
            });
        }, 250);


    }

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.deleteLogs = function() {

        ArsenicLogger.confirmDialog({
            message: "Are you sure, this can not be undone?",
            onYes: function() {
                $rootScope.isLoading = true;

                $http.delete('/api/logs').success(function(data) {

                    $rootScope.isLoading = false;

                    if (data.result == 'ok') {
                        $rootScope.logs = [];
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
    $scope.getStorageUsage = function() {

        //{"result":"ok","noDocs":13,"dataSize":7632,"storageSize":36864}

        $rootScope.isLoading = true;

        $http.get('/api/stats').success(function(data) {

            $rootScope.isLoading = false;

            if (data.result == 'ok') {
                $scope.noDocuments = data.noDocs;
                $scope.storageSize = data.storageSize / (1024 * 1024);
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

    $scope.chartMode = 'Memory Used (MB)';

    $scope.chartModes = [
        'Total Memory Available (MB)',
        'CPU Load',
        'Memory Used (MB)',
        'Memory Used (Percent of Available)'
    ]

    $scope.updateChartMode = function(mode) {
        $scope.chartMode = mode;
        AsLoggerCharts.updateMemoryChart();
    }

    $scope.getMemoryData = function(callback) {

        $rootScope.isLoading = true;

        var url = '/api/memory/' + $scope.logLevel.label + '/' + $scope.selectedTag + '/' + $scope.selectedHost;

        console.log('getMemoryData - url = ' + url);

        $http.get(url).success(function(data) {

            $rootScope.isLoading = false;

            if (data.result == 'ok') {
                $scope.usage = data.memoryUsage;
                //console.log($scope.usage );
                prepareMemoryData(callback);
            }
            else {
                console.error("Error getting usage");
            }
        });

    };

    function prepareMemoryData(callback) {

        var chartData = [];

        for (var k = 0; k < $scope.hosts.length; k++) {

            var series = {
                values: getMemoryDataForHost($scope.hosts[k]),
                key: $scope.hosts[k]
            };

            chartData.push(series);
        }

        function getMemoryDataForHost(host) {

            var data = [];

            for (var i = 0; i < $scope.usage.length; i++) {
                if ($scope.usage[i].hostname == host) {

                    var tm = new Date($scope.usage[i].modified).getTime();
                    var val = 0;

                    switch ($scope.chartMode) {
                        case 'CPU Load':
                            val = 100 * Math.floor($scope.usage[i].cpu);
                            break;
                        case 'Total Memory Available (MB)':
                            val = $scope.usage[i].memoryTotal / (1024 * 1024);
                            break;
                        case 'Memory Used (MB)':
                            val = $scope.usage[i].memory / (1024 * 1024);
                            break;
                        case 'Memory Used (Percent of Available)':
                            val = Math.floor(100 * $scope.usage[i].memory / $scope.usage[i].memoryTotal);
                            break;
                    }

                    data.push([tm, val]);
                }
            }
            return data;
        }

        callback(chartData);
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
    setInterval(function() {
        $scope.checkSession()
    }, 30000);

    /**
     * Ask the server if the current session is still valid
     */
    $scope.checkSession = function() {

        $http.get('/api/auth/check').success(function(data) {

            console.log('checkSession', data);

            if (data.result == 'ok') {
                $scope.apiKey = data.apiKey;
                $scope.username = data.username;
                $scope.userlevel = data.level;
                $scope.isLoggedIn = true;            
                if ($scope.selectedPage == '') {
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
    //
    // Support
    //
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Convert a stack object to a human readable string
     * @param stack
     * @returns {string}
     */
    $scope.stackToString = function(stack) {

        var txt = "<div style='text-align: left; font-size: 10px; color: lightgreen'>";
        stack.forEach(function(obj) {
            txt += obj.fileName + ":" + obj.line + ", " + obj.functionName + "<br/>";
        });
        txt += "</div>";

        return txt;
    };

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.loadHTMLFragment = function(targetDiv, pageFragmentURL) {
        $rootScope.isLoading = true;
        $http.get(pageFragmentURL).success(function(data) {
            $rootScope.isLoading = false;
            $(targetDiv).html($compile(data)($scope));
        });
    };

    /**
     * Store the current page, options are; 'dashboard', 'settings'
     * @param page
     */
    $scope.setPage = function(page) {

        $scope.selectedPage = page;

        $('#MenuItems li').removeClass('active');
        $('.page-content').empty();

        switch (page) {

            case 'logs':
                $('#LogsMenuItem').addClass('active');
                $scope.loadHTMLFragment('#LogsPage', 'html/logs-fragment.html');
                break;

            case 'usage':
                $('#UsageMenuItem').addClass('active');
                $scope.loadHTMLFragment('#UsagePage', 'html/usage-fragment.html');
                break;

            case 'metausers':
                $('#MetaUsersMenuItem').addClass('active');
                $scope.loadHTMLFragment('#MetaUserManagement', 'html/meta-users.html');
                break;

            case 'settings':
                $('#SettingsMenuItem').addClass('active');
                $scope.loadHTMLFragment('#SettingsPage', 'html/settings-fragment.html');
                break;
        }
    };

    // ///////////////////////////////////////////////////////////////////////////////////////

    $rootScope.formatDate = function(date) {
        if (!date) date = new Date(0);
        return moment(date).format('MMM Do YYYY, h:mm a');
    }

    // ///////////////////////////////////////////////////////////////////////////////////////

    $rootScope.formatTime = function(date) {
        if (!date) date = new Date(0);
        return moment(date).format('h:mm:ss a');
    }
}
