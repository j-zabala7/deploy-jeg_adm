const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const Campaign = require('../models/campaign').campaign;


const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    var result = await pool.query("select campaign_id, campaign_name, to_char(campaign_date_start, 'DD-MM-YYYY') as campaign_date_start, to_char(campaign_date_end, 'DD-MM-YYYY') as campaign_date_end, campaign_description from jeg_adm.campaign").catch((e) => { console.log("-------------router campaign-------------------"); console.error(e) });;
    console.log(result.rows);
    var date = new Date();
    console.log(date);
    console.log(date.toString());
    console.log(date.toLocaleDateString());

    res.render('campaign/list', { datos: result.rows, tagExport: 'Campaña', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    res.render('campaign/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    var campaign = new Campaign(null, req.body.name, req.body.start, req.body.end, req.body.description);
    campaign.show();
    // console.log("add:: start: "+req.body.start);
    // console.log("add:: end "+req.body.end);
    // console.log("add campaign:: start: "+campaign.start);
    // console.log("add campaign:: end: "+campaign.end);

    await campaign.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/campaign.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });

    req.flash('success', 'Campaña creada correctamente.'); //como lo utilizo desde un middleware, lo tengo dsiponible desde req.
    // aca creo el msj y despues lo muestro en la vista
    // dos parametros: nombre como vas a guardar tu msj y valor de este msj

    res.redirect('/campaign');
});

router.get('/edit/:id', isLoggedIn, (req, res) => {
    console.log("params edit get:" + req.params.id);

    const campaign = new Campaign(req.params.id, null, null, null, null);

    campaign.pullData();
    console.log("despues de pullData");
    campaign.show();

    res.render('campaign/edit', { campaign: campaign });

});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const campaign = new Campaign(req.params.id, req.body.name, req.body.start, req.body.end, req.body.description);
    console.log("antes del show en edit post");
    campaign.show();
    await campaign.updateData();

    req.flash('success', 'Campaña modificado correctamente.');
    res.redirect('/campaign/edit/' + req.params.id);

});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    console.log("params de delete:" + req.params.id);

    const { id } = req.params;

    await pool.query("delete from jeg_adm.campaign where campaign_id=" + id).catch((e) => { console.error(e) });
    req.flash('success', 'Camapaña eliminada correctamente.');
    res.redirect('/campaign/');


});

router.get('/details/:id', isLoggedIn, (req, res) => {
    console.log("params edit get:" + req.params.id);

    const campaign = new Campaign(req.params.id, null, null, null, null);

    campaign.pullData();
    console.log("despues de pullData");
    campaign.show();

    res.render('campaign/details', { campaign: campaign });

});

router.get('/statistics', isLoggedIn, async (req, res) => {
    const result = await pool.query("select camp.campaign_id, campaign_name, sum(w.pricexha*w.work_ha) as total_gain, sum(w.work_ha) as total_has, sum(amount_invoice_line) as total_invoiced, sum(invoiced_ha) as invoiced_has from (select campaign_id, campaign_name from jeg_adm.campaign) camp left join (select work_id, campaign_id, type, pricexha, work_ha from jeg_adm.work) w on (w.campaign_id = camp.campaign_id) left join (select invoice_id, invoice_line_id, invoiced_ha, work_id, amount_invoice_line from jeg_adm.invoice_line) inv_l on (inv_l.work_id = w.work_id) left join (select invoice_id, subtotal_amount, total_amount from jeg_adm.invoice) inv on (inv.invoice_id = inv_l.invoice_id) group by camp.campaign_id, campaign_name;").catch((e) => {
        console.log('----------------------------- statistics campaign.js ------------');
        console.error(e);
    });

    console.log(result.rows);

    res.render('campaign/statistics', { statistics: result.rows });
});

module.exports = router;
