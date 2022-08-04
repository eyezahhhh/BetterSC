const {SoundCloud} = require("scdl-core");


async function connectSoundCloud() {
    console.log("Connecting to SoundCloud...");
    await SoundCloud.connect();
    console.log("Conncted to SoundCloud!");
}

connectSoundCloud();

async function getTrackById(id) {
    const track = await SoundCloud.tracks.getTrack("https://api.soundcloud.com/tracks/" + id);
    return track;
}

async function getTracksBySearchQuery(query, page = 0) {
    const tracks = await SoundCloud.search({
        query: query,
        limit: 50,
        offset: 0,
        filter: "tracks"
    });
    return tracks.collection;
}

module.exports = {
    Api: SoundCloud,
    getTrackById,
    getTracksBySearchQuery
};