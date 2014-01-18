exports.include = include;
exports.render = render;

var compile = require('./compiler').compile;
var compiled = require('./compiler').compiled;
var context = require('./context');

exports.context = context;
exports.compile = compile;
exports.compiled = compiled;

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
