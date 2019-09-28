const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const { pdf_creator } = require('../public/js/pdf-receipt');

const Withdrawal = require('../models/withdrawal').withdrawal;

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas


router.get('/', isLoggedIn, async (req, res) => {
    const withdrawals = await pool.query("select campaign_name, employee_name, type, withdrawal_currency, w.employee_id, w.campaign_id, withdrawal_description, withdrawal_id, w.work_id, deliverer, withdrawal_amount, to_char(withdrawal_date, 'DD-MM-YYYY') as withdrawal_date, withdrawal_type from jeg_adm.withdrawal w left join (select employee_id, employee_name from jeg_adm.employee) emp on (emp.employee_id = w.employee_id) left join (select campaign_id, campaign_name from jeg_adm.campaign) camp on (camp.campaign_id = w.campaign_id) left join (select work_id, type from jeg_adm.work) wk on (wk.work_id =  w.work_id);").catch((e) => { console.log("-------------router Withdrawal-------------------"); console.error(e) });
    var date = new Date();
    console.log(withdrawals.rows);
    withdrawals.rows.forEach(element => {
        if (element.delivered == "delivered") {
            console.log("igual a on");
        } else {
            console.log("distinto a on");
            element.delivered = undefined;
        }
    });

    res.render('withdrawal/list', { withdrawals: withdrawals.rows, tagExport: 'Retiros', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    const employees = await pool.query("select * from jeg_adm.employee").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e) });
    const campaigns = await pool.query("select * from jeg_adm.campaign").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e) });
    console.log(employees.rows);
    console.log(campaigns.rows);
    res.render('withdrawal/add', { employees: employees.rows, campaigns: campaigns.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { emp_id, camp_id, date, description, work_id, type, amount, deliverer, currency } = req.body;
    const withdrawal = new Withdrawal(null, emp_id, amount, date, type, deliverer, camp_id, work_id, description, currency);
    withdrawal.show();
    console.log('---------------> campaign ' + camp_id);
    await withdrawal.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/withdrawal.js::/add ");
        console.error(e)
        console.log("-------------------------------");
        req.flash('message', 'Error al cargar el nuevo retiro.');
        res.redirect('/withdrawal/');
    });
    var employee = null;
    if (emp_id != "default") {
        employee = await pool.query("select employee_id, employee_name from jeg_adm.employee where employee_id=" + emp_id + ";").catch((e) => {
            console.log("-------------router withdrawal employee-------------------");
            console.error(e)
        });
        employee = employee.rows;
    }

    var campaign = null;
    if (camp_id != "default") {
        campaign = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign where campaign_id=" + camp_id + ";").catch((e) => {
            console.log("-------------router withdrawal campaign-------------------");
            console.error(e)
        });
        campaign = campaign.rows;
    }

    var work = null;
    if (work_id != "default") {
        console.log("---------------> work_id != default")
        work = await pool.query("select work_id, type from jeg_adm.work where work_id=" + work_id + ";").catch((e) => {
            console.log("-------------router withdrawal work-------------------");
            console.error(e)
        });
        work = work.rows;
    }

    const info = {
        employee_name: (employee) ? employee[0].employee_name : ('indefinido'),
        campaign_name: (campaign) ? campaign[0].campaign_name : ('indefinido'),
        date: date,
        signature: deliverer,
        amount: amount,
        work_type: (work) ? work[0].type : null,
    }
    const pdf = await pdf_creator(info).catch((e) => {
        console.log("-------------------->WITHDRAWAL PDF CREATOR");
        console.error(e)
        req.flash('message', 'Error al crear pdf del retiro.');
        res.redirect('/withdrawal/');
    });
    //res.contentType("application/pdf");
    //res.send(pdf);
    req.flash('success', 'Retiro cargado correctamente.');
    res.redirect('/withdrawal/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log('edit id :' + id);
    const withdrawal = new Withdrawal(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await withdrawal.pullData();
    console.log("despues de pullData");
    console.log(withdrawal.date);
    withdrawal.show();

    const employees = await pool.query("select employee_id, employee_name from jeg_adm.employee").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e) });
    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e) });

    console.log(employees.rows);
    console.log(campaigns.rows);
    var works;
    if (withdrawal.camp_id) {
        works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + withdrawal.camp_id + ";").catch((e) => {
            console.log("-------------------withdrawal router------------------");
            console.log(e);
        });
        works = works.rows;
    } else {
        works = undefined;
    }

    res.render('withdrawal/edit', { withdrawal: withdrawal, employees: employees.rows, campaigns: campaigns.rows, works: works });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { camp_id, emp_id, type, amount, date, deliverer, description, work_id, currency } = req.body;

    const withdrawal = new Withdrawal(id, emp_id, amount, date, type, deliverer, camp_id, work_id, description, currency);
    withdrawal.show();
    await withdrawal.updateData().catch((e) => {
        console.error(e);
        req.flash('message', 'Error al actualizar retiro.');
        res.redirect('/withdrawal/edit/' + id);
    });

    req.flash('success', 'Retiro actualizado correctamente.');
    res.redirect('/withdrawal/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;

    await pool.query("delete from jeg_adm.withdrawal where withdrawal_id=" + id).catch((e) => {
        console.error(e)
        req.flash('message', 'Error al eliminar retiro.');
        res.redirect('/withdrawal/');
    });
    req.flash('success', 'Retiro eliminado correctamente.');
    res.redirect('/withdrawal/');
});

router.post('/infoCampaign', isLoggedIn, async (req, res) => {
    const { camp_id } = req.body;
    const works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + camp_id + ";").catch((e) => {
        console.log("-------------------withdrawal/infoCampaign-----------------");
        console.log(e);
    });
    res.json(works.rows);
});

module.exports = router;
