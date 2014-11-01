var nineModule = {
  models : require('./models'),
  theme : {
    directory : "./public",
    index : "/nine/modules/index/index"
  },
  route : {
    //"GET /test":function(req,res){
    //  nineModule.dep.model.models['todo'].find({"creator":{name:"zhenyu2"}}).then(function( r ){
    //    res.json(r)
    //  })
    //},
    //"GET /add":function(req,res){
    //  nineModule.dep.model.models['todo'].create({
    //    content:Math.random().toString(),
    //    creator :2
    //  }).then(function( r ){
    //    res.json(r)
    //  })
    //}
  },
  acl :{
    roles : {
      "loggedIn" : function(req){
        return req.session.user.id
      }
    },
    routes : {
      "GET /nine/modules/index/index" : [{
        role : 'loggedIn',
        redirect : '/nine/modules/user/login'
      }],
      "GET /color/install" : ['isInstaller']
    }
  }
}

module.exports = nineModule