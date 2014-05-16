#!/usr/bin/env node

/**
 * Copyright © 2014 Maksim Krylosov <Aequiternus@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var fs          = require('fs');
var jsin        = require('./index');

var i = 0;

if (process.argv[i++].match(/node$/)) {
    i++;
}

var directory = false;
var templatesOnly = false;
var needBeautify = false;
var needUglify = false;
var files = [];

var opts = true;
var l = process.argv.length - 1;
while (i < l) {
    var v = process.argv[i++];
    if (opts) {
        switch (v) {
            case '-d':
                directory = process.argv[i++];
                continue;
            case '-t':
                templatesOnly = true;
                continue;
            case '-b':
                needBeautify = true;
                continue;
            case '-u':
                needUglify = true;
                continue;
            default:
                opts = false;
        }
    }
    files.push(v);
}

var outfile = process.argv[i++];

var code;
var contextCode;
var pending = 1;

var tasks = [
    prepare,
    compileTemplates,
    compileDirectory,
    compileForBrowser,
    beautifyCode,
    uglifyCode,
    save
];

next();

function next() {
    if (0 === --pending) {
        tasks.shift()(tasks);
    }
}

function prepare() {
    ++pending;
    console.log('Preparing: context.js');

    fs.readFile(__dirname + '/context.js', function (err, res) {
        if (err) {
            console.log('Error preparing: ' + err);
        } else {
            contextCode = res.toString();
            next();
        }
    });
}

function compileTemplates() {
    ++pending;

    if (files.length) {
        console.log('Compiling templates:');
        files.forEach(compileTemplate);
    }

    next();
}

function compileTemplate(file) {
    ++pending;
    jsin.compile(file, function(err) {
        if (err) {
            console.log('    Error compiling: ' + err);
        } else {
            console.log('    ' + file);
            next();
        }
    });
}

function compileDirectory() {
    ++pending;

    if (directory) {
        console.log('Compiling directory: ' + directory);
        jsin.setDirectory(directory);
        readDirectory(directory);
    }

    next();
}

function readDirectory(dir) {
    ++pending;
    fs.readdir(dir, function(err, list) {
        if (err) {
            console.log('    Error reading directory: ' + err);
        } else {
            list.forEach(function(file) {
                file = dir + '/' + file;
                ++pending;
                fs.stat(file, function(err, stat) {
                    if (err) {
                        console.log('    Error reading stats: ' + err);
                    } else {
                        if (stat.isDirectory()) {
                            readDirectory(file);
                        } else if (file.match(/\.jsin$/)) {
                            compileTemplate(file.substr(directory.length + 1));
                        }
                        next();
                    }
                });
            });
            next();
        }
    });
}

function compileForBrowser() {
    ++pending;
    console.log('Compiling for browser');

    code = "(function(w){\n\nif (!w.jsin) w.jsin = {compiled: {}};\n\n";

    for (var name in jsin.compiled) {
        code += "w.jsin.compiled['" + name + "'] = "
            + jsin.compiled[name].toString().replace(/ anonymous/g, '') + ";\n\n";
    }

    if (!templatesOnly) {
        code += "var compiled = jsin.compiled;\n\n";

        code += jsin.render.toString().replace('function render(', 'function include(');

        var find = "/* BROWSER COMPATIBLE */";
        code += contextCode.substr(contextCode.indexOf(find) + find.length);

        code += "\nw.jsin.include = include;\nw.jsin.context = context;\n\n";
    }

    code += "})(window);\n";

    next();
}

function beautifyCode() {
    ++pending;

    if (needBeautify) {
        console.log('Beautifying');

        var beautify = require('js-beautify').js_beautify;

        code = beautify(code);
    }

    next();
}

function uglifyCode() {
    ++pending;

    if (needUglify) {
        console.log('Uglifying');

        var uglify = require("uglify-js");

        var ast = uglify.parser.parse(code);
        ast = uglify.uglify.ast_mangle(ast);
        ast = uglify.uglify.ast_squeeze(ast);
        code = uglify.uglify.gen_code(ast);
    }

    next();
}

function save() {
    console.log('Saving: ' + outfile);

    code = "/* Compiled with jsinc v " + require('./package.json').version + " */\n" + code;

    fs.writeFile(outfile, code, function(err) {
        if (err) {
            console.log('Error saving: ' + err);
        } else {
            console.log('Done!');
        }
    });
}
