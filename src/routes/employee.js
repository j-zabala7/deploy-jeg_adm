const express = require('express');

const router = express.Router();

const pool = require('../database.js');

const Employee = require('../models/employee.js').employee;

const { isLoggedIn } = require('../lib/auth'); // importamos metodos para proteger rutas

router.get('/', isLoggedIn, async (req, res) => {
    const employees = await pool.query("select employee_id, employee_name, employee_dni, employee_cuil, employee_addr, employee_email, employee_phone, to_char(employee_birthday, 'DD-MM-YYYY') as employee_birthday from jeg_adm.employee").catch((e) => {
        console.log("-------------------employee list------------- ");
        console.log(e);
    });
    var date = new Date();
    console.log(employees.rows);
    res.render('employee/list', { employees: employees.rows, tagExport: 'Empleados', date: date });
});

router.get('/add', isLoggedIn, async (req, res) => {
    res.render('employee/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { name, dni, cuil, email, addr, phone, birthday } = req.body;
    const employee = new Employee(undefined, dni, name, cuil, email, addr, phone, birthday);

    await employee.makePersistent().catch((e) => {
        console.log("------------------employee router add------------------");
        console.log(e);
    });

    req.flash('success', 'Empleado creado correctamente.');

    res.redirect("/employee/");
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const employee = new Employee(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await employee.pullData(2);
    employee.show();
    console.log("employee de pues del show " + id);
    res.render('employee/edit', { employee: employee });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log(id);

    const { name, dni, cuil, phone, email, addr, birthday } = req.body;
    const employee = new Employee(id, dni, name, cuil, email, addr, phone, birthday);
    employee.show();

    await employee.updateData().catch((e) => {
        console.log("----------------------------edit post employee--------------------");
        console.log(e);
    });


    req.flash('success', 'Empleado modificado correctamente.');
    res.redirect('/employee/edit/' + id);
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {

    const { id } = req.params;

    console.log("params de delete:" + id);

    const employee = new Employee(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    await employee.delete().catch((e) => {
        console.log("--------------------employee delete ---------------------");
        console.error(e);
    });

    req.flash('success', 'Empleado eliminado correctamente.');
    res.redirect('/employee/');


});

router.post("/checkDni", isLoggedIn, async (req, res) => {
    const { dni } = req.body;
    console.log("AL SERVER LLEGO " + dni);
    const resul = await pool.query("select employee_dni from jeg_adm.employee where employee_dni='" + dni + "';").catch((e) => {
        console.log("------------------checkDni----------------------");
        console.log(e);
    });
    console.log(resul);
    console.log(resul.rowCount);
    res.json({ result: ((resul.rowCount > 0) ? false : true) });
});

router.post("/checkCuil", isLoggedIn, async (req, res) => {
    const { cuil } = req.body;
    console.log("AL SERVER LLEGO " + cuil);
    const resul = await pool.query("select employee_cuil from jeg_adm.employee where employee_cuil='" + cuil + "';").catch((e) => {
        console.log("------------------checkCuil----------------------");
        console.log(e);
    });
    console.log(resul);
    console.log(resul.rowCount);
    res.json({ result: ((resul.rowCount > 0) ? false : true) });
});

router.get('/details/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const employee = new Employee(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    await employee.pullData(2);
    employee.show();
    console.log("employee de pues del show " + id);
    res.render('employee/details', { employee: employee });
});

module.exports = router;
