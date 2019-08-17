const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const Withdrawal = require('../models/withdrawal').withdrawal;

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    const withdrawals = await pool.query("select employee_id, campaign_id, withdrawal_description, withdrawal_id, work_id, delivered, withdrawal_amount, to_char(withdrawal_date, 'DD-MM-YYYY') as withdrawal_date, withdrawal_type from jeg_adm.withdrawal").catch((e) => { console.log("-------------router Withdrawal-------------------"); console.error(e) });
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
    const { emp_id, camp_id, date, description, work_id, type, amount, delivered } = req.body;
    const withdrawal = new Withdrawal(null, emp_id, amount, date, type, delivered, camp_id, work_id, description);
    withdrawal.show();

    await withdrawal.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/withdrawal.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });
    req.flash('success', 'Retiro cargado correctamente.');
    res.redirect('/withdrawal/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log('edit id :' + id);
    const withdrawal = new Withdrawal(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
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
    const { camp_id, emp_id, type, amount, date, delivered, description, work_id } = req.body;

    const withdrawal = new Withdrawal(id, emp_id, amount, date, type, delivered, camp_id, work_id, description);
    withdrawal.show();
    await withdrawal.updateData();

    req.flash('success', 'Retiro actualizado correctamente.');
    res.redirect('/withdrawal/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;

    await pool.query("delete from jeg_adm.withdrawal where withdrawal_id=" + id).catch((e) => { console.error(e) });
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
