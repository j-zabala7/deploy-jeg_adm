const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

const Work = require('../models/work').work;

router.get('/', isLoggedIn, async (req, res) => {
    const works = await pool.query("select work_id, type, work_state, work_description, to_char(start_date, 'DD-MM-YYYY') as start_date, to_char(end_date, 'DD-MM-YYYY') as end_date, pricexha, lot_id, work_ha, campaign_id, countryside_id, client_id, cereal, currency from jeg_adm.work").catch((e) => { console.log("-------------router work-------------------"); console.error(e) });
    var date = new Date();
    console.log(works.rows);
    res.render('work/list', { works: works.rows, tagExport: 'Trabajos', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    const clients = await pool.query("select client_id, client_name from jeg_adm.client").catch((e) => { console.log("-------------router work-------------------"); console.error(e) });
    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router work-------------------"); console.error(e) });
    console.log(clients.rows);
    console.log(campaigns.rows);
    res.render('work/add', { clients: clients.rows, campaigns: campaigns.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { id, type, state, description, start, end, price, lot_id, ha, camp_id, cs_id, client_id, cereal, currency } = req.body;
    const nWork = new Work(id, type, state, description, start, end, price, lot_id, ha, camp_id, cs_id, client_id, cereal, currency);
    nWork.show();

    await nWork.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/work.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });

    req.flash('success', 'Trabajo/Tarea creado correctamente.');
    res.redirect('/work/');
});

router.post('/infoClient', isLoggedIn, async (req, res) => {
    // console.log('infoClient '+req.body.idClient);
    var result = await pool.query("select countryside_id, countryside_name from jeg_adm.countryside where client_id=" + req.body.idClient + ";").catch((e) => { console.log("--------------info.js / infoClient------------------"); console.error(e) });
    console.log(result.rows);
    res.json(result.rows);
});

router.post('/infoCountryside', isLoggedIn, async (req, res) => {
    const id = req.body.idCountryside;
    // console.log('infoCountryside '+id);
    var result = await pool.query("select lot_id, lot_name from jeg_adm.lot where countryside_id='" + id + "';").catch((e) => { console.log("--------------info.js / infoClient------------------"); console.error(e) });
    console.log(result.rows);
    res.json(result.rows);
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const work = new Work(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router work edit-------------------"); console.error(e) });

    //const work = await pool.query("select * from jeg_adm where work_id = "+ id + ";").catch((e) => {console.log("----------------work.js -> edit-------------------"); console.log(e); } );
    await work.pullData();
    const clients = await pool.query("select client_id, client_name from jeg_adm.client").catch((e) => { console.log("----------------work.js -> edit-------------------"); console.log(e); });

    const countrysides = await pool.query("select countryside_id, countryside_name from jeg_adm.countryside where client_id = " + work.client_id + ";").catch((e) => { console.log("----------------work.js -> edit-------------------"); console.log(e); });

    const lots = await pool.query("select lot_id, lot_name from jeg_adm.lot where countryside_id = " + work.cs_id + ";").catch((e) => { console.log("----------------work.js -> edit-------------------"); console.log(e); });


    work.show();
    console.log(clients.rows);
    console.log(campaigns.rows);
    console.log(countrysides.rows);
    console.log(lots.rows)
    res.render('work/edit', { work: work, clients: clients.rows, campaigns: campaigns.rows, countrysides : countrysides.rows, lots : lots.rows });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log("id a editar "+id);
    const { type, state, start, end, cs_id, camp_id, description, lot_id, client_id, ha, price, currency, cereal } = req.body;
    const work = new Work(id, type, state, description, start, end, price, lot_id, ha, camp_id, cs_id, client_id, cereal, currency);
    console.log("post edit");
    work.show();
    await work.updateData();

    res.redirect('/work/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const work = new Work(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    await work.delete();

    res.redirect('/work/');
});

module.exports = router;
