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
        result.records.forEach(function (record) {
            console.log(record._fields[0].properties.title)
            if(record._fields[0].properties.title!==undefined){
                movies.push({
                    id:record._fields[0].identity.low,
                    title:record._fields[0].properties.title
                });
            }else{
                movies.push({
                    id:record._fields[0].identity.low,
                    title:record._fields[0].properties.name
                });
            }
        });
        res.render('index',{movies:movies});
    }).catch(function (err) {
        console.log(err);
    });
});
app.post('/movie/add', function (req, res) {
    let title = req.body.title;
    let year = req.body.year;
    session.run('CREATE(n:Movie{title:{titleParam}, released:{yearParam}}) RETURN n.title', { titleParam: title, yearParam: year })
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