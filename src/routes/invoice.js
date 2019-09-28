const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const Invoice = require('../models/invoice').invoice;
const InvoiceLine = require('../models/invoice_line').invoice_line;


const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    // const invoices = await pool.query("select invoice_currency, invoice_nro, invoice_type, invoice_state, client_id, invoice_description, invoice_id, subtotal_amount, total_amount, to_char(invoice_date, 'DD-MM-YYYY') as invoice_date, iva_id from jeg_adm.invoice").catch((e) => { console.log("-------------router Invoice-------------------"); console.error(e) });
    //     const invoices = await pool.query("select invoice_currency, amount_iva, invoice_nro, invoice_type, invoice_state, client_id, invoice_description, invoice_id, subtotal_amount, total_amount, to_char(invoice_date, 'DD-MM-YYYY') as invoice_date, iva_id, client_name from (jeg_adm.invoice inv natural join (select client_id, client_name from jeg_adm.client) cli);").catch((e) => {

    const invoices = await pool.query("select invoice_currency, iva_value, iva_description, amount_iva, invoice_nro, invoice_type, invoice_state, client_id, invoice_description, invoice_id, subtotal_amount, total_amount, to_char(invoice_date, 'DD-MM-YYYY') as invoice_date, inv.iva_id, client_name from (jeg_adm.invoice inv natural join (select client_id, client_name from jeg_adm.client) cli left join (select * from jeg_adm.iva) iva on iva.iva_id = inv.iva_id);").catch((e) => {
        console.log("-------------router Invoice-------------------");
        console.error(e)
    });

    var date = new Date();

    console.log(invoices.rows);

    res.render('invoice/list', { invoices: invoices.rows, tagExport: 'Facturas', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    const clients = await pool.query("select * from jeg_adm.client").catch((e) => { console.log("-------------router invoice-------------------"); console.error(e) });
    const ivas = await pool.query("select * from jeg_adm.iva;").catch((e) => {
        console.log("---------------invoice add iva-----------");
        console.log(e);
    });
    console.log(clients.rows);
    console.log(ivas.rows);

    res.render('invoice/add', { clients: clients.rows, ivas: ivas.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { client_id, total, date, description, subtotal, currency, state, iva, nro, type, amount_iva } = req.body;
    const invoice = new Invoice(null, client_id, total, subtotal, iva, state, date, currency, description, nro, type, amount_iva);
    invoice.show();

    await invoice.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/invoice.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });
    req.flash('success', 'Factura cargada correctamente.');
    res.redirect('/invoice/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log('edit id :' + id);
    const invoice = new Invoice(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await invoice.pullData();
    console.log("despues de pullData");
    invoice.show();
    const ivas = await pool.query("select * from jeg_adm.iva;").catch((e) => {
        console.log("---------------invoice add iva-----------");
        console.log(e);
    });

    console.log(ivas.rows);

    const clients = await pool.query("select client_id, client_name from jeg_adm.client").catch((e) => { console.log("-------------router invoice-------------------"); console.error(e) });

    console.log(clients.rows);

    res.render('invoice/edit', { invoice: invoice, ivas: ivas.rows, clients: clients.rows });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { client_id, total, date, subtotal, iva, description, state, currency, nro, type, amount_iva } = req.body;

    const invoice = new Invoice(id, client_id, total, subtotal, iva, state, date, currency, description, nro, type, amount_iva);
    invoice.show();
    await invoice.updateData();

    req.flash('success', 'Factura actualizada correctamente.');
    res.redirect('/invoice/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;

    const invoice = new Invoice(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await invoice.delete().catch((e) => {
        console.log("---------------invoice router delete------------");
        console.log(e);
    });
    req.flash('success', 'Factura eliminada correctamente.');
    res.redirect('/invoice/');


});

router.get('/:id/addline', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const works = await pool.query("select work_id, type as work_type, pricexha, work_ha, cereal, currency from jeg_adm.work;").catch((e) => {
        console.log("------------invoice/addline---------");
        console.log(e);
    });

    const invoice = await pool.query("select * from jeg_adm.invoice where invoice_id=" + id + ";").catch((e) => {
        console.log("------------invoice/addline invoice data---------");
        console.log(e);
    });

    console.log("---------------------------------------------__>works");
    console.log(invoice.rows);

    const data = {
        works: works.rows,
        works2: JSON.stringify(works.rows),
        id: id
    };

    // res.render('invoice/addline', data);
    res.render('invoice/addline', { invoice: invoice.rows, works: works.rows, works2: JSON.stringify(works.rows) }); // ver que hace y porque hay que poner JSON.stringify
});

router.post('/:id/addline', async (req, res) => {
    const { currency, invoiced_ha, total_ha, description, work_id, nro, amount, pricexha } = req.body;
    const { id } = req.params;
    console.log("post de addline, id= " + id);

    const invoice_line = new InvoiceLine(undefined, id, invoiced_ha, total_ha, amount, currency, work_id, description);
    invoice_line.show();

    await invoice_line.makePersistent().catch((e) => {
        console.log("--------------------invoice.js add invoice_line-----------------");
        console.log(e);
    });

    req.flash('success', 'Linea de Factura cargada correctamente.');
    res.redirect('/invoice/');

});

router.post('/:id/listline', async (req, res) => {
    const { id } = req.params;

    const line_work = await pool.query('select * from (select * from jeg_adm.invoice_line where invoice_id=' + id + ') inv natural join (select * from jeg_adm.work) wor;').catch((e) => {
        console.log('-----------------------------invoice.js listline---------------');
        console.log(e);
    });

    console.log(line_work.rows);

    res.json(line_work.rows);
});

router.get('/:id/deleteline/:idline', async (req, res) => {
    const { id, idline } = req.params;

    console.log("id de invoice " + id + ". IDLINE  " + idline + ".");

    const invoice_line = new InvoiceLine(idline, id, undefined, undefined, undefined, undefined, undefined, undefined);

    await invoice_line.delete().catch((e) => {
        console.log('-----------------------------invoice.js delete line---------------');
        console.log(e);
    });

    req.flash('success', 'Linea de Factura eliminada correctamente.');
    res.redirect('/invoice/');

});

router.get('/:id/editline/:idline', async (req, res) => {
    const { id, idline } = req.params;

    console.log("id de invoice " + id + ". IDLINE  " + idline + ".");

    const invoice_line = new InvoiceLine(idline, id, undefined, undefined, undefined, undefined, undefined, undefined);

    const inv_line_work = await pool.query('select * from (select * from (select * from jeg_adm.invoice_line where invoice_line_id=' + idline + ') inv_l inner join (select * from jeg_adm.invoice where invoice_id=' + id + ') inv_d on inv_l.invoice_id = inv_d.invoice_id ) inv inner join (select * from jeg_adm.work) wor on wor.work_id = inv.work_id;').catch((e) => {
        console.log('-----------------------------invoice.js listline---------------');
        console.log(e);
    });

    await invoice_line.pullData().catch((e) => {
        console.log('-----------------------------invoice.js edit line---------------');
        console.log(e);
    });

    const works = await pool.query("select work_id, type as work_type, pricexha, work_ha, cereal, currency from jeg_adm.work;").catch((e) => {
        console.log("------------invoice/editline work data---------");
        console.log(e);
    });

    const invoice = await pool.query("select * from jeg_adm.invoice where invoice_id=" + id + ";").catch((e) => {
        console.log("------------invoice/editline invoice data---------");
        console.log(e);
    });

    res.render('invoice/editline', { invoice_line: invoice_line, works: works.rows, invoice: invoice.rows, invoice_line_work: inv_line_work.rows, works2: JSON.stringify(works.rows) }); // ver que hace y porque hay que poner JSON.stringify
});

router.post('/:id/editline/:idline', isLoggedIn, async (req, res) => {
    const { currency, invoiced_ha, total_ha, description, work_id, nro, amount, pricexha } = req.body;
    const { id, idline } = req.params;
    console.log("post de addline, id= " + id);

    const invoice_line = new InvoiceLine(idline, id, invoiced_ha, total_ha, amount, currency, work_id, description);
    invoice_line.show();

    await invoice_line.updateData().catch((e) => {
        console.log("--------------------invoice.js edit invoice_line-----------------");
        console.log(e);
    });


    req.flash('success', 'Linea de Factura editada correctamente.');
    res.redirect('/invoice/');
});

router.get('/details/:id', async (req, res) => {
    const { id } = req.params;
    console.log('edit id :' + id);
    const invoice = new Invoice(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await invoice.pullData();
    console.log("despues de pullData");
    invoice.show();

    res.render('invoice/details', { invoice: invoice });
});

module.exports = router;
