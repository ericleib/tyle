

// This factory is meant to run in node-webkit context (require function is used to call node modules)
app.factory('local-adapter', [function(){

  var nwDir = require('path').dirname(process.execPath);
  var fs = require('fs');
  var path = require('path');

  return {

    name: 'Local',

    value: 'local',

    disabled: false,

    default: true,

    defaultPath: nwDir,

    read: fs.readFileSync,

    getDirectoryContent: function(dir) {
      var r = [];
      try {
        dir = unescape(dir);
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
      } catch(e) {
        console.dir(e);
        r.push({type: "error", msg: 'Could not load directory: ' + dir});
      }
      return r;
    }

  };

}]);
