var nineModule = {
  models : require('./models'),
  theme : {
    directory : "./public"
  },
  route : {
    "GET /test":function(req,res){
      nineModule.dep.model.models['todo'].find({"creator":{name:"zhenyu2"}}).then(function( r ){
        res.json(r)
      })
    },
    "GET /add":function(req,res){
      nineModule.dep.model.models['todo'].create({
        content:Math.random().toString(),
        creator :2
      }).then(function( r ){
        res.json(r)
      })
    }

  }
}

module.exports = nineModule