const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session'); //almacenan datos, por defecto en la memoria del server
const flash = require('connect-flash'); //middleware
const {pool} = require('./database.js');
const pgSqlStoreSession = require('connect-pg-simple') (session);
const {database,stringConnection} = require('./keys.js');
const passport = require('passport'); // middleware

//  initialization
const app = express();
require('./lib/passport'); // para que la applicacion se entera de la autenticacion que estoy creando

//  setting
app.set('port' , process.env.PORT || 3000);
app.set('views' , path.join( __dirname , 'views' ) );
app.engine('.hbs' , exphbs({ // template engine configuration
  defaultLayout: 'main',  //estructira basica
  layoutsDir: path.join( app.get( 'views') , 'layouts'  ),
  partialsDir: path.join( app.get('views') , 'partials' ), //codigo comun a varias vistas ej. un chat
  extname: '.hbs', //extencion de los archivos
  helpers: require( './lib/handlebars.js' ) //no se puede ejecutar funcion por si sola en handlebars por eso uso helpers
}) );
app.set( 'view engine' , '.hbs' );

//  middlewares   -> se ejecutan cada vez que un usuario hacen una peticion
app.use(session({ // configuro la session
  secret: 'jegamnodejspgsession2019', // como va a guardar las sessiones...permite generar ids para las sesiones unicos(criptografia)
  resave: false, // si esta en true, fuerza que en cada peticion se vuelva a guardar en la DB sin importar si hubo un cambio o no
  saveUninitialized: false, // no guarda el objeto vacio en la DB(no inicializado, ya que la sesion es un obj que al principio esta en blanco), a menos que se canrguen algunas propiedades que se van agregando (ej user,etc)
  /* store: new pgSqlStoreSession({ 
   
   conString : stringConnection  ,  
   tableName : 'user_session',
    //pool : pool, //puede ser el pool o el string de conection
    //si cambia el nombre de la tabla de sesiones(session por defecto, como lo tenemos nosotros) se puede especificar aca
  }) */
}));
app.use(flash()); //modulo para enviar msj entre las distintas vistas ... requiere sessiones
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}) ); // aceptar desde los formularios datos que enviar el usuario... parametro dice que solo va a aceptar string(ej nombres), etc ... es decir datos sencillos, no imagenes esas cosas
app.use(express.json()); //acpetar json...enviar y recibir json con una aplicacion cliente
app.use(passport.initialize()); // inicia passporty
app.use(passport.session()); // donde guarda los datos passport y cmo lo maneja, para esto utiliza una sesion

//  global variables
app.use( (req, res, next) => { //middleware -> toma info usuario, lo que el server quiere responder y func para continuar con el resto del codigo-> middleware es codigo que se ejecuta entre la solicitud y la respuesta
  //app.locals.success = req.flash('success'); //tomo el msj guardado en 'success' y lo hago visible por medio de una variable global (traigo el msj y lo guardo en una var global) -> esto lo hace disponible en todas mis vistas
  //app.locals.name
  //res.locals.success = req.flash("success"); // msj de la require(solicitud), de la otra forma es de toda la app

  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message'); // le digo a la app que estos valores existen(que tome estos valores) 
  app.locals.user = req.user; // aqui obtengo el dato de la sesion (usr) y lo hago publico a las vistas
                              // req.user es el dato de la sesion de usuario

  console.log( "VAR globales");
  console.log("success(app.locals.success): "+app.locals.success);
  console.log("success(res.locals.success): "+res.locals.success);

  next();
} );

//  routes
app.use(require('./routes/index.js')); // rutas principales
app.use(require('./routes/authentication.js')); // rutas autenticar al usuario (de sing in , sing up y loguout ) -> todo login
app.use('/clients',require('./routes/clients.js')); // rutas de agregar,eliminar , actualizar y listar  cliente
  //en este caso quiero que todos las rutas de client le preceda un prefijo 'client'
  // /clients  -> todas las rutas de client
//app.use(require('./routes/info.js')); // 
app.use('/campaign',require('./routes/campaign'));
app.use('/countryside',require('./routes/countryside'));
app.use('/lot',require('./routes/lot'));
app.use('/work',require('./routes/work'));
app.use('/employee',require('./routes/employee'));
app.use('/withdrawal',require('./routes/withdrawal'));
app.use('/expense',require('./routes/expense'));
app.use('/at_work',require('./routes/at_work'));


//  public
app.use(express.static(path.join(__dirname, 'public'))); //informo donde esta la carpeta public(css,javascript,imagenes,feuntes,etc)

//  starting the server
app.listen(app.get('port') , () => {
  console.log("Server on port", app.get('port'));
});
