const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api', require('./src/controller/controller'));
app.use(express.static('../public_html', {
    extensions: ['html']
}));

const server = app.listen(3000);
console.log("Express started at port", server.address().port);