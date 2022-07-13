const { application } = require('express');
const express = require('express'); 
const fs = require('fs');
const path = require('path'); 
const app = express(); 
const uuid = require("./helpers/uuid"); 
const PORT = process.env.PORT || 3002; 

const { notes }  = require('./db/db.json');

// these 3 needed to pick up for the website 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// HTML routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
app.get('/notes', function(req, res) {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// API routes
app.get('/api/notes', (req, res) => {
    res.json(notes)
});

// get request for the new note 
app.get('/api/notes/:review_id', (req, res) => {
    if(req.body && req.params.review_id) {
        console.info(`${req.method} request received for the notes`);
        const reviewId = req.params.review_id;
        for (let i = 0; i < notes.length; i++) {
            const currentNote = notes[i];
            if (currentNote.review_id === reviewId) {
                res.json(currentNote); 
                return; 
            }
        }
        res.json('note ID not found'); 
    }
});

app.post('/api/notes', (req, res) => {
    // log if the post request is received 
    console.info(`${req.method} request received added `); 

    // destructuring the note body 
    const { title, text } = req.body; 

    //if all the properties are present 
    if (title && text) {
        // var for the saved object 
        const newNote = {
            title,
            text,
            review_id: uuid(),
        }; 

        // convert the data into a string 
        const noteString = JSON.stringify(newNote); 

        fs.readFile('./db/db.json', "utf8", function (err, data) {
            var json = JSON.parse(data)
            console.log(" existing ", data)
            json.push(newNote)
    
        fs.writeFile(`./db/db.json`, JSON.stringify(json), (err) => 
        err
        ? console.error(err)
        : console.log(
            `note for ${newNote.title} has been written to JSON`
        )
    ); 
}) 

    const response = {
        status: 'success',
        body: newNote,
    };

    console.log(response);
    res.json(response);
    } else {
        res.json('Error in posting note')
    }
});


app.listen(PORT, () => console.log(`server started on port ${PORT}`)); 

