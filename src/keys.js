//direccion de la base de datos
//configuracion de la DB
module.exports = { //exporto un objeto(el de configuracion de la DB)
  database: { //propiedad del objeto
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    port: 5432
  },
  stringConnection: "postgres://postgres:postgres@localhost:5432/postgres", //// "postgres://postgres:postgres@localhost:5432/postgres",
}
