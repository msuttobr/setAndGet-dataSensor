const express = require('express');
const connection = require('../database/connection');
const Sensor = require('../model/Sensor');
const Usuario = require('../model/Usuario');

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
        item.luminosidade = parseFloat(item.umidade);
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

router.get('/reset', async (request, response, next) => {
    Sensor.getInstance().reset();
    response.json({
        "resetado": true
    });
});

router.post('/usuarios/cadastrar', async (request, response, next) => {
    try {
        await Usuario.getInstance().save({
            nome: request.body.nome,
            senha: request.body.senha,
            email: request.body.email,
        });
        response.status(301).redirect(301, '/dashboard/dashboard.html');
    } catch(e) {
        response.status(301).redirect(301, '/login.html?error='+e.message);
    }
});
// async function loadSensorData() {
//     return new Promise((resolve, reject) => {
//         connection.query(`SELECT id, temperatura, umidade as 'luminosidade', momento, fk_aquario FROM medida WHERE fk_aquario = 0 ORDER BY id DESC LIMIT 60;`, function(error, results, fields){
//         // connection.query(`SELECT id, temperatura, umidade as 'luminosidade', momento, fk_aquario FROM medida WHERE fk_aquario = 0 ORDER BY id DESC;`, function(error, results, fields){
//                 if(error){
//                 throw new Error(error.sqlMessage);
//             }
//             resolve(results);
//         });
//     });
// }


async function loadSensorData() {
    return Sensor.getInstance().list("", 'DESC', 60, 0);
}

module.exports = router;