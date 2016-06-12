var gulp = require("gulp"),
    less =  require("gulp-less"),
    path = require("path");

gulp.task("less", function(){
    gulp.src("app/less/**/*.less")
        .pipe(less({
            paths: [
                path.join(__dirname, "app", "less", "includes")
            ]
        }))
        .pipe(gulp.dest("dist/css"));
});

gulp.task("js", function(){
    gulp.src("app/js/**/*.js")
        .pipe(gulp.dest("dist/js"));
});

gulp.task("html", function(){
    gulp.src("app/**/*.html")
        .pipe(gulp.dest("dist"));
});

gulp.task("default", [
    "js", "less", "html"
]);