/**
 * Declare a new Angular module
 */

function AsLoggerUserCtrl($scope, $rootScope, $http, $compile){


    function getUsers(){

        $scope.isLoading = true;

        $http.get('/api/meta/users').success(function(data){
            console.log(data);
            $scope.isLoading = false;
            $rootScope.users = data.users;
            //console.log(data);
        });


    }

    getUsers();

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.updateUser = function(userObj){

        console.log(userObj);
        console.log('TBD');
/*
        $http.put('/api/meta/user', {user: userObj}).success(function(data){

            if (data.result == 'ok'){
                for (var i=0; i<$rootScope.users.length; i++){

                    console.log(data.user);
                    console.log(data.user.id);

                    if ($rootScope.users[i].id == data.user.id){
                        $rootScope.users[i] = data.user;
                        return;
                    }
                }
            }
            else {
                BlackHills.showMessage(data.error, "error");
            }
        });
*/

    };

    // ////////////////////////////////////////////////////////////////////////////////

    $scope.updateUserField = function(user, field, val){
        user[field] = val;
        $scope.updateUser(user);
    }
}

