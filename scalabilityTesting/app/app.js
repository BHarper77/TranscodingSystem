async function helloWorld() 
{
    console.log("Hello World!");

    await sleep(60000);

    console.log("Exiting");
}

function sleep(ms) 
{
    console.log("Sleeping for: " + ms);
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

helloWorld();