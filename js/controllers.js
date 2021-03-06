

$(document).ready( function() {
  console.log("Splitting the panel");
  $('div.split-pane').splitPane();
});

console.log("Declaring registerView() global function");
window.registerView = function(view){  // API this function is called from <view-folder>/view.js to register a view
  var viewManager = angular.module('tyleApp').$injector.get('viewMngr');
  viewManager.addView(view);
};

var CONTEXT = (typeof require == 'function' ? 'NODE-WEBKIT' : 'BROWSER');

// ANGULAR APP

var app = angular.module('tyleApp',['ngStorage']);

// Navigation controller
app.controller('NavCtrl', ['$scope', '$rootScope', '$localStorage', '$sessionStorage', 'local-adapter', 'http-adapter', 'log',
    function($scope, $rootScope, $localStorage, $sessionStorage, local, http, log) {

  var nav = this;

  nav.protocols = [
    local, http,
    {name:'FTP', value:'ftp', disabled:true, defaultPath:''},
    {name:'SSH', value:'ssh', disabled:true, defaultPath:''}
  ];
  var protocol = nav.protocols.filter(function(p){return p.default;})[0];
  nav.protocol = protocol.value;

  console.log("Initilializing Nav controller with url: "+protocol.defaultPath);
  $scope.$storage = $localStorage.$default({prev_urls : [protocol.defaultPath]});

  nav.go = function() {
    log.info("User clicked go! with url: "+nav.url);
    if(nav.url!==''){
      var history = $scope.$storage.prev_urls;  // Logics to keep urls in history
      for(var i=0; i<history.length; i++){
        if(history[i]===nav.url){
          history.splice(i,1);
          break;
        }
      }
      history.unshift(nav.url);
      if(history.length>10){
        history.pop();
      }

      var protocol = nav.protocols.filter(function(p){return nav.protocol===p.value;})[0];
      $rootScope.$emit('newurl', {url : nav.url, protocol: protocol});
    }
  };

  // Init
  nav.url = $scope.$storage.prev_urls[0];
  setTimeout(nav.go,0);
}])

// Main View controller
.controller('TyleGroupsCtrl', ['$scope','$rootScope','xml-parser','logger',
function($scope, $rootScope, getParser, logger){

  $scope.alltylegroups = [];

  $rootScope.$on('fileselected', function(event, file){   // File selected by user (event triggered by components/filetree)

    var log = new logger.Log();

    var parser = getParser(log, function(error, data){  // Parse the file

      log.info('Parsing of '+file.url+' finished');
      if(error)
        log.error('There were some errors when reading: '+file.url);

      data.tyles.forEach(function(t){
        try{
          t.views = t.getViews(data.views, log);  // Build views
        }catch(ex){
          t.views = {};
        }
      });
      var tylegroup = {                         // Build tylegroup
        data: data,
        log: log.getEvents("warn"),
        file: file.url,
        filter: "",
        applyFilter: function(){
          this.data.tyles.forEach(function(tyle){
            tyle.filtered = ! tyle.get('name').value.toLowerCase().includes(this.filter.toLowerCase());
          }, this);
        },
        close: function(){
          $scope.alltylegroups.splice($scope.alltylegroups.indexOf(this),1);
        }
      };

      if(getTylegroup(file.url))
        removeTylegroup(file.url);

      $scope.alltylegroups.push(tylegroup);     // Add the tylegroup to the scope
      $scope.$apply();                          // Apply the scope

    });// end callback

    parser.write(file.contents.toString()).close();

  }); // end on

  function getTylegroup(file){
    return $scope.alltylegroups.filter(function(tylegroup){
      return file === tylegroup.file;
    })[0];
  }

  function removeTylegroup(file){
    getTylegroup(file).close();
  }

}]) // end controller


// Footer controller
.controller('FooterCtrl', ['$scope',function($scope){

  $scope.libs = [];

  if(CONTEXT==='NODE-WEBKIT'){
    $scope.libs.push({name: 'node', version: process.versions.node});
    $scope.libs.push({name: "chromium", version: process.versions.chromium});
    $scope.libs.push({name: "nw", version: process.versions["node-webkit"]});
    $scope.error = false;

    process.on('uncaughtException', function(error) {
      $scope.error = true;
      $scope.$apply();
      alert(error);
    });

    $scope.debug = function(){
      require('nw.gui').Window.get().showDevTools();    // TODO: Remove this as not available in pure webkit context
      $scope.error = false;
    };
  }
  $scope.libs.push({name: "angular", version: angular.version.full});
  $scope.libs.push({name: "jquery", version: $.fn.jquery});



}]);
