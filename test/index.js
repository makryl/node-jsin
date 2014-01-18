var include = require('../index').include;

include('mytemplate', {
    boo: 'booooooo'
}, function(err, res) {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log(res);
    }
});
