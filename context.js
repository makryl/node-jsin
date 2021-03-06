/**
 * Copyright © 2014 Maksim Krylosov <Aequiternus@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

module.exports = context;

var include = require('./index').include;

/* BROWSER COMPATIBLE */

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

var ehs = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
};

var ehas = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;'
};

function eh(s) {
    return ehs[s] || s;
}

function eha(s) {
    return ehas[s] || s;
}

context.prototype.printh = function(string, apos) {
    if ('undefined' !== typeof string) {
        if (apos) {
            this.print(string.replace(/[&<>']/g, eha));
        } else {
            this.print(string.replace(/[&<>"]/g, eh));
        }
    }
};

var ess = {
    "\\": "\\\\",
    "\n": "\\n",
    "\r": "\\r",
    '"': '\\"',
    "'": "\\'"
};

function es(s) {
    return ess[s] || s;
}

context.prototype.prints = function(string) {
    if ('undefined' !== typeof string) {
        this.print(string.replace(/[\\\n\r"']/g, es));
    }
}

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

    if (data.excludeLayout && -1 !== data.excludeLayout.indexOf(template)) {
        callback();
        return;
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
