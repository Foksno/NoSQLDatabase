const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const Datastore = require('nedb')

const app = express()
const port = 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {
        equals: (operand1, operator, operand2, options) => {
            var operatorx = {
                'eq': function (one, two)
                { 
                    return one == two; 
                }
            }
            var result = operatorx[operator](operand1, operand2);

            if (result) return options.fn(this);
            else return options.inverse(this);
        }
    }
}));

app.use(express.urlencoded({ extended: true }))

const cars = new Datastore({
    filename: 'cars.db',
    autoload: true
})

app.get("/", (req, res) => {
    res.render('index.hbs')
})
app.get("/add", (req, res) => {
    res.render('add.hbs')
})

app.post('/add', (req, res) => {
    const data = {
        ubezpieczony: req.body.ubez == "ubez" ? "TAK" : "NIE",
        benzyna: req.body.benz == "benz" ? "TAK" : "NIE",
        uszkodzony: req.body.uszk == "uszk" ? "TAK" : "NIE",
        naped: req.body.nape == "nape" ? "TAK" : "NIE",
    }

    cars.insert(data, (err, newDoc) => {
        res.render('add.hbs', {id: newDoc._id })
    })

})

app.get("/list", (req, res) => {
    cars.find({}, (err, docs) => {
        docs.forEach((e, i) => e.tmp = 'temporary')
        res.render('list.hbs', {docs: docs})
    })
})

app.get("/delete", function (req, res) {
    data = req.query;
    cars.remove({ _id: data.id }, { multi: true }, function (err, numRemoved) {
    });
    setTimeout(() => {
        res.redirect('list');
    }, 200)
})

app.get("/edit", (req, res) => {
    cars.find({}, (err, docs) => {
        docs.forEach((e, i) => {
            e.is_edit_id = req.query._id === e._id ? true : false
        })
        res.render('edit.hbs', {docs: docs, edit_id: req.query._id })
    })
})

app.post("/edit", (req, res) => {
    if (req.body.ubez == "TAK") { 
        var ubez = "TAK" 
    }
    else if (req.body.ubez == "NIE") { 
        var ubez = "NIE" 
    }
    else { 
        var ubez = "BRAK" 
    }

    if (req.body.benz == "TAK") { 
        var benz = "TAK" 
    }
    else if (req.body.benz == "NIE") { 
        var benz = "NIE" 
    }
    else{ 
        var benz = "BRAK" 
    }

    if (req.body.uszk == "TAK") { 
        var uszk = "TAK" 
    }
    else if (req.body.uszk == "NIE") { 
        var uszk = "NIE" 
    }
    else { 
        var uszk = "BRAK"
    }

    if (req.body.nape == "TAK") { 
        var nape = "TAK" 
    }
    else if (req.body.nape == "NIE") { 
        var nape = "NIE" 
    }
    else { 
        var nape = "BRAK" 
    }

    cars.update({ _id: req.body._id }, {
        ubezpieczony: ubez,
        benzyna: benz,
        uszkodzony: uszk,
        naped: nape
    }, {}, (err, numReplaced) => {
        cars.find({}, (err, docs) => {
            res.render('edit.hbs', {docs: docs})
        })
    })
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})


