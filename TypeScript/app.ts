const num1Element = document.getElementById("num1") as HTMLInputElement;
const num2Element = document.getElementById("num2") as HTMLInputElement;
const buttonElement = document.querySelector("button")!; // ! means could be null

const numResults: Array<number> = [];
const stringResults: string[] = [];

type NumOrString = number | string;
type Result = {}

interface ResultObj {
    val: number;
    timestamp: Date;
}

function add(num1: NumOrString, num2: NumOrString) {
    if (typeof num1 == 'number' && typeof num2 == 'number') {
        return num1 + num2;
    } else if (typeof num1 == 'string' && typeof num2 == 'string') {
        return num1 + " " + num2;
    }
    return +num1 + +num2;
}

function printResult(resultObj: ResultObj) {
    console.log(resultObj.val, resultObj.timestamp);
}

buttonElement.addEventListener("click", () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    // + turns the string into integer
    const result = add(+num1, +num2);
    numResults.push(result as number)
    const stringResult = add(num1, num2);
    stringResults.push(stringResult as string);
    console.log(stringResult);
    console.log(result);
    printResult({val: result as number, timestamp: new Date()})
    console.log(numResults, stringResults)
})

const promise = new Promise<string>((resolve, reject) => { // the promise can return with a string
    setTimeout(() => {
        resolve("It worked!")
    }, 1000)
})

promise.then((result => {
    console.log(result.split(" "))
}))