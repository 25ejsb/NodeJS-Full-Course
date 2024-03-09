const fetchData = () => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Done!")
        }, 1500)
    });
    return promise;
}

// async code
setTimeout(() => {
    console.log("Timer is done!")
    fetchData().then(text => {
        console.log(text);
        fetchData().then(text2 => {
            console.log(text);
            return fetchData();
        })
    })
}, 2000)
// sync code
console.log("Hello")
console.log("Hi")