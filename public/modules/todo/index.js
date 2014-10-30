angular.module("todo",[])
  .service("todoTree", function(){
    return function( todos ){
      var tree = _.indexBy(todos,'id')

      _.forEach( tree, function( v,k ){
        if( !tree[v.parentId] || !tree[v.parentId] ){
          v.isRoot = true
          return console.log( "parent not in this tree", v)
        }

        tree[v.parentId].children = tree[v.parentId].children || []
        tree[v.parentId].children.push( v )
      })

      _.forEach( tree, function(v,k){
        if( !v.isRoot ) delete tree[k]
      })

      return tree
    }
  })