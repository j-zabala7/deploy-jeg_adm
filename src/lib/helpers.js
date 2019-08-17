// metodos utilizados para procesar determinada informacion(determinados datos dentro de tu aplicacion)
// aqui colocamos todas esas funciones

const bcrypt = require('bcryptjs'); // modulo de cifrado

const helper = {}; // creamos un obj, el cual tendra lo metodos(multiples) que podremos utilizar(reutilizar)

//metodo para cuando se regitra un usr
helper.encryptPassword = async (password) => { // metodo para encriptar contraseña(el cual toma como parametro la contraseña en texto plano) 
    const salt = await bcrypt.genSalt(10); // genera un hash, toma como parametro la cantidad de veces a ejecutar el algoritmo(mas veces, toma mas tiempo, pero sera mas seguro el cifrado)
                        // esta funcion toma tiempo, es asyncrona(como las consultas a la BD)...por ello lleva await 
    const hash = await bcrypt.hash(password,salt); // esta funcion es la que cifra la contraseña, es asincrona
                                // dos parametros: 1- password a cifrar 2- salt(hash)
                                // cifra password en base al patron de hash (cadena de caracteres)... cifra contrasela basado en la cadena(hash)
    return hash; // retorna password cifrado
};

// cuando nos autentiquemos(loguemos de nuevo en la app), tengo que comparar la contraseña que el usuario ingreso para loguearse y lo que tengo almacenado en la BD(cifrado) 
// bcrypt tiene un metodo que hace esa comparacion... creamo otro metodo que lo use... este metodo se usara en el logueo
helper.matchPassword = async (password, savedPassword) => { // password es en texto plano(la que el usr ingresa), savedPassword es lo que tengo en la BD
    try{
        return await bcrypt.compare(password, savedPassword); // recibe dos cosas: 1-password que vamos a comparar 2- lo que ya tengo ... compara dos string simplemente
                                            // compara lo que tengo guardado con lo que el usuario intenta loguearse... es asincrono
    }catch (e){
        console.log(e);
    }
};

module.exports = helper; // exportamos para que se pueda usar en la aplicacion
