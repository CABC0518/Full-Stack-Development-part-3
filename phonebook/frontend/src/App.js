import { useState, useEffect } from 'react'
import personService from './service/persons'
import './main.css'

const Filter = ({newSearch, handleSearch}) => {
  return(
    <div>
      Filter shown with <input value={newSearch} onChange={handleSearch}></input>
    </div>
  )
}

const PersonForm = ({addPerson, newName, handleNewChange, newNumber, handleNumberChange })=>{
  return(
    <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleNewChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange}/>
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
  )
}
const Notificaiton = ({successMessage, messageStatus, errorMessage}) =>{
  if (messageStatus === null) {
    return null
  }else if(messageStatus === 'error'){
    console.log('error message shown')
    return(
      <div className={messageStatus}>
      {errorMessage}
    </div>
    )
  }
  return (
      <div className={messageStatus}>
        {successMessage}
      </div>
      )

}

const Persons = ({personsToShow, setPersons, setErrorMessage, setMessageStatus, setSuccessMessage}) =>{
  // confimation for deletion and get the latest phonebook infos after the deletion
  const deleteClicked = (e) =>{
    const tmpPersonName = personsToShow.filter(p => p.id === e.target.id)[0].name
    if(window.confirm('Do you really want to delete it?')){
      personService
      .deletePerson(e.target.id)
      .then(response =>{
        console.log(response)
        return personService.getAll()
      })
      .then(response =>{
        setPersons(response.data)
        setMessageStatus('success')
        setSuccessMessage(`${tmpPersonName} has successfully been removed`)
        setTimeout(() => {
          setMessageStatus(null)
        }, 5000)
      })
      .catch(error => {
        console.log('caught an error')
        setErrorMessage(`Information of ${tmpPersonName} has been already removed from server`)
        setMessageStatus('error')
        setTimeout(() => {
          setMessageStatus(null)
        }, 5000)
      })
    }
  }
  return(
    personsToShow.map(person =>
          <p key={person.id}>{person.name} {person.number}  
          <Button id={person.id} deleteClicked={deleteClicked}/>
          </p>
    )
  )
}

const Button = ({id, deleteClicked}) => <button id={id} onClick={deleteClicked}>delete</button>

const App = () => {
  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [newSearch, setNewSearch] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [messageStatus, setMessageStatus] = useState(null)
 

  // get all phonebook info from a server
  useEffect(() => {
    console.log("servive: ", personService)
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])
  console.log('render', persons.length, 'persons')
  console.log(persons)

  const personsToShow = showAll
  ? persons
  : persons.filter(person => person.name.toLowerCase().includes(newSearch.toLowerCase()))

  const handleSearch = (event)=> {
    setNewSearch(event.target.value)
    setShowAll(false)
  }

  const handleNewChange = (event) => {
    console.log("event target: ",event.target)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event)=>{
    setNewNumber(event.target.value)
  }


  const addPerson = (event) => {
    const updateOldInfo = (persons, personService) =>{
      let originalPerson = persons.filter(person => person.name === newName)[0]
      originalPerson.name = newName
      originalPerson.number = newNumber
      personService
      .update(originalPerson.id, originalPerson)
      .then(response =>{
        console.log(response)
        return personService.getAll()
      })
      .then(response =>{
        setPersons(response.data)
 
      })
    }
    event.preventDefault()
    // retrieve only names from Person objects and make a new array
    const namearr = persons.map(person => person.name)
    // check if a name is already in the phonebook and if it exists, proceed to the next
    if(namearr.includes(newName)){
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)){
        updateOldInfo(persons, personService)
        
      }
    }else{
      console.log('button clicked', newName)
      const newPerson = {
        name: newName,
        number: newNumber,
      }
      personService
      .create(newPerson)
      .then(response =>{
        setPersons(persons.concat(response.data))
        setSuccessMessage(`added ${newName}`)
        setMessageStatus('success')
        setTimeout(() => {
          setMessageStatus(null)
        }, 5000)
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        // this is the way to access the error message
        console.log(error.response.data.error)
        setErrorMessage(error.response.data.error)
        setMessageStatus('error')
        setTimeout(() => {
          setMessageStatus(null)
        }, 5000)
      })
    }
  }



  return (
    <div>
      <h2>Phonebook</h2>
      <Notificaiton successMessage={successMessage} messageStatus={messageStatus}  errorMessage={errorMessage}/>
      <Filter newSearch={newSearch} handleSearch={handleSearch}/>
      <h1>Add a new</h1>
      <PersonForm 
      addPerson = {addPerson}
      newName = {newName}
      handleNewChange = {handleNewChange}
      newNumber = {newNumber}
      handleNumberChange = {handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons 
      personsToShow={personsToShow} 
      setPersons={setPersons} 
      messageStatus={messageStatus} 
      setErrorMessage={setErrorMessage}
      setMessageStatus={setMessageStatus}
      setSuccessMessage={setSuccessMessage}
      /> 
      
    </div>
  )
}

export default App