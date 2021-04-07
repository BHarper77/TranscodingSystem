const url = "http://localhost:3000";
const serverUrl = "http://192.168.254.138:3000";

const socket = io(serverUrl, {
    autoConnect: false,
    usernameAlreadySelected: false
});

socket.onAny((event, args) => {
    console.log(event, args);
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

    const server = "http://192.168.254.138:3000/save-file";

    const formData = new FormData();

    formData.append("name", name);
    formData.append("file", inpFile.files[0]);

    const nameSplit = inpFile.files[0].name.split(".");

    //Open socket channel to server on form submission
    socketInit(name, nameSplit[1]);

    fetch(server, {
        mode: "no-cors",
        method: "POST",
        body: formData
    }).catch(console.error)

    const userChoice = {
        test: "mp4"
    }

    //Send user choice through socket channel
    //socketMessage(userChoice);
});

function socketInit(username, filetype) 
{
    socket.usernameAlreadySelected = true;
    socket.auth = { username, filetype };
    //socket.filetype = filetype;

    console.log(socket);
    socket.connect();
}

socket.on("connect", () => {
    console.log("Socket username: " + socket.auth.username);
    console.log("Socket ID: " + socket.id);
});

socket.on("connect_error", (err) => {
    if(err.message === "invalid username")
    {
        this.usernameAlreadySelected = false;
    }
});

function socketMessage(userChoice)
{
    socket.emit("userChoice", userChoice);
}

socket.on("fileReady", (content) => {
    retrieveFile(content);
});

function retrieveFile(filename)
{
    fetch("192.168.254.138:3000/get-file:" + filename, {
        mode: "no-cors",
        method: "GET"
    })
}