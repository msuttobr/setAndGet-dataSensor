const connection = require('../database/connection');

module.exports = class Model {
    table;
    constructor(table) {
        this.table = table;
    }

    reset() {
        return new Promise((resolve, reject) => {
            connection.query(`TRUNCATE ${this.table};`, function(error, results, fields){
                if(error){
                    reject(error.sqlMessage);
                }
                resolve();
            });
        });
    }
    list(order = 'ASC', limit = null, offset = 0) {
        return new Promise((resolve, reject) => {
            let limitSql = "";
            if(limit!==null) {
                limitSql = `LIMIT ${offset},${limit}`;
            }
            connection.query(`SELECT * FROM ${this.table} ORDER BY id ${order} ${limitSql};`, function(error, results, fields){
                if(error){
                    reject(error.sqlMessage);
                }
                resolve(results);
            });
        });
    }
    get(id) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM ${this.table} WHERE id = ${id};`, function(error, results, fields){
                if(error){
                    reject(error.sqlMessage);
                }
                resolve(results[0]);
            });
        });
    }

    save(object) {
        return new Promise((resolve, reject) => {
            let sql;
            if (object.id) {
                let updates = "";
                for(let key in object) {
                    let value = object[key];
                    if(updates!="") {
                        updates+= ",";
                    }
                    updates+= `${key} = '${value}'`;
                }
                sql = `UPDATE ${this.table} SET ${updates}`;
            } else {
                let fields = Object.keys(object).join(", ");
                let values = Object.values(object).join("', '");
                sql = `INSERT INTO ${this.table} (${fields}) VALUES ('${values}')`;
            }
            connection.query(sql, function(error, results, fields){
                if(error){
                    reject(error.sqlMessage);
                }
                resolve();
            });
        });
    }
}