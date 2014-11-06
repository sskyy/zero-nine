angular.module('user.session',['util']).run(function(session,$http){
  session.register('user',{},function(origin, query){
    $http.post('/user/me'+(query?"?"+query:"")).success(function(user){
      session.data('user',user)
    })
  })
})