var express	= require('express');
var multer = require('multer');

var exec = require('child_process').exec;

var https = require('https');

var fs = require('fs');

var agentOptions = {
    host: 'localhost',
    port: 15000,
    path: '/',
    rejectUnauthorized: false
};

var options = {
    url: 'https://localhost:15000',
    agent: new https.Agent(agentOptions),
    method: 'GET'
};

callback = function (response) {
    var str = '';
}

var app = express();


// Constants

const port = 15005;

// Logging constants
Reset = '\x1b[0m';
Bright = '\x1b[1m';
FgRed = '\x1b[31m'
FgYellow = '\x1b[33m'
FgBlue = '\x1b[34m'
BgWhite = '\x1b[47m'


// Server

var serverOptions = {
    key: fs.readFileSync(__dirname + '/pem/key.pem'),
    cert: fs.readFileSync(__dirname + '/pem/cert.pem')
};

var server = https.createServer(serverOptions, app);


var uploadedFileName;

var storage	= multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
      uploadedFileName = file.originalname.replaceAll(' ', '_') + '-' + Date.now();
      callback(null, uploadedFileName); //file.fieldname
  }
});
var upload = multer({ storage: storage }).single('userPhoto');


// On Start functions

(function onStart() {
    simpleLog();
    decoratedLog('Deep Zoom Image Upload Server', FgBlue, BgWhite, true);
} ());


// GET

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + req.url);
});


// POST

app.post('/', function (req, res, next) {
    // Sample: "https://localhost:15005/api/photo?userPhoto=Chateau+de+Chambord.JPG&submit=Upload+Image"
	upload(req, res, function(err) {
		if (err) 
			return res.end('Error uploading file.');

        // Reload page
        res.sendFile(__dirname + '/index.html');
                
        // Run pyramid builder
        var child = exec('dotnet pyramidBuilder/dzImagePyramidBuilder.dll ' + uploadedFileName, function (error, stdout, stderr) {
            options.path = '/uploaded/' + uploadedFileName;

            // Notification to Viewer
            var req = https.request(options, function (res) {
            });

            req.on('error', function (err) {
                console.log('Error: ' + err.message);
            });

            req.end();

            uploadedFileName = undefined;
        });
    });
});

// Handling 404 errors
app.use(function (err, req, res, next) {
    if (err.status !== 404) {
        return next();
    }

    errorLog('Error: Resource "' + err.message + '" was not found');
    res.send(err.message || '** Resource was not found **');
});


// Listen

server.listen(port, function () {
    simpleLog(Bright + 'Server is listening on port ' + FgYellow + port + Reset);
    simpleLog();
});

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function isUndefined (a) {
    return a === undefined;
}


// Log

function decoratedLog(msg, color, background, isBright) {
    var prefix = isBright ? Bright : '';
    var text = isUndefined(msg) ? '' : msg;
    console.log(prefix + color + background + text + Reset);
}

function errorLog(msg) {
    console.log(Bright + FgRed + msg + Reset);
}

function simpleLog(msg) {
    console.log(isUndefined(msg) ? '' : msg);
}

