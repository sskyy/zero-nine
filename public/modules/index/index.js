angular.module('index',['ui.router','countdown','tomato','user.session','group'])
  .config(function ( $urlRouterProvider) {
      //$urlRouterProvider.otherwise("tomato");
    })
  .controller( 'index',function($scope,session,$http,$state){
    $scope.user = session.data('user')
    $scope.$watch( 'user.id',function(id){
      if( id && $scope.user.groups.length !== 0 && !_.isObject($scope.user.groups[0] )){
        $http.get("/user/"+$scope.user.id + "?populate=groups").success(function(user){
          $scope.user = user
          $state.go("commander",{"commander.id":user.id})
        })
      }
    })
  })

