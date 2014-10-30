angular.module('user', ['user.session'])
.controller(function($scope,$session){
    $scope.user = $session.data('user')
  })