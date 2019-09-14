const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

const Countryside = require('../models/countryside').countryside;


router.get('/', isLoggedIn, async (req, res) => {
    const result = await pool.query("select countryside_id, countryside_name, location, countryside_ha, cs.client_id, client_name from jeg_adm.countryside cs left join (select client_id, client_name from jeg_adm.client) cl on (cs.client_id = cl.client_id);").catch((e) => { console.log("-------------router campaign-------------------"); console.error(e) });;
    console.log(result.rows);
    var date = new Date();

    res.render('countryside/list', { datos: result.rows, tagExport: 'Campos', date: date });

});

router.get('/add', isLoggedIn, async (req, res) => {
    const clients = await pool.query("select client_id,client_name from jeg_adm.client").catch((e) => { console.log("-------------router campaign-------------------"); console.error(e) });;
    console.log("  CLIENTES EN ADD CAMPO " + clients.rows);
    res.render('countryside/add', { clients: clients.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const countryside = new Countryside(null, req.body.name, req.body.location, req.body.ha, req.body.c_id);
    countryside.show();

    await countryside.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/countryside.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });

    req.flash('success', 'Campo creado correctamente.'); //como lo utilizo desde un middleware, lo tengo dsiponible desde req.
    // aca creo el msj y despues lo muestro en la vista
    // dos parametros: nombre como vas a guardar tu msj y valor de este msj

    res.redirect('/countryside/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    console.log("params edit get:" + req.params.id);

    const countryside = new Countryside(req.params.id, null, null, null, null);

    await countryside.pullData();
    console.log("despues de pullData");
    countryside.show();

    const clients = await pool.query("select * from jeg_adm.client").catch((e) => { console.log("-------------router campaign-------------------"); console.error(e) });
    console.log("c_id antes de renderizar: " + countryside.c_id);
    const c_id = countryside.c_id;
    console.log("clients: " + clients.rows);
    res.render('countryside/edit', { countryside: countryside, clients: clients.rows, c_id: c_id });

});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const countryside = new Countryside(req.params.id, req.body.name, req.body.location, req.body.ha, req.body.c_id_select);
    console.log("antes del show en edit post");
    countryside.show();
    await countryside.updateData();

    req.flash('success', 'Campo modificado correctamente.');
    res.redirect('/countryside/edit/' + req.params.id);

});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    console.log("params de delete:" + req.params.id);

    const { id } = req.params;

    await pool.query("delete from jeg_adm.countryside where countryside_id=" + id).catch((e) => { console.error(e) });
    req.flash('success', 'Campo eliminado correctamente.');
    res.redirect('/countryside/');


});

router.get('/details/:id', isLoggedIn, async (req, res) => {
    console.log("params edit get:" + req.params.id);

    const countryside = new Countryside(req.params.id, null, null, null, null);

    await countryside.pullData();
    console.log("despues de pullData");
    countryside.show();

    const clients = await pool.query("select * from jeg_adm.client").catch((e) => { console.log("-------------router campaign-------------------"); console.error(e) });;


    res.render('countryside/details', { countryside: countryside, clients: clients.rows });

});



module.exports = router;
