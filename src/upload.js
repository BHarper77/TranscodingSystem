const server = "http://192.168.254.138:3000/";

const socket = io(server, {
    autoConnect: false,
    usernameAlreadySelected: false
});

const uploadForm = document.getElementById("uploadForm");
const inpFile = document.getElementById("inpFile");

var isFileChosen = false;

//Update page when user selects file
inpFile.onchange = () => {
    var files = inpFile.files;
    var file = files.item(0);

    document.getElementById("title").innerHTML = file.name;
    document.getElementById("size").innerHTML = file.size / 1024 / 1024 + "MB";
    document.getElementById("type").innerHTML = file.type;

    isFileChosen = true;
};

uploadForm.addEventListener("submit", e => {
    //TODO: Prevent user from pressing button multiple times 
    e.preventDefault();

    if(!isFileChosen)
    {
        window.alert("Please chose a file to upload");
        return;
    }

    isFileChosen = true;

    //Generate unique filename
    var randNum = function()
    {
        const min = 100000;
        const max = 999999;

        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    var x = randNum();
    var name = `${x}-${Date.now()}`;

    const formData = new FormData();

    formData.append("name", name);
    formData.append("file", inpFile.files[0]);

    const nameSplit = inpFile.files[0].name.split(".");

    //Get user choice
    const format = document.getElementById("format");
    const resolution = document.getElementById("resolution");
    const encoder = document.getElementById("encoder");

    const userChoice = {
        format: format.options[format.selectedIndex].value,
        resolution: resolution.options[resolution.selectedIndex].value,
        encoder: encoder.options[encoder.selectedIndex].value
    }

    //Open socket channel to server on form submission
    socketInit(name, nameSplit[1], userChoice);

    fetch(server + "save-file", {
        mode: "no-cors",
        method: "POST",
        body: formData
    }).catch(console.error)
});

//#region SOCKETS
socket.onAny((event, args) => {
    console.log(event, args);
});

function socketInit(username, filetype, userChoice) 
{
    socket.usernameAlreadySelected = true;
    socket.auth = { username, filetype , userChoice};
    console.log(socket);
    socket.connect();
}

socket.on("connect", () => {
    console.log("Socket username: " + socket.auth.username);
    console.log("Socket ID: " + socket.id);
});

socket.on("fileReady", (content) => {
    const output = document.getElementById("output");
    const downloadButton = document.getElementById("downloadButton")
    //const download = document.getElementById("download");

    output.style.visibility = "visible";
    //download.href = "192.168.254.138/files/finished/" + content;
    //download.download = content;

    downloadButton.addEventListener("click", e => {
        e.preventDefault();

        fetch("/get-file/" + content, {
            mode: "no-cors",
            method: "GET"
        })
        .then(response => response.blob())
        .then(blob => URL.createObjectURL(blob))
        .then(url => {
            window.open(url, '_blank');
        });
    });
});

socket.on("connect_error", (err) => {
    if(err.message === "invalid username")
    {
        this.usernameAlreadySelected = false;
    }
});
//#endregion