(function() {
  'use strict';

  angular.module('treeApp', ['ui.tree'])
    .controller('treeCtrl', function($scope) {
      $scope.remove = function(scope) {
        scope.remove();
      };

      $scope.toggleExpand = function(node, isExpand, expandParent) {
        node.expanded = isExpand === undefined ? !node.expanded : isExpand
        if( expandParent ){
          if( node.expanded ){
            walkObject( node, '$$parent', function handler( parent ){
              parent.expanded = true
              console.log( parent )
            }, function iterator( parent, wrappedHandler){
              console.log("i", parent)
              return wrappedHandler(parent)
            })
          }else if( node['$$parent'] && _.every(node['$$parent'].nodes,'expanded')){
            $scope.toggleExpand(node['$$parent'], false, expandParent)
          }
        }
      };

      $scope.check = function( node, isCheck, checkOnlyChildren ){
        if( node.checked !== undefined && node.checked === isCheck ) return

        node.checked = isCheck=== undefined ? !node.checked : isCheck

        if( node.nodes ){
          node.nodes.forEach(function( subNode ){
            $scope.check( subNode, node.checked, true )
          })
        }
        !checkOnlyChildren && checkParent(node)
      }

      $scope.search = function(keyword,data ){
        var val = keyword.trim().toLowerCase();
        if (val !== '') {
          data.forEach(function( node){
            walkObject(node, 'nodes',tagAsChecked)
          })
        }else{
          data.forEach(function( node) {
            walkObject(node, 'nodes', function reset(node) {
              $scope.check(node, false)
              $scope.toggleExpand(node, false, true)
            })
          })
        }

        function tagAsChecked( node ){
          if( !node.$$parent ||!node.$$parent.checked){
            if( !(new RegExp( keyword )).test(node.title)){
              $scope.check(node,false)
              $scope.toggleExpand( node, false, true)
            }else{
              $scope.check(node,true)
              $scope.toggleExpand( node, true, true)
            }
          }
        }
      }


      function checkParent( node ){
        if( node.$$parent){
          if( node.$$parent.checked && !node.checked ){
            node.$$parent.checked = false
          }else if( !node.$$parent.checked && node.checked ){
            console.log("parent may need check")
            if( node.$$parent.nodes.every(function( sibling){
              return sibling.checked
            })){
              node.$$parent.checked = true
            }
          }else{
//            console.log( node.$$parent.checked == false , node.checked == true)
          }
          checkParent(node.$$parent)
        }
      }

      $scope.collapseAll = function() {
        $scope.$broadcast('collapseAll');
      };

      $scope.expandAll = function() {
        $scope.$broadcast('expandAll');
      };

      var data = [{
        "id": 1,
        "title": "a",
        "nodes": [
          {
            "id": 11,
            "title": "b",
            "nodes": [
              {
                "id": 111,
                "title": "c",
                "nodes": []
              }
            ]
          },
          {
            "id": 12,
            "title": "d",
            "nodes": []
          }
        ]
      }, {
        "id": 2,
        "title": "e",
        "nodes": [
          {
            "id": 21,
            "title": "f",
            "nodes": []
          },
          {
            "id": 22,
            "title": "g",
            "nodes": []
          }
        ]
      }, {
        "id": 3,
        "title": "h",
        "nodes": [
          {
            "id": 31,
            "title": "i",
            "nodes": []
          }
        ]
      }];

      function bindParent( node ){
        node.nodes.forEach( function( subNode ){
          subNode.$$parent = node
          bindParent( subNode )
        })
      }

      function walkObject( data, subName, handler, iterator ){
        handler(data,data[subName])
        if( data[subName] ){
          iterator = iterator || _.forEach
          iterator(data[subName],function(subData){
            handler(subData,data[subName])
            walkObject(subData, subName, handler, iterator)
          })
        }
      }

      data.forEach( function( node ){
        bindParent(node)
      })

      $scope.data = data
    });

})();
