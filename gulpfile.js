var NwBuilder = require('node-webkit-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');
var zip = require('gulp-zip');

var platforms = [];

// Which platforms should we build
if (process.argv.indexOf('--win32') > -1)     platforms.push('win32');
if (process.argv.indexOf('--win64') > -1)     platforms.push('win64');
if (process.argv.indexOf('--osx32') > -1)     platforms.push('osx32');
if (process.argv.indexOf('--osx64') > -1)     platforms.push('osx64');
if (process.argv.indexOf('--linux32') > -1)   platforms.push('linux32');
if (process.argv.indexOf('--linux64') > -1)   platforms.push('linux64');

// Build for All platforms
if (process.argv.indexOf('--all') > -1 || platforms.length===0) platforms = [ 'win32', 'win64', 'osx32', 'osx64', 'linux32', 'linux64' ];

gutil.log("Building Tyle for: "+platforms.join(", "));

// Read package.json
var package = require('./package.json');


gulp.task('nw', function () {

  // Find out which modules to include
  var modules = Object.keys(package.dependencies).map(function(m) { return './node_modules/'+m+'/**/*'; });

  var nw = new NwBuilder({
    version: '0.12.2', // override version so it stops trying to download the latest
    files: [ './css/**/*', './html/**/*', './img/**/*', './js/**/*', './views/**/*', './index.html', './package.json'].concat(modules),
    platforms: platforms,
    buildDir: './build',
    cacheDir: './build/cache',
    //winIco: './img/tile.png'
  });

  // Log stuff you want
  nw.on('log', function (msg) {
    gutil.log('node-webkit-builder', msg);
  });
  // Build returns a promise, return it so the task isn't called in parallel
  return nw.build().catch(function (err) {
    gutil.log('node-webkit-builder', err);
  });
});


platforms.forEach(function(platform){

  gulp.task('copyTest_'+platform, ['nw'], function(){
    return gulp.src(['./test/**/*.xml']).pipe(gulp.dest('./build/tyle/'+platform+'/test'));
  });

  gulp.task('zip_'+platform, ['copyTest_'+platform], function () {
    return gulp.src('./build/tyle/'+platform+'/**/*').pipe(zip('tyle-explorer-'+platform+'.zip')).pipe(gulp.dest('./build/tyle'));
  });

});

gulp.task('default', platforms.map(function(p){return "zip_"+p;}));
