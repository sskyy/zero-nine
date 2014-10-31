angular.module('group',['countdown','todo','node.crud'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('groups', {
        url : "/groups",
        templateUrl: '/nine/modules/group/index'
      })
  }).controller("groups",function($scope,$http){

    $scope.join = function( group, user ){
      if( !group ||!user){
        return console.log( group, user, "can not be empty")
      }

      if( user.groups && _.find(user.groups,{id:group.id})){
        return console.log("already in")
      }

      var newUserWithGroups = {groups: (user.groups||[]).concat(group) }
      $http.put("/user/"+user.id,newUserWithGroups).then(function( newUser ){
        _.extend(user, newUser)
      })
    }

    $scope.inGroup = function( group, user){
      console.log(user,group.id, _.find( user.groups,{id:group.id}) )
      return user.groups && _.find( user.groups,{id:group.id})
    }
  })