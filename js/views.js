
app.factory('views', ['utils', function(utils){

    // View class
    function View(name, alias, node, viewEngine, log){
      this.name = name;
      this.alias = alias || name;
      this.log = log;
      this.engine = viewEngine;
      this.build(node);
    }

    View.prototype.build = function(node){
      //console.log("\nBuilding view: "+this.alias);
      var thisview = this;
      utils.traverse(node, function(n, depth){    // Navigate the tree to collect data attached to views
        //var spaces = new Array(depth).join("  ");data.labelSeries
        if(n.hasOwnProperty("views")){
          n.views.every(function(view){
            if(view.path[0]!==thisview.alias) return true; // While not found
            thisview.addData(view.path, n);  // Add the data to the view (and returns falsy to stop every())
          });
        }
        //if(typeof data !== 'undefined')
        //  console.log(spaces+"+"+data);
      });
    };

    View.prototype.addData = function(path, node){
      //console.log("adding "+path.join(".")+" ("+data+")");
      var obj = this;
      var value = node.hasOwnProperty("value") ? node.value : null;
      for(var i=1; i<path.length; i++){
        if(i===path.length-1){    // Last element in the path
          if(value===null){ // ==> It's a container: create an array to store them
            if(typeof obj[path[i]] === 'undefined'){ // There's no object with that name
              obj[path[i]] = [];
            }
            obj[path[i]].push({node:node});   // Containers have a handle to the original node
          }else{
            obj[path[i]] = value;             // Value nodes only have a handle to their value
          }
        }else{
          if(! obj.hasOwnProperty(path[i])){    // intermediate object implicitly defined !
            obj[path[i]] = [{}];
          }
          obj = obj[path[i]][ obj[path[i]].length-1 ];  // Container is the last element in the array
        }
      }
    };

    function getViewEngine(viewEngines, name){
      var viewEngine = viewEngines.filter(function(v){
        return v.getName()===name;
      });
      return viewEngine.length!==0? viewEngine[0] :
        { // Unknown views default to tree
          getName : function(){return 'error';},
          require : "error",
          description: "Unknown view: "+name
        };
    }


  return {

    /**
    * Return all views associated to this tyle
    */
    getViews: function(viewEngines, log){
      return this.hasOwnProperty("views") ? this.views.map(function(v){
        return new View(v.path[0], v.alias, this, getViewEngine(viewEngines, v.path[0]), log);
      }, this) : [];
    },

    addDefaultViews: function(views){
      var treeview = {
        getName : function(){ return "tree"; },
        require : "tree",
        description: "Tree-view of all data"
      };
      views.push(treeview);
    }
    
  };
}]);
