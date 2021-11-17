const connection = require('../database/connection');

const sensors = require('./sensors')
const SerialPort = require("serialport");
const Sensor = require('../model/Sensor');
const Readline = SerialPort.parsers.Readline;

class ArduinoRead {

    // constructor() {
    //     this.listData = [];
    //     this.listData2 = [];

    //     this.listDataHour = [];
    //     this.listDataHour2 = [];
        
    //     this.__listDataTemp = [];
    // }

    // get List() {
    //     return this.listData;
    // }
    // get List2() {
    //     return this.listData2;
    // }

    // saveSensorData(temperatura, luminosidade) {
    //     return new Promise((resolve, reject) => {
    //         connection.query(
    //             `INSERT INTO medida (id, temperatura, umidade, momento, fk_aquario)
    //             VALUES (NULL, ${temperatura}, ${luminosidade}, NOW(), 0)`,
    //         function(error, results, fields){
    //             if(error){
    //                 throw new Error(error.sqlMessage);
    //             }
    //             resolve();
    //         });
    //     });
    // }
    saveSensorData(temperatura, luminosidade) {
        const date = new Date();
        const now = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        return Sensor.getInstance().save({
            temperatura: temperatura,
            umidade: luminosidade,
            momento: now,
            fk_aquario: Math.round(Math.random() * 4)
        });
    }
    fake_data() {
        setInterval(() => {
            let data_float = sensors.lm35(20, 30);
            let data_float2 = sensors.ldr();
            this.saveSensorData(data_float, data_float2);

            // if (this.listData.length === 60) {
            //     let sum = this.listData.reduce((a, b) => a + b, 0);
            //     this.listDataHour.push((sum / this.listData.length).toFixed(2));
            //     while (this.listData.length > 0) {
            //         this.listData.pop();
            //     } 
            // }
            // if (this.listData2.length === 60) {
            //     let sum2 = this.listData2.reduce((a, b) => a + b, 0);
            //     this.listDataHour2.push((sum2 / this.listData2.length).toFixed(2));
            //     while (this.listData2.length > 0) {
            //         this.listData2.pop();
            //     } 
            // }
            console.log('RND Data', data_float);
            console.log('RND Data2', data_float2);

            // this.listData.push(data_float);
            // this.listData2.push(data_float2);
        }, 2000);
    }

//     SetConnection() {
//         SerialPort.list().then(listSerialDevices => {

//             let listArduinoSerial = listSerialDevices.filter(serialDevice => {
//                 return serialDevice.vendorId == 2341 && serialDevice.productId == 43;
//             });

//             if (listArduinoSerial.length != 1) {
//                 this.fake_data();
//                 console.log("Arduino not found - Generating data");
//             } else {
//                 console.log("Arduino found in the com %s", listArduinoSerial[0].comName);
//                 return listArduinoSerial[0].comName;
//             }
//         }).then(comName => {
//             try {
//                 let arduino = new SerialPort(comName, { baudRate: 9600 });

//                 const parser = new Readline();
//                 arduino.pipe(parser);
//                 arduino.on('close',() => {
//                     console.log('Lost Connection');
//                     this.fake_data();
//                 });
//                 parser.on('data', (data) => {
//                     var dados = data.split(",");

//                     console.log('data', dados[0]);
//                     console.log('data2', dados[1]);

//                     this.listData.push(parseFloat(dados[0]));
//                     this.listData2.push(parseFloat(dados[1]));
//                 });
//             } catch (e) {
//                 this.fake_data();
//             }

//         }).catch(error => console.log(error));
//     }

    SetConnection() {
        SerialPort.list().then(listSerialDevices => {

            let listArduinoSerial = listSerialDevices.filter(serialDevice => {
                return serialDevice.vendorId == 2341 && serialDevice.productId == 43;
            });

            if (listArduinoSerial.length) {
                console.log("Arduino found in the com %s", listArduinoSerial[0].comName);
                return listArduinoSerial[0].comName;
            }
            throw new Error("Arduino not found.");
        }).then(comName => {
            let arduino = new SerialPort(comName, { baudRate: 9600 });

            const parser = new Readline();
            arduino.pipe(parser);
            arduino.on('close',() => {
                console.log('Lost Connection');
                this.fake_data();
            });
            parser.on('data', (data) => {
                var dados = data.split(",");
                this.saveSensorData(dados[0], dados[1]);

                console.log('data', dados[0]);
                console.log('data2', dados[1]);
            });
        }).catch(error => {
            console.log(error);
            this.fake_data();
        });
    }
}

const serial = new ArduinoRead();
serial.SetConnection();

// module.exports.ArduinoDataTemp = { List: serial.List, List2: serial.List2}
