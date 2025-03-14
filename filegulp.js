const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync").create();
const eslint = require("gulp-eslint");
const stylelint = require("gulp-stylelint");

//  Compilar archivos SCSS a CSS
function css(done) {
  src("src/scss/app.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(dest("build/css"))
    .pipe(browserSync.stream());
  done();
}

//  Minificar y concatenar archivos JavaScript
function js(done) {
  src("src/js/**/*.js")
    .pipe(concat("app.js"))
    .pipe(uglify())
    .pipe(dest("build/js"))
    .pipe(browserSync.stream());
  done();
}

// Optimizar imágenes
function images(done) {
  src("src/img/**/*").pipe(imagemin()).pipe(dest("build/img"));
  done();
}

// Linting de JavaScript
function lintJs(done) {
  src("src/js/**/*.js")
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  done();
}

//  Linting de CSS/SCSS
function lintCss(done) {
  src("src/scss/**/*.scss").pipe(
    stylelint({
      reporters: [{ formatter: "string", console: true }],
    })
  );
  done();
}

//  Servidor de desarrollo con BrowserSync
function serve(done) {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  done();
}

//  Vigilar cambios en archivos
function watchFiles() {
  watch("src/scss/**/*.scss", series(lintCss, css));
  watch("src/js/**/*.js", series(lintJs, js));
  watch("src/img/**/*", images);
  watch("*.html").on("change", browserSync.reload);
}

// Tareas disponibles
exports.css = css;
exports.js = js;
exports.images = images;
exports.lintJs = lintJs;
exports.lintCss = lintCss;
exports.serve = serve;
exports.watch = watchFiles;

// Tarea por defecto
exports.default = series(parallel(css, js, images), serve, watchFiles);
