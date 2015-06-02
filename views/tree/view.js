
registerView({
  name : "tree",
  dependencies : {
    javascript: [], // Actually the dependencies are already loaded, as part of the main GUI
    css: [],
  },
  render : function(scope, element, data){

    $(element).fileTree({ root: "" },
      function(file) {
        // Nothing special when node selected
      },
      function(dir) {
        var r = [];
        //console.log("dir "+dir);
        dir = unescape(dir);
        dir = dir.substring(0, dir.length-1);
        var path = dir===""? [] : dir.split("\/");
        //console.log("dir "+dir+" "+path+" "+path.length);
        var node = getNode(data.tree[0].node, path);

        if(node.hasOwnProperty("children")){
          var prev = "", i=0;
          node.children.forEach(function(c){
            if(c.name===prev) // Array !
              r.push({type: "dir", class: "directory collapsed", path: (dir===''? '' : dir+"/")+c.name+"["+i+"]"+"/", text : c.name});
            else              // Object !
              r.push({type: "dir", class: "directory collapsed", path: (dir===''? '' : dir+"/")+c.name+"/", text : c.name});
            prev = c.name;
            i++;
          });
        }else if(node.hasOwnProperty("value")){
          var val = node.value;
          if(Array.isArray(val)){
            var i=0;
            val.forEach(function(c){
              r.push({type: "file", class: "file", path: dir+"["+(i++)+"]", text : ""+c});
            });
          }else
            r.push({type: "file", class: "file", path: dir, text : ""+val});
        }

        return r;
      }
    );


    function getNode(node, path){
      //console.log("getnode "+path+" "+path.length);
      if(path.length>0){
        var key = path.shift();
        //console.log("key "+key);
        var regExp = /\[([0-9]+)\]/;
        var matches = regExp.exec(key);
        if(matches!==null){ // I'm looking for an indexed son
          //console.log("index "+matches[1]);
          return getNode(node.children[parseInt(matches[1])], path);
        }else{ // I'm looking for a named son
          return getNode(node.get(key), path);
        }
      }else{
        //console.log("node "+node.name);
        return node;
      }
    }

  }
});
