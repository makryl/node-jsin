# JSIN - Javascript Include

## Usage

### Template

```html
<!doctype html>
    <?xml encoding="utf-8" ?><!-- indent is not a bug, but check -->
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

### Server side

```js
var include = require('jsin').include;

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

```sh
$ jsinc path/to/*.jsin compiled.js
```

Options:

* `-b` - beautify
* `-u` - uglify

```html
<script src="compiled.js"></script>
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
