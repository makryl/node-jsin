#!/usr/bin/env node

/**
 * https://github.com/Aequiternus/node-jsin
 * v 0.1.3
 *
 * Copyright © 2014 Krylosov Maksim <Aequiternus@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var fs          = require('fs');
var jsin        = require('./index');

var i = 0;

if ('node' === process.argv[i++]) {
    i++;
}

var needBeautify = false;
var needUglify = false;
var templatesOnly = false;
var files = [];

var opts = true;
var l = process.argv.length - 1;
while (i < l) {
    var v = process.argv[i++];
    if (opts) {
        switch (v) {
            case '-b':
                needBeautify = true;
                continue;
            case '-u':
                needUglify = true;
                continue;
            case '-t':
                templatesOnly = true;
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

var tasks = [
    prepare,
    compileTemplates,
    compileForBrowser,
    beautifyCode,
    uglifyCode,
    save
];

next();

function next() {
    tasks.shift()(tasks);
}

function prepare() {
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
    console.log('Compiling templates:');

    var i = 0;
    files.forEach(function(file) {
        jsin.compile(file, function(err) {
            if (err) {
                console.log('Error compiling: ' + err);
            } else {
                console.log('   [' + ++i + '/' + files.length + '] ' + file);
                if (i === files.length) {
                    next();
                }
            }
        });
    });
}

function compileForBrowser() {
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
    if (needBeautify) {
        console.log('Beautifying');

        var beautify = require('js-beautify').js_beautify;

        code = beautify(code);
    }

    next();
}

function uglifyCode() {
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

    fs.writeFile(outfile, code, function(err) {
        if (err) {
            console.log('Error saving: ' + err);
        } else {
            console.log('Done!');
        }
    });
}
