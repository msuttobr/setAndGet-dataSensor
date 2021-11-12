const express = require('express');
const connection = require('../database/connection');

// const { ArduinoDataTemp } = require('../arduino/newserial');
require('../arduino/newserial');
const router = express.Router();

router.get('/', async (request, response, next) => {
    // let sum = ArduinoDataTemp.List.reduce((a, b) => a + b, 0);
    // let average = (sum / ArduinoDataTemp.List.length).toFixed(2);

    // let sum2 = ArduinoDataTemp.List2.reduce((a, b) => a + b, 0);
    // let average2 = (sum2 / ArduinoDataTemp.List2.length).toFixed(2);

    const data = (await loadSensorData()).reverse();

    data.map(function(item) {
        item.temperatura = parseFloat(item.temperatura);
        item.luminosidade = parseFloat(item.luminosidade);
    });

    const sum = {
        // temperatura: data.reduce((a, b) => a.temperatura + b.temperatura, { temperatura: 0 }),
        // luminosidade: data.reduce((a, b) => a.luminosidade + b.luminosidade, { luminosidade: 0 })
        temperatura: (() => {
            let sum = 0;
            for(let item of data) {
                sum+= item.temperatura;
            }
            return sum;
        })(),
        luminosidade: (() => {
            let sum = 0;
            for(let item of data) {
                sum+= item.luminosidade;
            }
            return sum;
        })()
    };
    const average = {
        temperatura: sum.temperatura/data.length,
        luminosidade: sum.luminosidade/data.length,
    };

    const list = {
        temperatura: [],
        luminosidade: [],
    };
    for(let item of data) {
        list.temperatura.push(item.temperatura);
        list.luminosidade.push(item.luminosidade);
    }

    response.json({
        data: list.temperatura,
        total: list.temperatura.length,
        average: (isNaN(average.temperatura) ? 0 : average.temperatura).toFixed(2),
        
        data2: list.luminosidade,
        total2: list.luminosidade.length,
        average2: (isNaN(average.luminosidade) ? 0 : average.luminosidade).toFixed(2),
    });
});


async function loadSensorData() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT id, temperatura, umidade as 'luminosidade', momento, fk_aquario FROM medida WHERE fk_aquario = 0 ORDER BY id DESC LIMIT 60;`, function(error, results, fields){
        // connection.query(`SELECT id, temperatura, umidade as 'luminosidade', momento, fk_aquario FROM medida WHERE fk_aquario = 0 ORDER BY id DESC;`, function(error, results, fields){
                if(error){
                throw new Error(error.sqlMessage);
            }
            resolve(results);
        });
    });
}

module.exports = router;