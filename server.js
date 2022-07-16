
const express = require('express'); 
const fs = require('fs');
const path = require('path'); 
const app = express(); 
//const uuid = require("./helpers/uuid"); 
const PORT = process.env.PORT || 3002; 
const {notes} = require('./public/db/notes.json');

// these 3 needed to pick up for the website 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static ('public'));
////
function filterByQuery(query, notesArray) {
    let bodyArray = []; 
    let noteResults = notesArray;
    if (query.title) {
        if (typeof query.title === 'string') {
            bodyArray = [query.title];
        } else {
            bodyArray = query.title;
        }
        bodyArray.forEach(noteTitle => {
            noteResults = noteResults.filter(
                note => note.title.indexOf(noteTitle) !== -1
            );
        });
    }
    return noteResults; 
}

function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result; 
}

function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './public/db/notes.json'), 
        JSON.stringify({ notes: notesArray}, null, 2)
    );
    // function here 
    return note; 
}

function validateNote(note) {
    if(!note.title || typeof note.title !== 'string' ) {
        return false;
    }
    if(!note.text || typeof note.text !== 'string') {
        return false; 
    }
    return true; 
}

// API routes
app.get('/api/notes', (req, res) => {
    let results = notes;
    if (req.query) {
        results = filterByQuery(req.query, results);
    } 
    res.json(results);
    console.info(`${req.method} request received for notes`)
    // tst res.json(notes)
});

// get request for the new note 
app.get('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        res.json(result);
        console.log(result);
        console.info(`${req.method} request received for notes`)
    } else {
        res.send(404);
    }
});

app.post('/api/notes', (req, res) => {
    req.body.id = notes.length.toString();
    // validation or whatnot
    if(!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted');
    } else {
        const note = createNewNote(req.body, notes);
    res.json(note);  
    console.log(note); 
    console.info(`${req.method} request received for notes`)
    }
});

// HTML routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './public/index.html')); // index page 
});
app.get('/notes', function(req, res) {
    res.sendFile(path.join(__dirname, './public/notes.html')); // notes page 
});
app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, './public/index.html')); 
})
// listen for the port number 
app.listen(PORT, () => console.log(`server started on port ${PORT}`)); 

