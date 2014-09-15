'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var lr = require('tiny-lr');
var server = lr();

var runSequence = require('run-sequence');

var sections = ['anonymous'];

sections.forEach(function(section) {
  gulp.task(section, function() {

  return gulp.src(['./client/' + section + '/' + section + '.js'])
/*
      .pipe(plugins.plumber(true))
*/
      .pipe(plugins.browserify({
        insertGlobals: true,
        debug: true
      }).on('error', function() {
        plugins.util.log(plugins.util.colors.red('**************** ERROR ****************'), arguments);
        //cb();
      }))
      .pipe(plugins.rename(section + '.js'))
      .pipe(gulp.dest('./client/www/js'))
      ;
  });
});


gulp.task('lr-server', function() {
  server.listen(35729, function(err) {
    if (err) {
      plugins.util.log(plugins.util.colors.red('ERROR'), err);
    }
  });
});

gulp.task('html', function() {
  gulp.src(['./client/www/*.html'])
    .pipe(plugins.livereload(server));
});


gulp.task('nodemon', function() {
  //    nodeArgs: ['--debug']

  plugins.nodemon({
    verbose: true,
    script: 'server/server.js',
    ext: 'js coffee',
    watch: ['server'],
    ignore: ['server/.DS_Store'],
    env: { 'NODE_ENV': 'development' }
  })
    .on('restart', function() {
      console.log('server restarted!');
      setTimeout(function(){
        runSequence(['nglb']);
      }, 2000);
    });
//  spawn('./node_modules/.bin/nodemon', ['--debug', '--watch', 'server', 'server/server.js', '--ext', 'js,coffee'], {
//    stdio: 'inherit'
//  })
//    .on('close', function() {
//      cb();
//    });
});

gulp.task('default', function() {

  plugins.util.log(plugins.util.colors.green('Default'), plugins.util.env);

  runSequence(['nglb', 'libs', 'lr-server', 'nodemon'].concat(sections));

  gulp.watch('./client/common/**/*.js', function() {
    plugins.util.log(plugins.util.colors.cyan('common'), 'changed');
    runSequence(sections.slice(0));
  });

  sections.forEach(function(section) {
    gulp.watch('./client/' +
      section +
      '/**/*.js', function() {
      plugins.util.log(plugins.util.colors.cyan(section), 'changed');
      runSequence(section);
    });
  });

  gulp.watch('./client/www/css/**/*.css', function(evt) {
    plugins.util.log(plugins.util.colors.cyan('css'), 'changed');
    server.changed({
      body: {
        files: [evt.path]
      }
    });
  });

  gulp.watch('./client/www/js/*.js', function(evt) {
    plugins.util.log(plugins.util.colors.cyan('js'), 'changed', plugins.util.colors.gray(evt.path));
    server.changed({
      body: {
        files: [evt.path]
      }
    });
  });

  gulp.watch('./client/www/**/*.html', function(evt) {
    plugins.util.log(plugins.util.colors.cyan('html'), 'changed', plugins.util.colors.gray(evt.path));
    server.changed({
      body: {
        files: [evt.path]
      }
    });
  });

});

console.dir(plugins);

var loopbackAngular = plugins.loopbackSdkAngular;

gulp.task('nglb', function () {
  plugins.util.log(plugins.util.colors.blue('nglb'));
  return gulp.src('./server/server.js')
    .pipe(loopbackAngular())
    .pipe(plugins.rename('lb-services.js'))
    .pipe(gulp.dest('./client/www/js'));
});

gulp.task('libs', function() {

  plugins.util.log(plugins.util.colors.blue('libs'));

  //var filesize = require('gulp-filesize');

  return gulp.src([
      './client/www/lib/ionic/release/js/ionic.js',
      './client/www/lib/angular/angular.js',
      './client/www/lib/angular-upload/angular-upload.js',
      './client/www/lib/angular-animate/angular-animate.js',
      './client/www/lib/angular-touch/angular-touch.js',
      './client/www/lib/angular-cookies/angular-cookies.js',
      './client/www/lib/angular-sanitize/angular-sanitize.js',
      './client/www/lib/angular-resource/angular-resource.js',
      './client/www/lib/angular-ui-router/release/angular-ui-router.js',
      './client/www/lib/ionic/release/js/ionic-angular.js'
    ]
  )
    .pipe(plugins.concat('libs.js'))
    .pipe(gulp.dest('./client/www/js'))
    .pipe(plugins.size())
    .pipe(plugins.uglify({
      outSourceMap: false,
      preserveComments: function() {
        return false;
      }
    }))
    .pipe(plugins.rename('libs.min.js'))
    .pipe(gulp.dest('./client/www/js'))
    .pipe(plugins.size())
    .on('error', function(err){
      throw err;
    })
    ;
});

gulp.task('build', function() {

  plugins.util.env.build = true;

  plugins.util.log(plugins.util.colors.green('Build'), plugins.util.env);

  runSequence('nglb', 'libs', sections);

});