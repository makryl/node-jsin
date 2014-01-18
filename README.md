# JSIN - Javascript Include

Template engine for use at server and client side.

## Features

- Well-known PHP-like template tags.
- Accurate quote parsing.
- Asynchronous compiling of templates on the fly.
- Pre-compiling for use in browser.
- Supports includings and layoutings.

## Usage

### Syntax

Constructions:

- `<?js /* any javascript code */ ?>`
- `<?= /* print value or result of expression */ ?>`

Functions:

- `print(string)`
- `include(template, [data])`
- `layout(template, [data], callback)`
- `contents()`

### Example

```html
<!-- mytemplate.jsin -->
<h1>Example</h1>
<p>
    <?= "Check ?>'\" special chars and variable " + boo ?>
</p>
<p>
    <?js if (1 === 1) { ?>
        1 === 1
    <?js } else { ?>
        1 !== 1
    <?js } ?>
</p>
<?js

include('include');

print("<p>Example print</p>\n");

?>
<?js layout('layout', function(){ ?>
        <div>
            <p>Example layout inside</p>
            <?js include('layout-include-inside') ?>
        </div>
<?js }) ?>

<p>Thanx!</p>
```

```html
<!-- layout.jsin -->
<div>
    <p>Example layout begin with variable <?= boo ?></p>
    <div>
        <?js contents() ?>
    </div>
    <?js include('layout-include') ?>
    <p>Example layout end</p>
</div>
```

### Server side

```js
var include = require('jsin').include;

// you can omit extension .jsin or .js
include('mytemplate', {
    boo: 'booooooo'
}, function(err, res) {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log(res);
    }
});
```

### Client side

Compile client-side script using `jsinc` command-line tool:

```sh
$ jsinc path/to/*.jsin jsin.compiled.js
```

Additional options:

- `-b` - beautify
- `-u` - uglify

In browser:

```html
<script src="jsin.compiled.js"></script>
<script>
    var res = jsin.include('mytemplate', {
        boo: 'booooo'
    });
    document.getElementById('res').innerHTML = res;
</script>
```

## License

Copyright © 2014 Krylosov Maksim <Aequiternus@gmail.com>

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
