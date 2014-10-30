angular.module('index',['ui.router','countdown','tomato','user.session','group'])
  .config(function ( $urlRouterProvider) {
      $urlRouterProvider.otherwise("/tomato");
    })
  .controller( 'index',function($scope,session){
    $scope.user = session.data('user')
  })

