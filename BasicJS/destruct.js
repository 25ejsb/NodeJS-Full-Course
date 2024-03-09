const person = {
    name: "Max",
    age: 29,
    greet() {
        console.log(`Hi, I am ${this.name}`)
    }
}
// Destructuring
const printName = ({ name }) => { // takes the name out of the object
    console.log(name);
}

printName(person)

const {name, age} = person
console.log(name, age)

console.log(person)
console.log(person.age)
person.greet()

const hobbies = ['Sports', 'Cooking', 1, true, {}]
const [hobby1, hobby2] = hobbies
console.log(hobby1, hobby2)

for (let hobby of hobbies) {
    console.log(hobby);
}
console.log(hobbies.map(hobby => `Hobby: ${hobby}`))
hobbies.push("Programming")
console.log(hobbies)
const coppiedArray = hobbies.slice() // copies an array
console.log(coppiedArray)
const coppiedCOPPIEDarray = [...hobbies]
console.log(coppiedCOPPIEDarray);
const toArray = (...args) => {
    return args
}
console.log(toArray(1, 2, 3, 4, 5))