const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database'); // traigo la coneccion
const helpers = require('../lib/helpers');

// log in
// si el usr existe, empiezo a validar su contraseña, sino retorno a sign in con un msj flash (al igual q si la contraseña es incorrecta)
passport.use('signin.local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true  // en este caso no haria falta xq no estamos guardando nada (pero por si luego se necesita otro dato extra lo pasamos)
}, async (req,username,password,done) => {
    const result = await pool.query("select * from jeg_adm.user where username='"+username+"';");
    console.log(result.rows);
    if(result.rows.length > 0){ // encontro el usuario
        const user = result.rows[0]; // me quedo con el primero
        const validPassword = await helpers.matchPassword(password,user.password); // como tengo el usr, valido su contraseña... matchPassword compara contraseñas y es asincrono
        if (validPassword){ // conincide la contraseña(es correcta)
            done(null, user, req.flash('success','Bienvenido '+username+'!.')); // como la contraseña es correcta, termino con el proceso de signin con null (no hubo errores), el user (para que lo serialize y lo des-serialize), y un msj flash que diga que todo fue correcto
        }else{  // no conincidieron las contraseñas
            done(null, false, req.flash('message','Contraseña Incorrecta. Por favor, intentelo de nuevo.')); // termino con el proceso de signin con null (no ocurrio un error como tal), false (no le enviamos un usr ya que no seria correcto) y un msj flash
        }
    }else{ // usr incorrecto(no encontro ningun usuario)
        return done(null, false, req.flash('message','El Usuario(username: '+username+') no existe.')); // termino el signin con un done con null (no encontro ningun usr pero no es un error como tal), un false ya que no encontro nada(no devuelvo nada), y un msj flash 
    }
    
}));

passport.use('signup.local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // para poder recicibir el objeto request dentro de la funcion que ejecuta el local strategy...info del request.body
}, async (req, username, password, done)=> {  // done es un callback para continuar con el resto del codigo que tenemos en el servidor..lo ejecutamos cuando termino el proceso de autenticacion
                                            //el req.body tmb tiene los datos de username y password.. ademas de estar en las var
    console.log(req.body);
    const {fullname} = req.body;
    const user_id = 'default';
    const newUser = {
        user_id,
        username, //en js eso es el resumen de: username: username,
        password,
        fullname // como al fullname no lo recibo como parametro , lo tengo que importar del req.body
    };
    newUser.password = await helpers.encryptPassword(password); // antes de guardarlo lo vamos a cifrar... este metodo toma una contraseña y la cifra... es asincrono
    const result = await pool.query("insert into jeg_adm.user values ("+newUser.user_id+",'"+newUser.username+"','"+newUser.password+"','"+newUser.fullname+"');" ); // le paso el conjunto de datos
    console.log(result);
    const res = await pool.query("SELECT currval(pg_get_serial_sequence('jeg_adm.user', 'user_id'));" ); // obtengo el id del usuario insertado
    console.log(res.rows[0].currval);
    newUser.user_id = res.rows[0].currval;


    return done(null, newUser); // para que continue con el resto...me retorna el callback done, para que continue...toma un error (null en este caso, no hay ningun error ) y un usr(le paso newUser para que lo almacene en una sesion) 
}));

// si o si tenes que definir dos partes de passport
// serializar el usuario y desserializar
// para almacenar usuarios en sesion
// cuando serializo estoy guardando el id del usuario
 passport.serializeUser((user,done)=> {  // para guardar el usurio dentro de la sesion... toma el usr y el callback para que continue
    console.log(user.user_id);
    done(null, user.user_id); // recibe error(no hay en este caso) y id de usr... gracias a id se guarda en la sesion
 });

 // cuando des-serializo estoy tomando ese id que almacene en el serializeUser, para volver a obtener los datos
 // realiza una consulta a la BD , por eso es async
 passport.deserializeUser( async (id,done) => { // toma id  de usr y callback para continuar
    console.log(id);
    const rows = await pool.query("select * from jeg_adm.user where user_id='"+id+"';"); // consulta ala BD, toma timepo
    console.log(rows.rows[0]);
    done(null,rows.rows[0]);
 });

// usr almacenado en las sesiones
 // cualquiera que se autentique con passport(que use sign in o sign up...login o registro) , se serializa el dato del usuario en memoria(sesion de nuestra app)
 // se optiene desde request, pero hay que hacerlo visibles a las vistas (var globales)