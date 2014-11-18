var Promise = require('bluebird')

var nineModule = {
  models : require('./models'),
  theme : {
    directory : "./public",
    index : "/nine/modules/index/index"
  },
  listen : {
    "group.update.before" : function( obj, newGroup){
      var bus =this
      if( newGroup.users ){
        if( !newGroup.password ){
          return bus.error(406,"use password to update group")
        }else{
          return bus.fire("group.findOne",{id:newGroup.id,password:newGroup.password}).then(function(res){
            if( !res['model.findOne.group']){
              return bus.error(406, "password of group not match")
            }
          })
        }
      }
    }
  },
  route : {
    "GET /test":function(req,res){
      nineModule.dep.model.models['todo'].find({}).then(function( r ){
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
  },
  acl :{
    roles : {
      "loggedIn" : function(req){
        console.log("check is user logged in?", req.session.user )
        return req.session.user.id !== undefined
      },
      "hasGroupPassword" : function(req){
        if( !req.param('password') ){
          return false
        }else{
          return req.bus.fire('group.findOne',{password:req.param('password')}).then(function( findRes ){
            if( !findRes['model.findOne.group'] ){
              return Promise.reject('password not match')
            }else{
              delete req.params['password'] //resolved
            }
          })
        }
      }
    },
    routes : {
      "GET /nine/modules/index/index" : [{
        role : 'loggedIn',
        redirect : '/nine/modules/user/login'
      }],
      "PUT /group/*" : ['hasGroupPassword']
    }
  }
}

module.exports = nineModule