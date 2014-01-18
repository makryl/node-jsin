var include = require('./jsin').include;

include('index', {
    boo: 'booooooo'
}, function(err, res) {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log(res);
    }
});
