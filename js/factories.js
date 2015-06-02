
app.factory('scriptMngr', ['log',function(log) {
  return {

    loadedScripts : [],

    loadedCSS : [],

    loadScript : function(script, callback){
      var prev = this.findScript(script);
      if(typeof prev === 'undefined'){    // Not loaded yet
        var newscript = {
          name : script,
          hasFinishedLoading : false,
          callbacks : (callback? [callback] : [])
        };
        this.loadedScripts.push(newscript);
        log.info("Loading script: "+script+"...");
        $.getScript(script, function(data, text, res){   // Using jquery's service to load scripts
          log.info("Finished loading script: "+script+": "+text+" ("+res.status+")");
          newscript.hasFinishedLoading = true;
          newscript.callbacks.forEach(function(cb){ cb(); });
        });

      }else if( prev.hasFinishedLoading ){ // Loaded and ready
        log.info("Script "+script+" already loaded and ready");
        if(callback)
          callback();

      }else{                              // Still loading
        log.info("Script "+script+" still loading...");
        if(callback)
          prev.callbacks.push(callback);
      }
    },

    findScript : function(script){
      var res = this.loadedScripts.filter(function(s){ return s.name===script; });
      return res[0];
    },

    loadScripts : function(scripts, callback) {
      if(scripts.length===0){
        callback();
      }else{
        var progress = 0;
        var internalCallback = function () {
            if (++progress == scripts.length) {
              log.info("Finished loading scripts!");
              callback();
            }
        };

        scripts.forEach(function(script) {
          this.loadScript(script, internalCallback);
        }, this);
      }
    },

    loadCSS : function(hrefList) {
      hrefList.forEach(function(href) {
        if(this.loadedCSS.indexOf(href)===-1){
          var cssLink = $("<link rel='stylesheet' type='text/css' href='"+href+"'>");
          $("head").append(cssLink);
        }
      }, this);
    }
  };
}])

.factory('viewMngr', ['log',function(log){
  return {
    views : [],
    addView : function(view){
      log.info("adding view "+view.name+" to view manager");
      if(typeof this.getView(view.name) === 'undefined')
        this.views.push(view);
      else
        throw "Error: this view "+view.name+" has already been registered!";
    },
    getView : function(view){
      return this.views.filter(function(v){ return v.name===view;})[0];
    }
  };
}])

.factory('logger', [function(){
  return {
    Log : function(){

      this.events = [];

      this.info = function(o){
        this.logWith("info", o);
      };

      this.warn = function(o){
        this.logWith("warn", o);
      };

      this.error = function(o){
        this.logWith("error", o);
      };

      this.getEvents = function(level){
        if(level==='info')
          return this.events;
        else if(level==="warn")
          return this.events.filter(function(e){ return e.hasOwnProperty("warn") || e.hasOwnProperty("error"); });
        else
          return this.events.filter(function(e){ return e.hasOwnProperty("error"); });
      };

      this.dump = function(level){
        console.log(this.getEvents(level));
      };

      this.logWith = function(level, o){
        if(console[level])
          console[level](level+": "+o);
        else
          console.log(level+": "+o);
        var entry = {};
        if(typeof o === "string"){
          entry[level] = o;
        }else if (o.hasOwnProperty("message")) {
          entry[level] = o.message;
          if(o.hasOwnProperty("stack")){
            entry.stack = o.stack;
          }
        }else{
          entry[level] = "";
        }
        this.events.push(entry);
      };

    }
  };
}])

.factory('log', ['logger',function(logger){
  return new logger.Log();
}])

.run(function($injector) {
    app.$injector = $injector;    // Store the injector, for use in other parts of the code
});


/*
.factory('highlight', ['log',function(log){
  log.info("Highlight factory called!");
  return {
    json : function(json) {
        log.info("@Highlight factory: Formatting JSON...");
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 4);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'json number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json key';
                } else {
                    cls = 'json string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json boolean';
            } else if (/null/.test(match)) {
                cls = 'json null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
  };
}])*/
