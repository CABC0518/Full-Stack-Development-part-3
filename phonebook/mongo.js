const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const url = `mongodb+srv://Nuchanoko:${password}@cluster0.atynk6h.mongodb.net/Phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date,
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length === 3){
    mongoose
    .connect(url)
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person)
        })
        mongoose.connection.close()
      })
}else{
mongoose
  .connect(url)
  .then((result) => {
    console.log('connected')

    const person = new Person({
      name,
      number,
      date: new Date(),
    })

    return person.save()
  })
  .then(() => {
    console.log(`added ${name} ${number} to phonebook`)
    return mongoose.connection.close()
  })
  .catch((err) => console.log(err))
}

