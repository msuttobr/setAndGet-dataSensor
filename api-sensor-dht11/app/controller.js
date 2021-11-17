const express = require('express');
const { ArduinoData } = require('./serial')
const router = express.Router();
const db = require('./connection');

router.get('/temperature', (request, response, next) => {

    
    var sql = `SELECT * FROM medida ORDER BY id DESC LIMIT 60;`;
    db.query(sql, function(err, result){
        if(err) throw err;
        
        let sum = 0;
        let listDataTemp = [];
        let data_temp = Object.values(result);

        for (let dado of data_temp) {
            sum += Number(dado.temperatura);
            listDataTemp.push(dado.temperatura);
        }
        let average = sum / data_temp.length;

        //listDataTemp.reverse();

        response.json({
            data: listDataTemp,
            total: listDataTemp.length,
            average: isNaN(average) ? 0 : average,
        });
    });
});

router.get('/humidity', (request, response, next) => {

    var sql = `SELECT * FROM medida ORDER BY id DESC LIMIT 60;`;
    db.query(sql, function(err, result){
        if(err) throw err;

        let sum = 0;
        let listDataHumi = [];

        let data_humi = Object.values(result);
        
        for (let dado of data_humi) {
            sum += Number(dado.umidade);
            listDataHumi.push(dado.umidade);
        }
        let average = sum / data_humi.length;

        //listDataHumi.reverse();

        response.json({
            data: listDataHumi,
            total: listDataHumi.length,
            average: isNaN(average) ? 0 : average,
        });
    });
});

router.post('/sendData', (request, response) => {
    temperatura = ArduinoData.ListTemp[ArduinoData.ListTemp.length - 1];
    umidade = ArduinoData.List[ArduinoData.List.length - 1];

    if(!temperatura || !umidade) {
        return;
    }
    var sql = `INSERT INTO medida (temperatura, umidade, momento, fk_aquario) VALUES (${temperatura}, ${umidade}, now(), ${((Math.random() * 3) + 1).toFixed(0)});`;
    db.query(sql, function(err, result){
        if(err) throw err;
        console.log("Medidas inseridas: " + result.affectedRows)
    });
    response.sendStatus(200);
})

module.exports = router;