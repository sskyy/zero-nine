/**
 * Created by jiamiu on 14-8-9.
 * You must use `angular.module('node.curd').value('config',{})` to specify which type of node you want to operate.
 */
var app = angular.module('node.crud',['util','ngResource','ngSanitize'])
  .controller('node.crud',function($scope,$resource,crud,$attrs,crudSetup){
    $scope.crud = crud.apply(crud, crudSetup( $attrs, $scope))
  })
