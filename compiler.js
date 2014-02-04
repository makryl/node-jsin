/**
 * Copyright © 2014 Maksim Krylosov <Aequiternus@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var compiled = {};
var mtime = {};
var directory = '';

exports.compile = compile;
exports.compiled = compiled;
exports.setDirectory = setDirectory;

var fs = require('fs');

function setDirectory(dir) {
    directory = dir;
}

function compile(template, callback) {
    template = template.replace(/\.jsin$/, '');

    var templatePath = template + '.jsin';
    if (directory && !template.match(/^\.?\//)) {
        templatePath = directory + '/' + templatePath;
    }

    if (compiled[template]) {
        callback();

        fs.stat(templatePath, function(err, stats) {
            if (err) return;
            var t = stats.mtime.getTime();
            if (mtime[template]) {
                if (mtime[template] < t) {
                    delete compiled[template];
                }
            } else {
                mtime[template] = t;
            }
        });
    } else {
        fs.readFile(templatePath, function(err, res) {
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
        var p2 = p + 2,
            c2 = tpl[p2],
            p3 = p + 3,
            c3 = tpl[p3];
        if ('=' === c2) {
            addOutput(code, tpl.substr(0, p));
            code.push("print(");
            tpl = closeTag(code, tpl.substr(p3));
            code.push(");\n");
        } else if (('h' === c2 || 's' === c2) && '=' === c3) {
            addOutput(code, tpl.substr(0, p));
            code.push("print" + c2 + "(");
            tpl = closeTag(code, tpl.substr(p + 4));
            code.push(");\n");
        } else if ('j' === c2 && 's' === c3) {
            addOutput(code, tpl.substr(0, p).replace(/[ \t]+$/, '')); // eat leading space
            tpl = closeTag(code, tpl.substr(p + 4), true);
            code.push(";\n");
        } else {
            addOutput(code, tpl.substr(0, p2));
            tpl = tpl.substr(p2);
        }
    }
    if (tpl) {
        addOutput(code, tpl);
    }
    code.push("}}");

//    console.log(code.join(''));
    return new Function(code.join(''));
}

var eos = {
    "\\": "\\\\",
    "\n": "\\n",
    "\r": "\\r",
    '"': '\\"'
};

function eo(s) {
    return eos[s] || s;
}

function addOutput(code, string) {
    if ('' !== string) {
        code.push(
            "print(\""
            + string.replace(/[\\\n\r"]/g, eo)
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
