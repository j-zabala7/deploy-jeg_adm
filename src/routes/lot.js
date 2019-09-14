const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const Lot = require('../models/lot').lot;

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    const result = await pool.query("select lot_id, lot_name, lot_description, lot_ha, l.countryside_id, countryside_name from jeg_adm.lot l left join (select countryside_id, countryside_name from jeg_adm.countryside) cs on (cs.countryside_id = l.countryside_id);").catch((e) => { console.log("-------------router lot-------------------"); console.error(e) });
    var date = new Date();
    console.log('lotes: ' + result.rows);
    res.render('lot/list', { lots: result.rows, tagExport: 'Lotes', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    const countrysides = await pool.query("select * from jeg_adm.countryside").catch((e) => { console.log("-------------router lot-------------------"); console.error(e) });
    console.log("countrysides: " + countrysides.rows);
    res.render('lot/add', { countrysides: countrysides.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const lot = new Lot(null, req.body.name, req.body.ha, req.body.cs_id, req.body.description);
    lot.show();

    await lot.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/lot.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });

    req.flash('success', 'Lote creado correctamente.'); //como lo utilizo desde un middleware, lo tengo dsiponible desde req.
    // aca creo el msj y despues lo muestro en la vista
    // dos parametros: nombre como vas a guardar tu msj y valor de este msj

    res.redirect('/lot/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log('edit id :' + id);
    const lot = new Lot(id, null, null, null, null);
    await lot.pullData();
    console.log("despues de pullData");
    lot.show();

    const countrysides = await pool.query("select * from jeg_adm.countryside").catch((e) => { console.log("-------------router lot-------------------"); console.error(e) });
    console.log("c_id antes de renderizar: " + lot.cs_id);

    console.log("lots: " + lot.rows);
    res.render('lot/edit', { lot: lot, countrysides: countrysides.rows });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { name, description, ha } = req.body;
    const cs_id = req.body.cs_id_select;

    const lot = new Lot(id, name, ha, cs_id, description);
    lot.show();
    await lot.updateData();

    req.flash('success', 'Lote actualizado correctamente.');
    res.redirect('/lot/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;

    console.log("params de delete:" + id);

    await pool.query("delete from jeg_adm.lot where lot_id=" + id).catch((e) => { console.error(e) });
    req.flash('success', 'Lote eliminado correctamente.');
    res.redirect('/lot/');


});

router.get('/details/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log('edit id :' + id);
    const lot = new Lot(id, null, null, null, null);
    await lot.pullData();
    console.log("despues de pullData");
    lot.show();

    const countrysides = await pool.query("select * from jeg_adm.countryside").catch((e) => { console.log("-------------router lot-------------------"); console.error(e) });
    console.log("c_id antes de renderizar: " + lot.cs_id);

    console.log("lots: " + lot.rows);
    res.render('lot/details', { lot: lot, countrysides: countrysides.rows });
});

module.exports = router;
