#!/usr/bin/env node

/**
 * https://github.com/Aequiternus/node-jsin
 * v 0.1.0
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
if ('-b' === process.argv[i]) {
    needBeautify = true;
    i++;
}

var needUglify = false;
if ('-u' === process.argv[i]) {
    needUglify = true;
    i++;
}

var files = [];
while (i < process.argv.length - 1) {
    files.push(process.argv[i++]);
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

    code = "(function(w){\n\n";

    code += "var compiled = {\n";
    for (var name in jsin.compiled) {
        code += "'" + name + "': " + jsin.compiled[name] + ",\n";
    }
    code = code
        .substr(0, code.length - 2)
        .replace(/ anonymous/g, '')
        + "\n};\n\n";

    code += jsin.render.toString()
        .replace('function render(', 'function include(');

    var find = "/* BROWSER COMPATIBLE */";
    code += contextCode
        .substr(contextCode.indexOf(find) + find.length);

    code += "\nw.jsin = {include: include, context: context};\n\n})(window);\n";

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
