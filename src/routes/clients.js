const express = require('express');

const router = express.Router();

const Client = require('../models/client.js').client;

const pool = require('../database.js');

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    const datos = await pool.query("select * from jeg_adm.client;").catch((e) => { console.log("--------------------------------"); console.error(e) });
    console.log(datos.rows);
    // await req.flash('success', 'Listar Prueba'); //como lo utilizo desde un middleware, lo tengo dsiponible desde req.
    const date = new Date();
    res.render('clients/list', { datos: datos.rows, tagExport: 'Clientes', date: date });
});

router.get('/list', isLoggedIn, async (req, res) => {
    var datos = await pool.query("select * from jeg_adm.client;").catch((e) => { console.log("--------------------------------"); console.error(e) });
    //console.log(datos.rows);
    console.log("List::::::_____>>>" + datos.rows);
    res.render('clients/list3', { datos: datos.rows });
});

router.get('/add', isLoggedIn, (req, res) => {
    console.log("/add -> client.js ROUTES");
    //res.send('HELLO WORD¡');
    res.render('clients/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    var client = new Client(req.body.dni, req.body.name, req.body.cuitcuil, req.body.addr, null, req.body.email, req.body.phone);
    client.show();
    await client.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/client.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });

    req.flash('success', 'Cliente guardado correctamente.'); //como lo utilizo desde un middleware, lo tengo dsiponible desde req.
    // aca creo el msj y despues lo muestro en la vista
    // dos parametros: nombre como vas a guardar tu msj y valor de este msj

    res.redirect('/clients');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    console.log("---------------------------------------------------------------------------");
    const { id } = req.params;
    const client = new Client(undefined, undefined, undefined, undefined, id, undefined, undefined);
    client.show();
    await client.pullData(2);
    client.show();
    // var datos = await pool.query("select * from jeg_adm.client where id="+id+";").catch((e)=> {console.log("--------------------------------");console.error(e)});
    res.render('clients/edit', { client: client });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { name, dni, cuitcuil, addr, phone, email } = req.body;

    const client = new Client(dni, name, cuitcuil, addr, id, email, phone);
    client.show();

    await client.updateData();
    req.flash('success', 'Cliente modificado correctamente.');
    res.redirect('/clients/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    console.log("params:" + req.params.id);
    const { id } = req.params;

    await pool.query("delete from jeg_adm.client where client_id=" + id).catch((e) => { console.error(e) });
    req.flash('success', 'Cliente eliminado correctamente.');
    res.redirect('/clients/list');
});

router.get('/details/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const client = new Client(undefined, undefined, undefined, undefined, id, undefined, undefined);
    client.show();
    await client.pullData(2);
    client.show();

    res.render('clients/details', { client: client });
});

module.exports = router;
