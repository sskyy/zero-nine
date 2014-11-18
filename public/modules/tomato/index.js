angular.module('tomato',['countdown','todo','node.crud','ngResource','util'])
  .config(function ($stateProvider) {
    console.log("register commander")

    $stateProvider
      .state('commander', {
        url : '/tomato/commander',
        templateUrl: '/nine/modules/tomato/index',
        params : {
          "commander.id" : ""
        }
      })
      .state('creator', {
        url : '/tomato/creator',
        templateUrl: '/nine/modules/tomato/index',
        params : {
          "creator.id" : ""
        }
      })
      .state('group', {
        url : '/tomato/group',
        templateUrl: '/nine/modules/tomato/index',
        params : {
          "group.id" : ""
        }
      })

  })
  .controller('tomato',function( $scope,countdown, $http,$stateParams,todo,util,session,crud,$state){

    if( !$stateParams['group.id'] && !$stateParams['creator.id'] && !$stateParams['commander.id']){
      return $state.go('commander',{"commander.id":session.data('user').id})
    }
    //setup crud
    var config ={
      type : 'todo',
      callback : function(){
        util.replace( this.data.tree , todo.tree(this.data.records) )
        //build default clock
        util.walk( {children:this.data.tree} , "children",function( todoToWalk){
          if( !todoToWalk.id) return

          //set clock
          if( todoToWalk.startedAt && !(todoToWalk.stoppedAt&&todoToWalk.stoppedAt>todoToWalk.startedAt) ){
            console.log( "started",todoToWalk.pausedAt , todoToWalk.startedAt)

            if( todoToWalk.pausedAt && todoToWalk.pausedAt > todoToWalk.startedAt ){
              todoToWalk.$$clock = countdown({
                status:'paused',
                time : todoToWalk.timeLeft,
                total : todoToWalk.timeTotal
              })
            }else{
              var timeLeft =( parseInt(todoToWalk.startedAt) + parseInt(todoToWalk.timeTotal) - parseInt( (new Date).getTime()))
              console.log( "started not paused",timeLeft,todoToWalk.timeTotal,parseInt( (new Date).getTime()))

              if( timeLeft > 0 ){
                todoToWalk.$$clock = countdown({
                  time : timeLeft,
                  total : todoToWalk.timeTotal
                })
                console.log( "started not paused",timeLeft,todoToWalk.timeTotal)
                todoToWalk.$$clock.start()
              }
            }
          }
        })
      }
    }

    //console.log(_.transform($stateParams,function(r,v,k){ v&&(r[k]=v)}))
    var params = _.defaults(_.transform($stateParams,function(r,v,k){ v&&(r[k]=v)}), {
      limit : 256,
      sort : "id DESC",
      populate : 'creator,commander',
      completed : false
    })


    var todoCrud =crud(config,params)
    todoCrud.query()

    $scope.todos = todoCrud.data.tree = {}


    //setup group
    if( params["group.id"] ){
      $http.get("/group/"+params["group.id"]+"?populate=users").success(function(group){
        $scope.group = group
      })
    }

    //clock
    $scope.userClock = (function(){
      var _clock
      return function( clock ){
        if( clock ){
          if( _clock !== clock ){
            if( _clock && (_clock.status =='started' || _clock.status=='paused')) return false
            _clock = clock
            return true
          }
        }else{
          return _clock
        }
      }
    })()

    $scope.clock = function( todo, config , forceToNew){
      if( !todo.$$clock || forceToNew ) todo.$$clock = countdown(config)
      return todo.$$clock
    }

    $scope.start = function( todo ){
      if( todo.$$clock.status== 'started') return false
      if( $scope.group ) return alert("you cannot start clock for anyone")

      //if it is user personal page, update global clock
      if( !$scope.userClock(todo.$$clock) ) return alert("please stop what you are doing before")

      todo.$$clock.start().then(function(){
        todoCrud.update({id:todo.id ,"tomatos" : (todo.tomatos||0) +1 })
      })


      if( todo.completed ){
        todo.completed = false
        todoCrud.update({id:todo.id,"completed" : false})
      }

      //update server started time
      todoCrud.update({id:todo.id,"startedAt" : (new Date).getTime(),"timeTotal":todo.$$clock.total})
    }

    $scope.query = function( params ){
      todoCrud.query(params)
    }

    $scope.resume = function( todo ){
      if( !$scope.userClock(todo.$$clock) ) return alert("please stop what you are doing before")

      todoCrud.update({
        "id" :todo.id,
        "startedAt" : (new Date).getTime(),
        "timeLeft" : todo.$$clock.time
      })
      todo.$$clock.resume()
    }

    $scope.pause = function(todo){
      todoCrud.update({
        "id" : todo.id,
        "pausedAt" : (new Date).getTime(),
        "timeLeft" : todo.$$clock.time
      })
      todo.$$clock.pause()
    }

    //methods
    $scope.create = function( todo, group, parent ){
      if( !session.data('user').id ){
        return alert("请先登陆")
      }

      todo.creator = session.data('user').id
      todo.commander = todo.commander || session.data('user').id
      todo.completed = false
      group && (todo.group = group.id)

      console.log( todo)
      todo.$$submiting = true
      return todoCrud.create(todo,false).success(function( savedTodo){
        todo.content = ''
        todo.$$submiting = false

        if( parent){
          if( !parent.children ) parent.children = []
          parent.children.push(savedTodo)
        }else{
          $scope.todos[savedTodo.id] = savedTodo
        }

      }).finally(function(){
        todo.$$submiting = false
      })
    }


    $scope.toggleComplete = function( todoToUpdate ){
      var updateObj = { completed : !todoToUpdate.completed,id:todoToUpdate.id}
      if( !todo.checkChildren( todoToUpdate, {completed:true})) return alert("请先完成所有子任务")

      if( updateObj.completed && todoToUpdate.$$clock && (todoToUpdate.$$clock.status=='started'||todoToUpdate.$$clock.status=='paused')){
        if( todoToUpdate.$$clock.time < todoToUpdate.$$clock.total/2 ){
          //mark as completed
          $scope.stop( todoToUpdate, true)
        }else{
          //go to parent
          var timeLeft = todoToUpdate.$$clock.time
          var timeTotal = todoToUpdate.$$clock.total
          $scope.stop( todoToUpdate, false)

          if( todoToUpdate.parent ){
            $scope.clock( todoToUpdate.parent,{
              time : timeLeft,
              total : timeTotal
            },true)
            console.log( $scope.userClock())
            $scope.start(todoToUpdate.parent)

            //update current and do not reload
            _.extend(todoToUpdate, updateObj)
            return todoCrud.update(updateObj,false)
          }
        }
      }

      return todoCrud.update(updateObj,true)
    }

    $scope.remove = function( todoToRemove ){
      if( !todo.checkChildren( todoToRemove, {})) return alert("请先删除所有子任务")
      return todoCrud.remove(todoToRemove,true)
    }

    $scope.stop = function( todoToStop, markAsFinished ){
      todoToStop.$$clock.stop()

      var updateObj = {id : todoToStop.id,"stoppedAt": (new Date).getTime()}
      if( markAsFinished ) updateObj.tomatos = (todoToStop.tomatos||0) +1


      //do not reload
      _.extend( todoToStop, updateObj)
      todoCrud.update(updateObj)
    }



  })
  .directive('uiSrefx',function($state,$location){
    return function(scope,elem,attrs){
      $(elem).click(function(){
        $state.go(attrs['uiSrefx'])
        window.setTimeout(function(){$location.search("commander.id","1")},1)
        console.log( JSON.stringify(window.location))
      })
    }
  })

