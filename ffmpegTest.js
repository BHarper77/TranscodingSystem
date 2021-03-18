const ffmpeg = require("fluent-ffmpeg");

const file = "/files/example.mkv";

ffmpeg(file)
    .on("end", function() {
        console.log(`${file} has finished transcoding`);
    })
    .on("error", function(err) {
        console.log(`${file} could not be transcoded. Error: ${err}`);
    })
    .save("newvideo.mp4");