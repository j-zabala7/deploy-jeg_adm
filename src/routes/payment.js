const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const Payment = require('../models/payment').payment;

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    const payments = await pool.query("select campaign_name, payment_method, payment_currency, id_payment_method, pay.campaign_id, payment_description, payment_id, pay.work_id, payment_total, to_char(payment_date, 'DD-MM-YYYY') as payment_date, type, pay.invoice_id, invoice_nro from jeg_adm.payment pay left join (select campaign_id, campaign_name from jeg_adm.campaign) camp on (camp.campaign_id = pay.campaign_id) left join (select work_id, type from jeg_adm.work) w on (w.work_id = pay.work_id) left join (select invoice_id, invoice_nro from jeg_adm.invoice) inv on (inv.invoice_id = pay.invoice_id);").catch((e) => { console.log("-------------router Expenses-------------------"); console.error(e) });
    var date = new Date();
    console.log(payments.rows);

    res.render('payment/list', { payments: payments.rows, tagExport: 'Pagos', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router expenses-------------------"); console.error(e) });
    const invoices = await pool.query("select invoice_id, invoice_nro, client_name from jeg_adm.invoice inv left join (select client_name,client_id from jeg_adm.client) cli on (cli.client_id=inv.client_id);").catch((e) => { console.log("-------------router payment-------------------"); console.error(e) });

    console.log(campaigns.rows);

    res.render('payment/add', { campaigns: campaigns.rows, invoices: invoices.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { payment_method, camp_id, date, description, work_id, id_p_m, total, invoice_id, currency } = req.body;
    const payment = new Payment(null, invoice_id, total, date, description, payment_method, id_p_m, camp_id, work_id, currency);
    payment.show();

    await payment.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/payment.js::/add ");
        console.error(e)
        console.log("-------------------------------");
        req.flash('message', 'Error al cargar el nuevo Pago.');
        res.redirect('/payment/');
    });
    req.flash('success', 'Pago cargado correctamente.');
    res.redirect('/payment/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    //console.log('edit id :' + id);
    const payment = new Payment(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await payment.pullData();
    //console.log("despues de pullData");
    console.log(payment.date);
    payment.show();

    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router expense-------------------"); console.error(e) });

    const invoices = await pool.query("select invoice_id, invoice_nro, client_name from jeg_adm.invoice inv left join (select client_name, client_id from jeg_adm.client) cli on (cli.client_id=inv.client_id);").catch((e) => { console.log("-------------router payment-------------------"); console.error(e) });

    //console.log(campaigns.rows);
    var works;
    if (payment.camp_id) {
        works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + payment.camp_id + ";").catch((e) => {
            console.log("-------------------payment router------------------");
            console.log(e);
        });
        works = works.rows;
    } else {
        works = undefined;
    }
    res.render('payment/edit', { payment: payment, campaigns: campaigns.rows, works: works, invoices: invoices.rows });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { payment_method, camp_id, date, description, work_id, id_p_m, total, invoice_id, currency } = req.body;

    console.log('post edit------------------>')
    console.log(date)
    console.log(description)

    const payment = new Payment(id, invoice_id, total, date, description, payment_method, id_p_m, camp_id, work_id, currency);
    payment.show();

    await payment.updateData().catch((e) => {
        console.error(e);
        req.flash('message', 'Error al actualizar Pago.');
        res.redirect('/payment/edit/' + id);
    });

    req.flash('success', 'Pago actualizado correctamente.');
    res.redirect('/payment/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;
    const payment = new Payment(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    await payment.delete().catch((e) => {
        console.error(e);
        req.flash('message', 'Error al eliminar Pago.');
        res.redirect('/payment/');
    });
    req.flash('success', 'Pago eliminado correctamente.');
    res.redirect('/payment/');
});

router.post('/infoCampaign', isLoggedIn, async (req, res) => {
    const { camp_id } = req.body;
    const works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + camp_id + ";").catch((e) => {
        console.log("-------------------payment/infoCampaign-----------------");
        console.log(e);
    });

    res.json(works.rows);
});

module.exports = router;
