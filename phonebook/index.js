const { request } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.static('build'))
app.use(express.json())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan('tiny'))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
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
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) =>{
    response.send(`
    <P>Phonebook has info for ${persons.length} people</p>
    <p>${gmtDateTime}</p>
    `)
})

app.get('/api/persons/:id', (request, response) =>{
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id) 
    if(person){
        response.json(person)
    } else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    // get everrhthing except the deleted item
    persons = persons.filter(p => p.id !== id)
    console.log('delete called')
    response.status(204).end()
})


app.post('/api/persons', morgan(':method :url :status  :res[content-length] - :response-time ms :body'), (request, response) => {
    const body = request.body
    console.log(body)
    if(!body.name || !body.number){
        return response.status(400).send({
            error: "Name or number is missing"
        })
    }
    if(persons.find(p => p.name === body.name)){
        return response.status(400).send({
            error: "Name must be unique"
        })
    }
    let id = null
    id = generateID(persons, id)
    const person = {
        id: id,
        name: body.name,
        number: body.number,
        date: new Date(),
        
    }
    persons = persons.concat(person)
    response.json(person)
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})