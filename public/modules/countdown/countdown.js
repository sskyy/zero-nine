angular.module('countdown',['ui.router'])

.service('countdown', function( $q, $timeout ){
    var defaultClock = {
      _startTime : null,
        _ticked : 0,
      _tick : _tick,
      _resetTick : _resetTick,
      _updateInterval : 1000,
      time : 25 * 60 *1000,
      total : 25 * 60 *1000,
      status : '',
      start : start,
      stop : stop,
      pause : pause,
      resume : resume
    }


    function start(){
      if( this.status == 'started' ){
        console.log("already started")
        return false
      }

      var root = this
      var defer = $q.defer()

      root.status = "started"
      root._resetTick()
      root._tick(defer)
      console.log("start clock")
      return defer.promise
    }


    function _tick(defer){
      var root = this

        if( root.status =='started') {
          root._ticked++
          var now = parseInt((new Date).getTime())
          var next = root._startTime + (root._ticked * root._updateInterval) - now

          if (root.status == 'started') {
            root.time -= root._updateInterval
            console.log( root.time )
          }

          if (!(root.time > 0)) {
            root.stop()
            return defer.resolve()
          } else {
            $timeout(root._tick.bind(root,defer), next)
          }

        }else if( root.status == 'stopped' || root.status=='paused' ){
            return false;
        }else{
          return console.log("unknown clock status", root.status)
        }
    }

    function resume(){
      this._resetTick()
      this.status = 'started'
      this._tick()
    }

    function stop(){
      _.extend(this, _.cloneDeep(defaultClock), _.cloneDeep(this._config))
    }

    function pause(){
      this.status='paused'
    }

    function _resetTick(){
      this._startTime = parseInt((new Date).getTime())
      this._ticked = 0
    }

    return function( config ){
      var clock =  _.extend(_.cloneDeep(defaultClock),config)
      clock._config = _.cloneDeep(config)
      return clock
    }
  })
.filter("duration", function(){
    return function( mseconds, format ){
      return moment.duration( mseconds).format( format)
    }
  })