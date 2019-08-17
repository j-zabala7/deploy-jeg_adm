const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const Expense = require('../models/expense').expense;

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    const expenses = await pool.query("select made_to, campaign_id, expenses_description, expenses_id, work_id, expenses_amount, to_char(expenses_date, 'DD-MM-YYYY') as expenses_date, expenses_state from jeg_adm.expenses").catch((e) => { console.log("-------------router Expenses-------------------"); console.error(e) });
    var date = new Date();
    console.log(expenses.rows);

    res.render('expense/list', { expenses: expenses.rows, tagExport: 'Gastos', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router expenses-------------------"); console.error(e) });
    console.log(campaigns.rows);

    res.render('expense/add', { campaigns: campaigns.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { made_to, camp_id, date, description, work_id, state, amount } = req.body;
    const expense = new Expense(null, made_to, amount, date, description, state, camp_id, work_id);
    expense.show();

    await expense.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/expense.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });
    req.flash('success', 'Gasto cargado correctamente.');
    res.redirect('/expense/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    //console.log('edit id :' + id);
    const expense = new Expense(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await expense.pullData();
    //console.log("despues de pullData");
    console.log(expense.date);
    expense.show();

    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router expense-------------------"); console.error(e) });

    //console.log(campaigns.rows);
    var works;
    if (expense.camp_id) {
        works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + expense.camp_id + ";").catch((e) => {
            console.log("-------------------expense router------------------");
            console.log(e);
        });
        works = works.rows;
    } else {
        works = undefined;
    }
    res.render('expense/edit', { expense: expense, campaigns: campaigns.rows, works: works });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { camp_id, state, made_to, amount, date, description, work_id } = req.body;

    const expense = new Expense(id, made_to, amount, date, description, state, camp_id, work_id);
    expense.show();
    await expense.updateData();

    req.flash('success', 'Gasto actualizado correctamente.');
    res.redirect('/expense/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;
    const expense = new Expense(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    await expense.delete();
    req.flash('success', 'Gasto eliminado correctamente.');
    res.redirect('/expense/');


});

router.post('/infoCampaign', isLoggedIn, async (req, res) => {
    const { camp_id } = req.body;
    const works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + camp_id + ";").catch((e) => {
        console.log("-------------------expense/infoCampaign-----------------");
        console.log(e);
    });

    res.json(works.rows);
});

module.exports = router;
