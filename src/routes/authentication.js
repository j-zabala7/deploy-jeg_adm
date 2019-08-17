const express = require('express');
const passport = require('passport'); // llamo directamente a passport(la propia biblioteca) no autenticate... ya que ya se inicializo , cuando traemos la biblioteca , ya viene poblada con los metodos de autenticacion que hemos definido
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth'); // al metodo lo ejecuto enla ruta que quiero proteger

router.get('/signup', isNotLoggedIn, (req,res) => {
    res.render('auth/signup');
});

// router.post('/signup', (req,res) => {
//     passport.authenticate('signup.local',{ // conmfigurado en archivo aparte
//         successRedirect: '/profile', // a donde reenvia cuando todo funcione...autenticacion correcta
//         failureRedirect: '/signup' , // cuando falla la autenticacion
//         failureFlash: true // para enviar msj en caso que falle...permite a passport recibir mensajes definidos
//     }); 
//     console.log(req.body);
//     res.send('received');
// });
 //otra manera de escribir el enrutador de arriba... es mas sencilla
router.post('/signup', isNotLoggedIn, passport.authenticate('signup.local',{ // conmfigurado en archivo aparte
    successRedirect: '/profile', // a donde reenvia cuando todo funcione...autenticacion correcta
    failureRedirect: '/signup' , // cuando falla la autenticacion
    failureFlash: true // para enviar msj en caso que falle...permite a passport recibir mensajes definidos
})
);

router.get('/signin', isNotLoggedIn, (req,res) => {
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, (req,res, next) => { // es una middleware por eso paso next
    passport.authenticate('signin.local',{
        successRedirect: '/profile',
        failureRedirect: '/signin' ,
        failureFlash: true  // msj a la vista
    })(req,res,next);
});

router.get('/profile',isLoggedIn , (req,res)=>{ // cuando el usr visite /profile, antes de ejecutar la logica(de renderizar en este caso), ejecuta otra logica isLoggedIn
    res.render('profile');                      // cada vez que el user visita esta ruta, se ejecuta isLoggedIn primero... de esta forma protejo , solo ve si esta logueado
});                                             // next del isLoggedIn en este caso es : (req,res)=>{res.render('profile'); });

// limpiar la sesion ... terminar con la sesion existente de usr en nuestra aplicacion
router.get('/logout', isLoggedIn, (req,res) => {
    req.logOut(); // metodo que borra de passport(viene definido)
    // una vez que no exista el usr lo redirecciono a la vista
    res.redirect('/signin');
});

module.exports = router;
