const num1Element = document.getElementById("num1") as HTMLInputElement;
const num2Element = document.getElementById("num2") as HTMLInputElement;
const buttonElement = document.querySelector("button")!; // ! means could be null

const numResults: number[] = [];
const stringResults: string[] = [];

function add(num1: number | string, num2: number | string) {
    if (typeof num1 == 'number' && typeof num2 == 'number') {
        return num1 + num2;
    } else if (typeof num1 == 'string' && typeof num2 == 'string') {
        return num1 + " " + num2;
    }
    return +num1 + +num2;
}

function printResult(resultObj: { val: number; timestamp: Date }) {
    console.log(resultObj);
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