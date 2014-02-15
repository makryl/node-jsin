/**
 * Copyright © 2014 Maksim Krylosov <Aequiternus@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

exports.include = include;
exports.render = render;

var compiler = require('./compiler');
var compiled = compiler.compiled;
var context = require('./context');

exports.context = context;
exports.compile = compiler.compile;
exports.compiled = compiler.compiled;
exports.setDirectory = compiler.setDirectory;
exports.clear = compiler.clear;

function include(template, data, callback) {
    compiler.compile(template, function() {
        render(template, data, callback);
    });
}

function render(template, data, callback) {
    template = template.replace(/\.jsin$/, '');

    if ('function' === typeof data) {
        callback = data;
        data = null;
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
