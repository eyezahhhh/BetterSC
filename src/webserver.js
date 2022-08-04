const Express = require("express");
const Http = require('http');
const SoundCloud = require("./soundcloud");
const Database = require("./database");
const app = Express();
const server = Http.createServer(app);
const {Server: SocketServer} = require("socket.io");
const io = new SocketServer(server);

app.get("/song/:artist/:track", async (req, res) => {
    var track = req.params.artist + "/" + req.params.track;
    var stream = await SoundCloud.Api.download("https://soundcloud.com/" + track, {
        highWaterMark: 1 << 18, // 32Mb, default is 16kb
    });
    stream.pipe(res);
});

app.get("/song/:id", async (req, res) => {
    var track = req.params.id;
    var stream = await SoundCloud.Api.download("https://api.soundcloud.com/tracks/" + track, {
        highWaterMark: 1 << 18, // 32Mb, default is 16kb
    }); 
    stream.pipe(res);
});

app.get("/songlist", (req, res) => {
    Database.getAllSongs()
    .then((data) => {
        res.status(200).send(data);
    }).catch((error) => {
        res.status(500).send(error);
    })
});

app.get("/addsong/:id", (req, res) => {
    Database.addSong(req.params.id)
    .then((data) => {
        res.status(200).send(data);
    }).catch((error) => {
        res.status(500).send(error);
    })
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/static/*", (req, res) => {
    var file = req.url.substring(8);
    file = file.replace("..", ".");
    res.sendFile(__dirname + "/static/" + file);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on("request song list", async () => {
        socket.emit("song list", await Database.getAllSongs());
    });
    socket.on("search for song", async (query) => {
        try {
            var tracks = await SoundCloud.getTracksBySearchQuery(query);
            socket.emit("song search list", tracks);
        } catch (e) {
            console.log(e);
            socket.emit("song search list", {
                error: true,
                code: e
            });
        }
    });
});

server.listen(2000, () => {
    console.log("started!");
});