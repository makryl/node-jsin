/**
 * https://github.com/Aequiternus/node-jsin
 * v 0.1.5
 *
 * Copyright © 2014 Maksim Krylosov <Aequiternus@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

exports.include = include;
exports.render = render;

var compiler = require('./compiler');
var compile = compiler.compile;
var compiled = compiler.compiled;
var setDirectory = compiler.setDirectory;
var context = require('./context');

exports.context = context;
exports.compile = compile;
exports.compiled = compiled;
exports.setDirectory = setDirectory;

function include(template, data, callback) {
    compile(template, function() {
        render(template, data, callback);
    });
}

function render(template, data, callback) {
    template = template.replace(/\.jsin$/, '');

    if ('function' === typeof data) {
        callback = data;
        delete data;
    }

    try {
        if (!compiled[template]) {
            throw new Error('Template not compiled: ' + template);
        } else if ('function' !== typeof compiled[template]) {
            throw compiled[template];
        } else {
            var ctx = new context(data, callback);
            compiled[template].call(ctx);
            return ctx.return();
        }
    } catch (err) {
        if (callback) {
            callback(err);
        }
    }
}
