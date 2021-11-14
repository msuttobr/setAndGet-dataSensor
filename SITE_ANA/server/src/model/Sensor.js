const Model = require('./Model')

module.exports = class Sensor extends Model {
    constructor() {
        super("medida");
    }

    static getInstance() {
        if(!Sensor.instance) {
            Sensor.instance = new Sensor();
        }
        return Sensor.instance;
    }
}
