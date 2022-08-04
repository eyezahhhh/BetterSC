const socket = io();
const audio = document.querySelector(".player");

socket.on("song list", (list) => {
    console.log(list);
    var html = "";
    for (item in list) {
        item = list[item];
        console.log(item);
        if (item.data != null) {
            html += `
<div class="song-list-item song-list-item-${item.id}">
    <button class="song-list-item-play" onClick="play(${item.id})">Play</button>
    <a class="song-list-item-artist">${item.data.user.username}</a>
    <a class="song-list-item-title">${item.data.title}</a>
</div>`;
        }
    }
    document.querySelector(".song-list").innerHTML = html;
});

socket.on("song search list", (list) => {
    console.log("GOT SEARCH LIST!");
    console.log(list);
    var html = "";
    for (item in list) {
        item = list[item];
        html += `
<div class="song-list-item song-list-item-${item.id}">
    <button class="song-list-item-play" onClick="play(${item.id})">Play</button>
    <a class="song-list-item-artist">${item.user.username}</a>
    <a class="song-list-item-title">${item.title}</a>
</div>`;
    }
    document.querySelector(".song-list").innerHTML = html;
});

function goHome() {
    document.querySelector(".song-list").innerHTML = ""; // add loading screen later
    document.querySelector(".nav-search").value = "";
    socket.emit("request song list");
}

goHome();

function setProgressBar(value) {
    document.querySelector(".player-progress-container").style.setProperty("--percentage", value + "%");
    document.querySelector(".player-progress").value = value * 10;
}

function play(id) {
    audio.src = "/song/" + id;
    audio.load();
    audio.play();
}

var waitingForMouseUp = -1;
var mouseDown = false;

function playerProgressInteract(element) {
    waitingForMouseUp = element.value / 10;
    setProgressBar(element.value / 10);
}

window.addEventListener("mousedown", () => {
    mouseDown = true;
});

window.addEventListener("mouseup", () => {
    mouseDown = false;
    if (waitingForMouseUp > -1) {
        audio.currentTime = audio.duration / 100 * waitingForMouseUp;
        waitingForMouseUp = -1;
    }
});

audio.addEventListener("timeupdate", () => {
    if (mouseDown) return;
    setProgressBar(audio.currentTime / audio.duration * 100);
});

function searchForSong(e) {
    if (e.preventDefault) e.preventDefault();
    var query = document.querySelector(".nav-search").value.trim();
    if (query == "") {
        goHome();
    } else {
        console.log("search for " + query);
        socket.emit("search for song", query);
    }
    return false;
}

if (document.querySelector(".nav-search-form").attachEvent) {
    document.querySelector(".nav-search-form").attachEvent("submit", searchForSong);
} else {
    document.querySelector(".nav-search-form").addEventListener("submit", searchForSong);
}