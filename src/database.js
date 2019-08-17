//archivo de conexion a la DB
const {Pool} = require('pg');
const {database} = require('./keys.js'); //me quedo solo con la propiedad database

const pool = new Pool(database);

pool.connect( (err, client,release ) => {
    console.log(database);
    if(err){
        console.error("Error on conect DB kako malo");
    }else{
    if(client){
        release();
    }
    console.log("DB is conected");
    return;
}
} );

module.exports = pool;