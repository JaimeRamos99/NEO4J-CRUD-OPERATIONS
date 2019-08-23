const express = require("express");
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));
const session = driver.session();

app.get('/', function (req, res) {

    session.run('MATCH (n:Movie) return n UNION MATCH(n:Person) return n').then(function (result) {//MATCH (n:Movie) return n UNION MATCH(n:Person) return n
        let movies = [];
        let actors = [];
        result.records.forEach(function (record) {
            if (record._fields[0].properties.title !== undefined) {
                movies.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.title
                });
            } else {
                actors.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.name
                });
            }
        });
        res.render('index', { movies: movies, actors: actors });
    }).catch(function (err) {
        console.log(err);
    });
});


app.post('/movie/add', function (req, res) {
    let title = req.body.title;
    let year = req.body.year;
    session.run('CREATE(n:Movie{title:{titleParam}, released:{yearParam}}) RETURN n.title', { titleParam: title, yearParam: year })
        .then(function (result) {

            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.post('/movie/update', function (req, res) {
    let titulo = req.body.title;
    let atributo = req.body.attr;
    let nuevo = req.body.dato;
    let s = "MATCH (n:Movie { title: '" + titulo + "' }) SET n." + atributo + "='" + nuevo + "' RETURN n"
    session.run(s)
        .then(function (result) {

            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.post('/person/update', function (req, res) {
    let name = req.body.name;
    let atributo = req.body.attr;
    let nuevo = req.body.dato;
    let s = "MATCH (n:Person { name: '" + name + "' }) SET n." + atributo + "='" + nuevo + "' RETURN n"
    session.run(s)
        .then(function (result) {

            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.post('/person/add', function (req, res) {
    let name = req.body.name;
    let year = req.body.year;
    session.run('CREATE(n:Person{name:{nameParam}, born:{yearParam}}) RETURN n.name', { nameParam: name, yearParam: year })
        .then(function (result) {

            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.post('/relation/add', function (req, res) {
    let node1 = req.body.nodo1;
    let node2 = req.body.nodo2;
    let relationship = req.body.relation;
    let s = "MATCH(a),(b) WHERE a.name='" + node1 + "' AND b.title='" + node2 + "' CREATE (a)-[r:" + relationship + "]->(b) RETURN type(r)"
    session.run(s)
        .then(function (result) {
            session.close();
            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.post('/relation/delete', function (req, res) {
    let node1 = req.body.nodo1;
    let node2 = req.body.nodo2;
    let relationship = req.body.relation;
    let s = "MATCH(a {name:'" + node1 + "'})-[r:" + relationship + "]->(b {title:'" + node2 + "'}) DELETE r";
    session.run(s)
        .then(function (result) {
            session.close();
            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.post('/movie/delete', function (req, res) {
    session.run("MATCH(n:Movie{title:{titu}}) DELETE n", { titu: req.body.titulo })
        .then(function (result) {
            session.close();
            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.post('/person/delete', function (req, res) {
    session.run("MATCH(n:Person{name:{no}}) DELETE n", { no: req.body.nombre })
        .then(function (result) {
            session.close();
            res.redirect('/');
        }
        )
        .catch(
            function (err) {
                console.log(err)
            }
        )
})

app.listen(3000);
console.log('server started on port 3000');
module.exports = app;