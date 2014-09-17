// http://stackoverflow.com/questions/13567312/working-project-structure-that-uses-grunt-js-to-combine-javascript-files-using-r
var fs = require("fs");
var path = require('path');

/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        lint: {
            files: ['grunt.js', 'src/**/*.js', 'tests/**/*.js']
        },
        mocha: {
            test: {
                src: ['tests/index.html'],
                options: {
                    run: true,
                }
            },
        },
        express: {
            custom: {
                options: {
                    hostname: '0.0.0.0',
                    port: 3000,
                    base: '.',
                    debug: true,
                }
            }
        },
        uglify: {
            shim: {
                files: {
                    'ga-shim.min.js': ['ga-shim.js']
                }
            }
        },
        watch: {
            files: ["ga-shim.js"],
            tasks: ['build'],
        },
    });
    
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-saucelabs');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['mocha']);
    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('serve', ['build', 'express', 'watch']);
};
