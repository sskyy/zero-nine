angular.module('tomato',['countdown','todo','node.crud'])
  .config(function ($stateProvider) {
    console.log("register tomato")
    $stateProvider
      .state('tomato', {
        url : "/tomato?userId&groupId&commanderId",
        templateUrl: '/nine/modules/tomato/index'
      })
  })
  .controller('tomato',function( $scope,countdown, $http,$stateParams, todoTree,util,session){

    $scope.clock = null
    $scope.startClock = function( todo ){
      if( todo.$$clock && todo.$$clock.status== 'started') return false

      if( !todo.$$clock ){
        todo.$$clock = countdown()
      }

      todo.$$clock.start().then(function(){
        $http.put( "/todo/"+todo.id ,{"tomatos" : (todo.tomatos||0) +1 })
      })

      if( todo.completed ){
        todo.completed = false
        $http.put( "/todo/"+todo.id ,{"completed" : false})
      }

      if( $scope.clock !== todo.$$clock ){
        $scope.clock&&$scope.clock.stop()
        $scope.clock = todo.$$clock
      }
    }

    $scope.create = function( todo, group ){
      todo.creator = session.data('user').id
      todo.commander = ( todo.commander || session.data('user')).id
      group && (todo.group = group.id)

      return $http.post("/todo",todo).success(function(){
        $scope.queryTodos()
      })
    }

    $scope.queryUsers = function(){
      $http.get("/user").success( function(users){
        console.log( users)
        $scope.members = users
      })
    }

    if( $stateParams.groupId ){
      $http.get("/group/"+$stateParams.groupId).success(function(group){
        $scope.group = group
      })
    }

    $scope.queryTodos = function(){
      var params = {}

      _.forEach(['group','user','commander'],function( query){
        if( $stateParams[query+"Id"]){
          params[query+".id"] = $stateParams[query+"Id"]
        }
      })

      $http.get("/todo?"+ util.makeQuery(params)).success( function( todos){
        console.log( todos)
        $scope.todos = todoTree(todos)
        console.log( $scope.todos)
      })
    }

  })