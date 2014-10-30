module.exports = [{
  identity : 'todo',
  attributes : {
  },
  relations : {
    commander : {
      model : "user",
      auth : ['read'],
      multiple : false,
      reverse : {
        name : "assigned",
        multiple : true
      }
    },
    creator : {
      model : "user",
      auth : ['read'],
      multiple : false,
        reverse : {
          name : "owned",
          multiple : true
        }
    },
    group : {
      model : "group",
      auth : ['read'],
      multiple : false,
        reverse : {
          name : "owned",
          multiple : true
        }
    }
  },
  rest : true
},{
  identity : 'group',
  attributes : {},
  rest : true
}]