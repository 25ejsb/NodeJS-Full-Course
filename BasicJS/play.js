const name = 'Max';
let age = 29;
const hasHoobies = true;

age = 30

const summarizeUser = (userName, userAge, userHasHobby) => {
    return `Name is ${userName}, age is ${userAge}, and the user has hobbies: ${userHasHobby}`
}

const add = (a, b) => a+b
const addRandom = () => 1+2;
console.log(add(1,2))
console.log(summarizeUser(name, age, hasHoobies))