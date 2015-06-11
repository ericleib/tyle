

// This factory is meant to run in node-webkit context (require function is used to call node modules)
app.factory('local-adapter', [function(){

  if(CONTEXT==='BROWSER')
    return {name : 'Local', value : 'local', disabled : true};

  var fs = require('fs');
  var path = require('path');

  var nwDir = path.dirname(process.execPath);

  return {

    name: 'Local',

    value: 'local',

    disabled: false,

    default: true,

    defaultPath: path.join(nwDir,"test"),

    read: fs.readFile,  // Async read

    getDirectoryContent: function(dir, callback) {  // Async folder read
      var r = [];
      try {
        dir = unescape(dir);
        if(fs.statSync(dir).isFile() && dir.toLowerCase().endsWith('.xml')){
          callback([{type: "file", class: "file ext_xml", path: dir, text : dir.substr(dir.lastIndexOf('/') + 1)}]);

        }else{
          console.log("filetree: reading dir "+dir);
          var files = fs.readdirSync(dir);
          files.forEach(function(f){
            var ff = path.join(dir, f);
            var stats = fs.statSync(ff);
            if (stats.isDirectory()) {
              r.push({type: "dir", class: "directory collapsed", path: ff+"/", text : f});
            } else {
              var e = path.extname(f).substring(1);
              if(e==='xml')
                r.push({type: "file", class: "file ext_"+e, path: ff, text : f});
            }
          });
        }

      } catch(e) {
        console.dir(e);
        r.push({type: "error", msg: 'Could not load directory: ' + dir + " (" + e + ")"});
      }
      callback(r);
    }

  };

}]);


app.factory('http-adapter', [function(){
  return {

    name: 'HTTP',

    value: 'http',

    disabled: false,

    default: CONTEXT==='BROWSER',

    defaultPath: 'http://localhost:8080/test',

    read: function(url, callback){
      url = unescape(url);
      $.get(url, function(data){  // Using jquery to perform the AJAX call
        callback(null, data);
      }, "text")
      .fail(function(jqXHR, textStatus, errorThrown) {
        callback(textStatus);
      });
    },

    getDirectoryContent: function(dir, callback){
      dir = unescape(dir);
      $.getJSON(dir, function(data){   // Using jquery to perform the AJAX call
        callback(data);
      }).fail(function(jqXHR, textStatus, errorThrown) {
        if(textStatus==='parsererror' && dir.toLowerCase().indexOf(".xml", dir.length - 4) !== -1)
          callback([{type: "file", class: "file ext_xml", path: dir, text : dir.substr(dir.lastIndexOf('/') + 1)}]);
        else
          callback([{type: "error", msg: 'Could not load directory: ' + dir + " (" + textStatus + ")"}]);
      });
    }

  };
}]);
