angular.module("todo",['ngResource','util'])
  .service("todo", function(util){
    var todo =  {
      checkChildren:function(todoTocheck, criteria){
        if( !todoTocheck.children) return true

        return _.every(todoTocheck.children,criteria) && todoTocheck.children.every(function( subTodo){
          return todo.checkChildren( subTodo,criteria)
        })
      },
      tree : function( todos ){
        var tree = _.indexBy(todos,'id')

        _.forEach( tree, function( v,k ){
          if( !tree[v.parentId] || !tree[v.parentId] ){
            v.isRoot = true
            return
          }

          tree[v.parentId].childrenTomatos =( tree[v.parentId].childrenTomatos || 0 )+ (v.tomatos||0)
          tree[v.parentId].children = tree[v.parentId].children || []
          v.parent = tree[v.parentId]
          tree[v.parentId].children.unshift( v )
        })

        _.forEach( todos, function(v,k){
          if( !v.isRoot ) delete todos[k]
        })

        return todos
      }
    }

    return todo

  })