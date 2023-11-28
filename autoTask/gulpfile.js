const path = require("path")
const fs = require('fs')
const gulp = require("gulp")
const webpack = require('webpack')
const clean = require('gulp-clean')
const tap = require('gulp-tap')
const del = require('del')
const bom = require('gulp-bom')
//const runSequence = require('gulp-run-sequence')
const runSequence = require('run-sequence')
// 用于监听文件,自动生成刷新
// const browserSync = require('browser-sync')
// const reload = browserSync.reload

const webpackConfig = require('./webpack.config.js')
const prodWPCofnig = require('./webpack.prod.conf.js')

gulp.task('webpack', function (cb) {
    return webpack(webpackConfig, (err, status) => {
        if (err)
            console.error(err)
        cb(err)
    })
})

gulp.task('clean', function () {
    return del(['dist/**/*', '!dist/index.html'])
})

// gulp.task('reload', reload)

// gulp.task('server', function () {
//     browserSync({
//         server: {
//             baseDir: 'dist'
//         }
//     })
//
//     gulp.watch('src/**', ['build'])
// })

// gulp.task('server:proxy', function () {
//     browserSync({
//         proxy: "http://192.168.36.132:3005/"
//     })
//
//     gulp.watch('src/*.html', reload)
// })

gulp.task('build', function (cb) {
    runSequence('clean', 'webpack', 'reload', cb)
})

gulp.task('build:aspx', function (cb) {
    return gulp.src('src/index.aspx')
        .pipe(tap(function (file) {
            let aspxStr = file.contents.toString()
            let htmlStr = fs.readFileSync(path.join(__dirname, 'dist/index.html'), 'utf-8')
            let contents = aspxStr + htmlStr
            file.contents = new Buffer(contents)
        }))
        .pipe(bom())
        .pipe(gulp.dest(__dirname + '/dist'))
})

gulp.task('pub:webpack', function (cb) {
    return webpack(prodWPCofnig, (err, status) => {
        if (err)
            console.error(err)

        cb(err)
    })
})

gulp.task('copy:static', function () {
    return gulp.src(['dist/**/*', '!dist/*.aspx'])
        .pipe(gulp.dest(path.resolve('Z:/QYWX/Test/2018liveadmin')))
})

gulp.task('copy:aspx', function () {
    return gulp.src('dist/*.aspx')
        .pipe(bom())
        .pipe(gulp.dest(path.resolve('Z:/QYWX/Test/2018liveadmin')))
})

gulp.task('public', function (cb) {
    runSequence('clean', 'pub:webpack', 'build:aspx', ['copy:static', 'copy:aspx'], cb)
})