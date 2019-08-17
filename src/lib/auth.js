// este archivo va a exportar un obj que va a tener un metodo 
// el metodo permite saber si el usr esta logueado o no 
module.exports = {
    //comprueba si el usuario esta logueado o no...lo ejecutamos en las rutas de express(por ello necesitamos req,res y next), ya que por cada ruta vamos a procesar esos datos(especialmente req) 
    isLoggedIn(req, res, next){
        if (req.isAuthenticated()){ // cuando inicilizamos passport en index.js, este esta poblando el objeto req(request) con nuevos metodos (como logout y este que usamos aqui)
                                                      // devuelve un true(si el usuario o los datos de la sesion del usr existen) o un false(sesion no existe, usr no logueado) ... es un metodo de passport que lo poblo en el objeto request
            return next(); // si existe la sesion continuo con el resto de codigo...codigo siguente
        }
        return res.redirect('/signin'); // si no existe sesion redirecciono a signin
    },
    isNotLoggedIn(req, res, next){ // rutas que quieres que el usr vea si esta logueado (ej:signin)
        if (!req.isAuthenticated()){ // usr no autenticado
            return next(); // continua
        }
        return res.redirect('/profile'); // usr autenticado
    }
}

// para proteger rutas sino esta logueado