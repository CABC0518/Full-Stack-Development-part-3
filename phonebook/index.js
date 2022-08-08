require('dotenv').config()
const { request } = require('express')
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()
app.use(express.static('build'))
app.use(express.json())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan('tiny'))


const gmtDateTime = new Date().toLocaleString()
const generateID = (persons, id) =>{
    while(true){
        id = Math.floor(Math.random() * 300000)
        if(persons.find(p => p.id === id)){
            console.log('continue')
            continue
        }else{
            console.log('break')
            return id
        }
    }
}



app.get('/', (request, response) => {
  response.send('<h1>This is a welcome page</h1>')
})

app.get('/api/persons', (request, response) => {
    console.log('this is called')
    Person.find({}).then(person => {
        response.json(person)
    })
})

app.get('/info', (request, response) =>{
    console.log('this is called')
    Person.find({}).then(persons => {
        response.send(`
        <P>Phonebook has info for ${persons.length} people</p>
        <p>${gmtDateTime}</p>
        `)
    })

})

app.get('/api/persons/:id', (request, response, next) =>{
    Person.findById(request.params.id)
    .then(person =>{
        if(person){
            response.json(person)
        }else{
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next()) 
})

app.put('/api/persons/:id', (request, response, next) =>{
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatePerson =>{
        response.json(updatePerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', morgan(':method :url :status  :res[content-length] - :response-time ms :body'), (request, response) => {
    const body = request.body
    console.log(body)
    if(!body.name || !body.number){
        return response.status(400).send({
            error: "Name or number is missing"
        })
    }
    const person = new Person({
        name: body.name,
        number: body.number,
        date: new Date(),
    })
    person.save().then(savePerson => {
        response.json(savePerson)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformed id'})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})