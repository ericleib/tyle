
app.directive('filetree', ['$rootScope',function($rootScope){
  return {
    restrict: 'A',
    link: function(scope, element, attrs){

      $rootScope.$on('newurl', function(event, data){
        console.log("url changed! "+data.url);
        console.log("protocol: "+data.protocol.name);

        $(element).fileTree(
          { root: data.url }, // Options
          function(url) {     // Callback when a file is selected
            data.protocol.read(url, function(err, contents){
              $rootScope.$emit('fileselected', {url: url, contents: contents});
            });
          },
      		data.protocol.getDirectoryContent  // Return contents of a directory
        );

        console.log("Open files in root dir");
        data.protocol.getDirectoryContent(data.url, function(dircontent){
          dircontent
          .filter(function(entry){ return entry.type==='file'; })
          .forEach(function(file){
            data.protocol.read(file.path, function(err, contents){
              $rootScope.$emit('fileselected', {url: file.path, contents: contents});
            });
          });
        });

      });

    }
  };
}])

.directive('tyle', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {tyleTitle: '@', tyleName: '@'},
    controller: function($scope, $element) {
      $scope.panes = [];
      $scope.fullscreen = false;

      $scope.toggleFullScreen = function(e){
        $scope.fullscreen = !$scope.fullscreen;
        $scope.$broadcast('fullscreen');
        setTimeout(function () { $('#right-component').scrollTop($(e.target).offset().top-50); }, 0);
      };

      $scope.select = function(pane) {
        angular.forEach($scope.panes, function(p) {
          p.paneSelected = false;
        });
        pane.paneSelected = true;
      };

      this.addPane = function(pane) {
        $scope.select(pane);
        $scope.panes.push(pane);
      };
    },
    templateUrl: "./html/tyle.html"
  };
})

.directive('pane', function() {
  return {
    require: '^tyle',
    restrict: 'E',
    transclude: true,
    scope: { paneTitle: '@', paneDescription: '@', paneSelected: '=' },
    link: function(scope, element, attrs, tyleController) {
      tyleController.addPane(scope);
    },
    templateUrl: './html/pane.html',
    replace: true
  };
})

.directive('dynamicView', ['scriptMngr','viewMngr','log',
function(scriptMngr, viewMngr, log) {
  return {
    //require: '^pane', // Work only if there is a controller ?
    restrict: 'A',
    scope: {
      dynamicView: '&dynamicView',  // &: to define one-way bind - =: to define two-way bind - @: to return text value
      tyle : '&'
    },

    link: function(scope, element, attrs){
      var view = scope.dynamicView();      // view contains the engine, and the data
      var tyle = scope.tyle();
      var name = view.engine.getName();  // e.g. xy-graph
      var req = view.engine.require; // e.g. charts
      var path = 'views'+'/'+req+'/'+'view.js';

      scriptMngr.loadScript(path, function(){
        var engine = viewMngr.getView(name);
        if(typeof engine === 'undefined')
          throw "View "+name+" could not be found";// in "+path;
        else{
          log.info("Preparing to render view "+name);
          scriptMngr.loadCSS(engine.dependencies.css);
          scriptMngr.loadScripts(engine.dependencies.javascript, function(){ // OK, we have an engine, but maybe it has dependencies which have not been loaded yet
            log.info("Ready to render view "+name);
            setTimeout(function () {
              engine.render(scope, element, view); // An engine creates a view at the given element
            }, 0);
            log.info("Finished rendering view "+name);
          });
        }
      });
    },

  };
}])

.directive('tooltip', function () {
    return {
        restrict:'A',
        scope: {placement: '@'},
        link: function(scope, element, attrs)
        {
            $(element)
                .attr('title',scope.$eval(attrs.tooltip))
                .tooltip({placement: scope.placement});
        }
    };
});
