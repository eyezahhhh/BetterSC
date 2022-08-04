const { count } = require('console');
const Mysql = require('mysql');
const SoundCloud = require("./soundcloud");

var pool  = Mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'bettersc',
    password: 'dc6*o)Yg3RSlLKP1',
    database: 'bettersc'
});

function getAllSongs(page = 0) {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM songs WHERE 1 ORDER BY date_added LIMIT ?, 50", [page * 50], async (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                var ids = [];
                for (let i = 0; i < results.length; i++) {
                    ids.push(results[i].id);
                    results[i].data = null;
                }
                try {
                    var tracksData = await SoundCloud.Api.tracks.getTracksByIds(ids);
                    for (let i = 0; i < tracksData.length; i++) {
                        if (ids.includes(tracksData[i].id)) {
                            results[ids.indexOf(tracksData[i].id)].data = tracksData[i];
                        }
                    }
                    resolve(results);
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            }
        });
    });
}

function addSong(id) {
    return new Promise(async (resolve, reject) => {
        try {
            await SoundCloud.getTrackById(id);
        } catch (e) {
            reject({
                error: true,
                code: "invalid_song_id"
            });
            return;
        }
        pool.query("INSERT INTO songs (id, date_added, last_listened, listen_count) VALUES (?, ?, ?, ?)", [id, (new Date()).getTime(), (new Date()).getTime(), 1], (error, results, fields) => {
            if (error) {
                if (error.code == "ER_DUP_ENTRY") {
                    reject({
                        error: true,
                        code: "song_already_exists"
                    });
                } else {
                    console.log(error);
                    reject({
                        error: true,
                        code: "server_error"
                    });
                }
            } else {
                resolve(results);
            }
        })
    })
}

module.exports = {
    getAllSongs,
    addSong
};