"use strict";
const num1Element = document.getElementById("num1");
const num2Element = document.getElementById("num2");
const buttonElement = document.querySelector("button"); // ! means could be null
function add(num1, num2) {
    return num1 + num2;
}
buttonElement.addEventListener("click", () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    // + turns the string into integer
    const result = add(+num1, +num2);
    console.log(result);
});
