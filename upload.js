const uploadForm = document.getElementById("uploadForm");
const inpFile = document.getElementById("inpFile");

//Update page when user selects file
inpFile.onchange = () =>
{
    var files = inpFile.files;
    var file = files.item(0);

    document.getElementById("title").innerHTML = file.name;
    document.getElementById("size").innerHTML = file.size / 1024 / 1024 + "MB";
    document.getElementById("type").innerHTML = file.type;
};

uploadForm.addEventListener("submit", e => 
{
    e.preventDefault();

    //Generate unique filename
    var randNum = function()
    {
        const min = 100000;
        const max = 999999;

        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    var x = randNum();
    var name = `${x} - ${Date.now()}`;

    const endpoint = "http://192.168.254.138:3000/save-file";

    const formData = new FormData();

    formData.append("name", name);
    formData.append("file", inpFile.files[0]);

    for (var value of formData.values())
    {
        console.log(value);
    }

    fetch(endpoint, {
        mode: "no-cors",
        method: "POST",
        body: formData
    }).catch(console.error)
});