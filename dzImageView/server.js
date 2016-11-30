// Packages

var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

var os = require('os');

var https = require('https');

var fs = require('fs');
var path = require('path');

var serverOptions = {
    key: fs.readFileSync(__dirname + '/pem/key.pem'),
    cert: fs.readFileSync(__dirname + '/pem/cert.pem')
};

var server = https.createServer(serverOptions, app);
var io = require('socket.io')(server);


// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Constants

const appPort = 15000;

const webDir = '/dzweb/';
const imageDirPrefix = '.' + webDir + 'images/';
const jsonDataFileName = 'data.json';
const socketsCheckTimeoutInSec = 10;


// Logging constants
const Reset  = '\x1b[0m';
const Bright = '\x1b[1m';
const FgRed = '\x1b[31m'
const FgYellow = '\x1b[33m'
const FgBlue = '\x1b[34m'
const BgWhite = '\x1b[47m'


// Variables

var arrSocket = [];
var arrEdit = [];
var arrHostAddress = [];
var lang;
var layout;


// Functions

function isUndefined(a) {
    return a === undefined;
}

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(function (file) {
        return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
}

function checkSockets(socket) {
    var r = 0;
    var arr = [];

    arrSocket.forEach(function (item) {
        if (item.connected)
            arr.push(item);
        else {
            // End image editing for disconnected socket
            var imageId = getEditedImageId(item.id);

            if (!isUndefined(imageId)) {
                removeEditedSocketId(imageId);
                sendToAllSocketsButThis(item.id, 'endEdit', { imageId: imageId });

                if (!isUndefined(socket))
                    socket.emit('endEdit', { imageId: imageId });
            }
        }
    });

    arrSocket = arr;
}

function addSocket(socket) {
    checkSockets(socket);

    var r = 0;
    arrSocket.forEach(function (item) {
        if (socket.id === item.id)
            r++;
    });

    if (r === 0)
        arrSocket.push(socket);
}

function sendToAllSockets(commandStr, objToSend) {
    arrSocket.forEach(function (item) {
        item.emit(commandStr, objToSend);
        simpleLog(item.id + ' ' + commandStr);
    });
}

function sendToAllSocketsButThis(socketId, commandStr, objToSend) {
    arrSocket.forEach(function (item) {
        if (socketId != item.id) {
            item.emit(commandStr, objToSend);
            simpleLog(item.id + ' ' + commandStr);
        }
    });
}

function getEditedSocketId(imageId) {
    var ret;
    arrEdit.forEach(function (item) {
        if (imageId === item.imageId)
            ret = item.socketId;
    });

    return ret;
}

function addEditedSocketId(imageId, socketId) {
    ret = false;
    var sid = getEditedSocketId(imageId);
    if (isUndefined(sid)) {
        arrEdit.push({ imageId: imageId, socketId: socketId });
        ret = true;
    }

    return ret;
}

function removeEditedSocketId(imageId) {
    ret = false;
    var sid = getEditedSocketId(imageId);
    if (!isUndefined(sid)) {
        ret = true;
        arr = [];
        arrEdit.forEach(function (item) {
            if (sid != item.socketId)
                arr.push(item);
        });

        arrEdit = arr;
    }

    return ret;
}

function getEditedImageId(socketId) {
    var ret;
    arrEdit.forEach(function (item) {
        if (socketId === item.socketId)
            ret = item.imageId;
    });

    return ret;
}

function isExists(pathFile) {
    try {
        fs.accessSync(pathFile, fs.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function getHostAddresses() {
    var hostAddresses = [];
    var ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            simpleLog(ifname + ': ' + iface.address);
            hostAddresses.push({
                name: ifname,
                family: iface.family,
                isInternal: iface.internal,
                ipAddress: iface.address
            });
        });
    });

    return hostAddresses;
}


// On Start functions

(function onStart() {
    simpleLog();
    decoratedLog('Deep Zoom Viewing Server', FgBlue, BgWhite, true);

    arrHostAddress = getHostAddresses();
} ());

(function periodicSocketsCheck() {
    setTimeout(function () {
        checkSockets();
        periodicSocketsCheck();
    }, socketsCheckTimeoutInSec * 1000);
} ());


// GET 

// index.html
app.get('/', function (req, res) {
    // /?lang=ru&layout=l
    lang = req.param('lang');
    layout = req.param('layout');
    res.sendFile(__dirname + webDir + 'index.html');
});

// Uploaded images
app.get('/uploaded/*', function (req, res) {
    try {
        var ss = req.url.split('/');
        var ulpoadedImageName = ss[2].split('.')[0];
        sendToAllSockets('uploadedImageName', ulpoadedImageName);
    }
    catch (err) {
        console.log('Exception on GET: ' + err);
    }
});

// Settings
app.get('/settings.js', function (req, res) {
    var url = req.url;
    lang = isUndefined(lang) ? 'en' : lang;
    
    url = '/settings/settings_' + lang + '.js';

    var isError = false;
    var longUrl = __dirname + webDir + url;

    if (isExists(longUrl))
        res.sendFile(longUrl);
    else {
        // Default - en
        longUrl = '/settings/settings_en.js';
        if (isExists(longUrl))
            res.sendFile();
        else
            isError = true;
    }

    if (isError) {
        var err = new Error();
        err.status = 404;
        err.message = longUrl;
        next(err);
    }
});

app.get('/js/global.js', function (req, res) {
    var longUrl = __dirname + webDir + req.url;
    if (isExists(longUrl))
        res.send(fs.readFileSync(longUrl).toString()
            .replace('$0', /*ipAddress*/'https://' + req.headers.host)
            .replace('$1', /*layout*/(layout !== 'l' && layout !== 'L').toString())
        );
});

// Awesome font files
app.get('/font-awesome/fonts/*', function (req, res) {   
    // Sample: "/font-awesome/fonts/fontawesome-webfont.ttf?v=4.7.0"
    // Remove parameters, if any (now this is version)
    res.sendFile(__dirname + webDir + req.url.split('?')[0]);
});

// Pyramid images
app.get('*', function (req, res, next) {
    // Sample: "/images/image_name/13/12_5.jpg"
    var url = req.url;

    var isError = false;
    var longUrl = __dirname + webDir + url;

    if (isExists(longUrl)) 
        res.sendFile(longUrl);
    else
        isError = true;

    if (isError) {
        var err = new Error();
        err.status = 404;
        err.message = longUrl;
        next(err);
    }
});


// Handling 404 errors
app.use(function (err, req, res, next) {
    if (err.status !== 404) {
        return next();
    }

    errorLog('Error: Resource "' + err.message + '" was not found');
    res.send(err.message || '** Resource was not found **');
});


// WebSocket

// Receiving data from Client
io.on('connection', function (socket) {
    var socketId = socket.id;
    simpleLog('WebSocket port is ' + appPort);

    socket
        .on('init', function (data) {
            addSocket(socket);
            socket.emit('init', { imageNames: getDirectories(imageDirPrefix) });
        })
        .on('imageInfo', function (data) {
            if (!isUndefined(data.imageName)) {
                imageName = data.imageName;
                imageDir = imageDirPrefix + imageName + '/';
                var content = fs.readFileSync(imageDir + imageName + '.json', 'utf8');
                var jsonContent = JSON.parse(content);
                jsonContent.Image.xmlns = '';
                var ss = jsonContent.Image.Url.split('/');
                var ssLast = ss[ss.length - 1];
                var imageId = (ssLast.length === 0 ? ss[ss.length - 2] : '/' + ssLast);
                jsonContent.Image.Url += imageId + '.json';
                socket.emit('imageInfo', { imageInfo: jsonContent, isEditable: isUndefined(getEditedSocketId(imageId)) });
                simpleLog('on imageInfo: ' + imageId);
            }
        })
        .on('load', function (data) {
            var content;
            imageDir = imageDirPrefix + data.imageId + '/';
            try {
                content = JSON.parse(fs.readFileSync(imageDir + jsonDataFileName));
            }
            catch (err) {
                content = '';
            }

            socket.emit('load', { content: content });
        })
        .on('save', function (data) {
            var layers = data.layerCollection;
            imageDir = imageDirPrefix + data.imageId + '/';
            fs.writeFileSync(imageDir + jsonDataFileName, JSON.stringify(layers), 'utf8');
            socket.emit('save', { result: 'OK' });
            sendToAllSocketsButThis(socket.id, 'updated', { imageId: data.imageId });
        })
        .on('beginEdit', function (data) {
            if (addEditedSocketId(data.imageId, socket.id))
                sendToAllSocketsButThis(socket.id, 'beginEdit', { imageId: data.imageId });
        })
        .on('endEdit', function (data) {
            if (removeEditedSocketId(data.imageId))
                sendToAllSocketsButThis(socket.id, 'endEdit', { imageId: data.imageId });
        });
});


// Listen

server.listen(appPort, function () {
    simpleLog(Bright + 'Server is listening on port ' + FgYellow + appPort + Reset);
    simpleLog();
});


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


