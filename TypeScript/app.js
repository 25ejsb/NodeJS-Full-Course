"use strict";
const num1Element = document.getElementById("num1");
const num2Element = document.getElementById("num2");
const buttonElement = document.querySelector("button"); // ! means could be null
const numResults = [];
const stringResults = [];
function add(num1, num2) {
    if (typeof num1 == 'number' && typeof num2 == 'number') {
        return num1 + num2;
    }
    else if (typeof num1 == 'string' && typeof num2 == 'string') {
        return num1 + " " + num2;
    }
    return +num1 + +num2;
}
function printResult(resultObj) {
    console.log(resultObj);
}
buttonElement.addEventListener("click", () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    // + turns the string into integer
    const result = add(+num1, +num2);
    numResults.push(result);
    const stringResult = add(num1, num2);
    stringResults.push(stringResult);
    console.log(stringResult);
    console.log(result);
    printResult({ val: result, timestamp: new Date() });
    console.log(numResults, stringResults);
});
