(function(w){

if (!w.jsin) w.jsin = {compiled: {}};

w.jsin.compiled['include'] = function() {
with(this){with(__data){
print("<div>\n    <p>Example include with variable ");
print(boo);
print("</p>\n</div>\n");
}}
};

w.jsin.compiled['layout-include-inside'] = function() {
with(this){with(__data){
print("            <div>\n                <p>Example include inside layout with variable ");
print(boo);
print("</p>\n            </div>\n");
}}
};

w.jsin.compiled['layout-include'] = function() {
with(this){with(__data){
print("    <div>\n        <p>Example include in layout with variable ");
print(boo);
print("</p>\n    </div>\n");
}}
};

w.jsin.compiled['layout'] = function() {
with(this){with(__data){
print("<div>\n    <p>Example layout begin with variable ");
print(boo);
print("</p>\n    <div>\n");
contents();
print("    </div>\n");
include('layout-include');
print("    <p>Example layout end</p>\n</div>\n");
}}
};

w.jsin.compiled['mytemplate'] = function() {
with(this){with(__data){
print("<!doctype html>\n    <?");
print("xml encoding=\"utf-8\" ?><!-- indent is not a bug, but check -->\n<h1>Example</h1>\n<p>\n    ");
print("Check ?>'\"special chars and variable "+ boo);
print("\n</p>\n<p>\n");
if (1 === 1) {;
print("        1 === 1\n");
} else {;
print("        1 !== 1\n");
};
print("</p>\n");
include('include');

print("<p>Example print</p>\n");;
layout('layout', function(){;
print("        <div>\n            <p>Example layout inside</p>\n");
include('layout-include-inside');
print("        </div>\n");
});
print("\n<p>Thanx!</p>\n");
}}
};

var compiled = jsin.compiled;

function include(template, data, callback) {
    template = template.replace(/\.js(in)?$/, '');

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

function context(data, callback) {
    this.__data     = data;
    this.__callback = callback;
    this.__result   = [''];
    this.__current  = 0;
    this.__waiting  = 1;
    this.__contents = -1;
}

context.prototype.print = function(string) {
    this.__result[this.__current] += string;
};

context.prototype.include = function(template, data) {
    if (!data) {
        data = this.__data;
    }

    var self = this;
    var inc = this.__hold();

    ++this.__waiting;
    include(template, data, function(err, res) {
        if (err) {
            if (self.__callback) {
                self.__callback(err);
            }
        } else {
            self.__result[inc] = res;
            self.return();
        }
    });
};

context.prototype.layout = function(template, data, callback) {
    if (!callback) {
        callback = data;
        data = this.__data;
    }

    var self = this;
    var bgn = this.__hold();
    callback();
    var end = this.__hold();

    ++this.__waiting;
    include(template, data, function(err, res) {
        if (err) {
            if (self.__callback) {
                self.__callback(err);
            }
        } else {
            self.__result[bgn] = res[0];
            self.__result[end] = res[1];
            self.return();
        }
    });
};

context.prototype.contents = function() {
    this.__contents = ++this.__current;
    this.__result[this.__current] = '';
};

context.prototype.return = function() {
    if (0 === --this.__waiting) {
        var res;
        if (this.__contents >= 0) {
            res = [
                this.__result.splice(0, this.__contents).join(''),
                this.__result.join('')
            ];
        } else {
            res = this.__result.join('');
        }
        if (this.__callback) {
            this.__callback(null, res);
        }
        return res;
    }
};

context.prototype.__hold = function() {
    var ph = ++this.__current;
    this.__result[++this.__current] = '';
    return ph;
};

w.jsin.include = include;
w.jsin.context = context;

})(window);
