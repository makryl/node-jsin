/**
 * https://github.com/Aequiternus/node-jsin
 * v 0.1.1
 *
 * Copyright © 2014 Krylosov Maksim <Aequiternus@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var compiled = {};

exports.compile = compile;
exports.compiled = compiled;

var fs = require('fs');

function compile(template, callback) {
    template = template.replace(/\.js(in)?$/, '');

    if (compiled[template]) {
        callback();
    } else {
        fs.readFile(template + '.jsin', function(err, res) {
            try {
                if (err) throw err;
                compiled[template] = compileCode(res.toString());
                callback();
            } catch (err) {
                compiled[template] = err;
                callback(err);
            }
        });
    }
}

function compileCode(tpl) {
    var p,
        code = [];

    code.push("with(this){with(__data){\n");

    while (-1 !== (p = tpl.indexOf('<?'))) {
        if ('=' === tpl[p + 2]) {
            addOutput(code, tpl.substr(0, p));
            code.push("print(");
            tpl = closeTag(code, tpl.substr(p + 3));
            code.push(");\n");
        } else if ('js' === tpl.substr(p + 2, 2)) {
            addOutput(code, tpl.substr(0, p).replace(/ *$/, '')); // eat leading space
            tpl = closeTag(code, tpl.substr(p + 4), true);
            code.push(";\n");
        } else {
            addOutput(code, tpl.substr(0, p + 2));
            tpl = tpl.substr(p + 2);
        }
    }
    if (tpl) {
        addOutput(code, tpl);
    }
    code.push("}}");

//    console.log(code.join(''));
    return new Function(code.join(''));
}

function addOutput(code, string) {
    if ('' !== string) {
        code.push(
            "print(\""
            + string
                .replace(/\\/g, '\\\\')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/"/g, '\\"')
            + "\");\n"
        );
    }
}

function closeTag(code, tpl, eatNewLine) {
    var p;

    while (-1 !== (p = tpl.search(/('|"|\?\>)/))) {
        code.push(tpl.substr(0, p).trim());
        var q = tpl[p];
        tpl = tpl.substr(p + 1);
        if (
            "'" === q ||
            '"' === q
        ) {
            code.push(q);
            while (-1 !== (p = tpl.indexOf(q))) {
                code.push(tpl.substr(0, p + 1).trim());
                var s = tpl[p - 1];
                tpl = tpl.substr(p + 1);
                if ('\\' !== s) {
                    break;
                }
            }
            if (-1 === p) {
                throw new Error(
                    'Syntax error, unexpected end, closing quote not found near "'
                    + tpl.substr(0, 20) + '"'
                );
            }
        } else {
            if (eatNewLine && "\n" === tpl[1]) {
                tpl = tpl.substr(2);
            } else {
                tpl = tpl.substr(1);
            }
            break;
        }
    }
    if (-1 === p) {
        code.push(tpl.trim());
        tpl = '';
    }

    return tpl;
}
