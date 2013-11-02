function AsLoggerLoginCtrl($scope, $rootScope, $http){

    // Default values...
    $scope.userinfo = {name: '', email: '', password: '', password_check: ''};

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    function isUsernameFree(username, callback){
        $http.get('/api/user/checkusername/'+username).success(function(data){
            if (data.result == 'ok'){
                callback(!data.isUsed);
            }
            else {
                console.error(data.error);
            }
        });
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.newUser = {
        company: '',
        name: '',
        username: '',
        password: '',
        password2: ''
    };

    $scope.onUpdateRegisterForm = function(field){

        switch(field){

            case 'password':
            case 'password2':

                if ($scope.newUser.password.length > 1 && $scope.newUser.password == $scope.newUser.password2){
                    $('#registerPassword1').removeClass('has-error').addClass('has-success');
                    $('#registerPassword2').removeClass('has-error').addClass('has-success');
                }
                else {
                    $('#registerPassword1').removeClass('has-success').addClass('has-error');
                    $('#registerPassword2').removeClass('has-success').addClass('has-error');
                }

                break;

            case 'username':
                isUsernameFree($scope.newUser.username, function(isFree){
                    if (isFree){
                        $('#registerUsername').removeClass('has-error').addClass('has-success');
                        $('#registerUsernameStatus').addClass('hidden');
                    }
                    else {
                        $('#registerUsername').removeClass('has-success').addClass('has-error');
                        $('#registerUsernameStatus').removeClass('hidden');
                    }
                });
                break;
        }


        /*
        if (validateEmail($scope.newUser.email)){
            $('#registerEmail').removeClass('has-error').addClass('has-success');
        }
        else {
            $('#registerEmail').removeClass('has-success').addClass('has-error');
        }
        */

        if (validateRegisterUserForm()){
            if ($('#registerUserButton').attr('disabled')) {
                $('#registerUserButton').removeClass('btn-danger').addClass('btn-success');
                $('#registerUserButton').removeAttr('disabled');
            }
        }
        else {
            console.log('Not valid');
            if (!$('#registerUserButton').attr('disabled')) {
                $('#registerUserButton').removeClass('btn-success').addClass('btn-danger');
                $('#registerUserButton').attr('disabled', 'disabled');
            }
        }
    };

    function validateEmail(email) {
        // http://stackoverflow.com/a/46181/11236
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function validateRegisterUserForm(){

        if ($scope.newUser.password == $scope.newUser.password2){
            return true;
        }

        return false;
    }


    $scope.registerUser = function(){

        $rootScope.isLoading = true;

        var params = {
            company: $scope.newUser.company,
            username: $scope.newUser.username,
            name: $scope.newUser.name,
            password: $scope.newUser.password
        };

        $http.post('/api/user', params).success(function(data){

            $rootScope.isLoading = false;

            if (data.result == 'ok'){
                ArsenicLogger.showMessage("Account created!", "success");
            }
            else {
                ArsenicLogger.showMessage(data.error, "error");
            }

        });

    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.onLogin = function(){

        $rootScope.isLoading = true;

        $http.get('/api/user/login').success(function(data){

            $rootScope.isLoading = false;

            if (data.result != 'ok'){
                ArsenicLogger.showMessage(data.error, "error");
            }
        });
    }

}


