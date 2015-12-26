'use strict';
gulp.task('build',   [
  'jade',
  'styl',
  'coffee',
  'babel',
  'sprite'
], copy);
gulp.task('sync',    ['build', 'serv'] , watch);
gulp.task('default', ['sync']);

gulp.task('jade', jade);
gulp.task('styl', styl);
gulp.task('coffee', coffee);
gulp.task('babel', babel);
gulp.task('copy', copy);
gulp.task('sprite', sprite);
gulp.task('conv', conv);
gulp.task('capture', capture);

gulp.task('nil', nil);
gulp.task('watch', watch);
gulp.task('serv', bsInit);
gulp.task('serv:reload', bsReload);

import path from 'path';
import gulp from 'gulp';
import gIf from 'gulp-if';
import gPlumber from 'gulp-plumber';
import gNotify from 'gulp-notify';
import gStyl from 'gulp-stylus';
import gJade from 'gulp-jade';
import gCssnext from 'gulp-cssnext';
import gCoffee from 'gulp-coffee';
import gBabel from 'gulp-babel';
import gSprite from 'gulp.spritesmith';
import gRename from 'gulp-rename';
import gConv from 'gulp-convert-encoding';
import gReplace from 'gulp-replace';
import gWebshot from 'gulp-webshot';
import browserSync from 'browser-sync';
import conf from './gulpconf.json';

var isProd = false;
var root = process.cwd();
var bs = null;

function jade () {
  let srcPath = [
    path.join('!' + conf.general.srcPath, "__partials/**/*.jade"),
    path.join(conf.general.srcPath, "**/!(_)*.jade")
  ];
  let options = Object.assign(conf.jade.options, {
    "basedir": conf.general.srcPath
  });

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gJade(options))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function styl () {
  let srcPath = [
    path.join(conf.general.srcPath, "**/!(_)*.styl")
  ];
  let options = Object.assign(conf.styl.options, {
  });

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gStyl(options))
    .pipe(gCssnext())
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function coffee () {
  let srcPath = [
    path.join(conf.general.srcPath, "**/!(_)*.coffee")
  ];
  let options = Object.assign(conf.coffee.options, {
  });

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gCoffee(options))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function babel () {
  let srcPath = [
    path.join(conf.general.srcPath, "**/!(_)*.babel.js")
  ];
  let options = Object.assign(conf.babel.options, {
  });

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gBabel(options))
    .pipe(gRename((path) => {
      path.basename = path.basename.replace(/\.babel$/, '');
    }))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function copy () {
  let srcPath = [
    path.join('!' + conf.general.srcPath, "**/*.babel.js"),
    path.join(conf.general.srcPath, "**/*." + conf.copy.options.ext)
  ];
  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function sprite () {
  let srcPath = [
    path.join(conf.general.resPath, "**/*.{jpeg,jpg,gif,png}")
  ];
  let imgSheetPath = path.join(conf.general.srcPath, 'assets/css/');
  let cssSheetPath = path.join(conf.general.srcPath, 'assets/css/');
  let options = Object.assign(conf.sprite.options, {});
  let sprite = gulp.src(srcPath)
    .pipe(notify())
    .pipe(gSprite(options));

  sprite.img.pipe(gulp.dest(imgSheetPath));
  sprite.css.pipe(gulp.dest(cssSheetPath));
}

function watch () {
  let srcPath = conf.general.srcPath;
  let resPath = conf.general.resPath;
  let options = conf.watch.options;
  let reload = bs ? 'serv:reload' : 'nil';
  gulp.watch(path.join(srcPath, '**', '*' + options.jade),   ['jade', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.styl),   ['styl', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.coffee), ['coffee', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.babel),  ['babel', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.files),  ['copy', reload]);
  gulp.watch(path.join(resPath, '**', '*' + options.sprite), ['sprite', 'copy', reload]);
}

function bsInit () {
  let options = Object.assign(conf.browserSync.options, {
    "server": {
      "baseDir": conf.general.dstPath
    }
  });
  bs = browserSync.init(options);
}

function notify () {
  return gPlumber({errorHandler: gNotify.onError("Error: <%= error.message %>")});
}

function conv () {
  let srcPath = [
    path.join(conf.general.dstPath, "**/*.{html,htm}")
  ];
  let options = Object.assign(conf.conv.options, {
  });
  let pattern = new RegExp(conf.conv.pattern);

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gReplace(pattern, conf.conv.replace))
    .pipe(gConv(options))
    .pipe(gulp.dest(conf.general.dstPath, {overwrite: true}))
  ;
}

function capture () {
  let srcPath = [
    path.join(conf.general.dstPath, "**/*.{html,htm}")
  ];
  let options = Object.assign(conf.capture.options, {
    dest: "capture"
  });
  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gWebshot(options))
  ;
}

function production () { isProd = true }
function bsReload () { bs.reload() }
function nil () {}
