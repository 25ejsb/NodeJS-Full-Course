const num1Element = document.getElementById("num1") as HTMLInputElement;
const num2Element = document.getElementById("num2") as HTMLInputElement;
const buttonElement = document.querySelector("button")!; // ! means could be null

function add(num1: number, num2: number) {
    return num1 + num2;
}

buttonElement.addEventListener("click", () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    // + turns the string into integer
    const result = add(+num1, +num2);
    console.log(result);
})