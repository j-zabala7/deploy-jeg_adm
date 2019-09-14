const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const at_Work = require('../models/at_work').at_work;

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    const at_works = await pool.query("select at_work_id, at_w.employee_id, at_w.work_id, at_work_pricexha, total, at_work_description, at_w.campaign_id, at_work_currency, employee_name, type, has, campaign_name from jeg_adm.at_work at_w left join (select employee_id, employee_name from jeg_adm.employee) emp on (emp.employee_id = at_w.employee_id) left join (select campaign_id, campaign_name from jeg_adm.campaign) camp on (camp.campaign_id = at_w.campaign_id) left join (select work_id, type from jeg_adm.work) w on (w.work_id = at_w.work_id);").catch((e) => { console.log("-------------router AT_WORK-------------------"); console.error(e) });
    var date = new Date();
    console.log(at_works.rows);

    res.render('at_work/list', { at_works: at_works.rows, tagExport: 'TrabajoEn', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    const employees = await pool.query("select employee_id, employee_name from jeg_adm.employee").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e) });
    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e) });
    console.log(employees.rows);
    console.log(campaigns.rows);
    res.render('at_work/add', { employees: employees.rows, campaigns: campaigns.rows });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { emp_id, camp_id, price, description, work_id, ha, total, currency } = req.body;
    const at_work = new at_Work(null, emp_id, ha, price, total, work_id, camp_id, description, currency);
    at_work.show();

    await at_work.makePersistent().catch((e) => {
        console.log("-------------------------------");
        console.log("->routes/at_work.js::/add ");
        console.error(e)
        console.log("-------------------------------");
    });
    req.flash('success', 'Se asigno Empleado a Trabajo correctamente.');
    res.redirect('/at_work/');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log('edit id :' + id);
    const at_work = new at_Work(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await at_work.pullData();
    console.log("despues de pullData");
    console.log(at_work.work);
    at_work.show();

    const employees = await pool.query("select employee_id, employee_name from jeg_adm.employee").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e); });
    const campaigns = await pool.query("select campaign_id, campaign_name from jeg_adm.campaign").catch((e) => { console.log("-------------router withdrawal-------------------"); console.error(e); });

    console.log(employees.rows);
    console.log(campaigns.rows);
    var works;
    if (at_work.campaign) {
        works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + at_work.campaign + ";").catch((e) => {
            console.log("-------------------at_work router------------------");
            console.log(e);
        });
        works = works.rows;
    } else {
        works = undefined;
    }
    res.render('at_work/edit', { at_work: at_work, employees: employees.rows, campaigns: campaigns.rows, works: works });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { camp_id, emp_id, price, ha, total, description, work_id, currency } = req.body;

    const at_work = new at_Work(id, emp_id, ha, price, total, work_id, camp_id, description, currency);
    at_work.show();
    await at_work.updateData();

    req.flash('success', 'Trabajo de Empleado actualizado correctamente.');
    res.redirect('/at_work/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;
    const at_work = new at_Work(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    await at_work.delete().catch((e) => {
        console.log("-------------------at work /delete -------------------");
        console.log(e);
        req.flash('message', 'Trabajo de Empleado fallo al eliminar.');
    });
    req.flash('success', 'Trabajo de Empleado eliminado correctamente.');
    res.redirect('/at_work/');
});

router.post('/infoCampaign', isLoggedIn, async (req, res) => {
    const { camp_id } = req.body;
    const works = await pool.query("select work_id, type from jeg_adm.work where campaign_id=" + camp_id + ";").catch((e) => {
        console.log("-------------------at_work/infoCampaign-----------------");
        console.log(e);
    });
    res.json(works.rows);
});

module.exports = router;
