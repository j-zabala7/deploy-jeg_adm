const pool = require('../database.js');


function Employee(id, dni, name, cuil, email, addr, phone, birthday) {
    this.id = id;
    this.dni = dni;
    this.name = name;
    this.cuil = cuil;
    this.email = email;
    this.addr = addr;
    this.phone = phone;
    this.birthday = birthday;
}

Employee.prototype.show = function () {
    const dni = this.dni;
    const name = this.name;
    const cuil = this.cuil;
    const addr = this.addr;
    const email = this.email;
    const phone = this.phone;
    const birthday = this.birthday;
    const id = this.id;

    console.log(id + ", " + dni + ", " + name + ", " + cuil + ", " + addr + ", " + email + ", " + phone + ", " + birthday + ".");
}

Employee.prototype.makePersistent = async function () {
    const dni = this.dni;
    const name = this.name;
    const cuil = this.cuil;
    const addr = this.addr;
    const email = this.email;
    const phone = this.phone;
    const birthday = this.birthday;
    await pool.query("insert into jeg_adm.employee values (default,'" + dni + "','" + name + "','" + cuil + "','" + email + "','" + addr + "','" + phone + "','" + birthday + "');");
}

Employee.prototype.pullData = async function (type) {
    const dni = this.dni;
    const id = this.id;
    const cuil = this.cuil;

    var info;
    console.log("employee pull data: " + type);

    if (type != 2 && type != 1 && type != 3)
        console.error("In models employee.js: pullData -> type!=1 and type!=2 and type!=3");

    if (type == 1) { //find by dni
        info = await pool.query("select employee_id, employee_dni, employee_addr, employee_cuil, employee_email, employee_name, employee_phone, to_char(employee_birthday,'YYYY-MM-DD') as employee_birthday from jeg_adm.employee where employee_dni=" + dni + ";");
        console.log(info.rows);
    }
    if (type == 2) { //find by id
        info = await pool.query("select employee_id, employee_dni, employee_addr, employee_cuil, employee_email, employee_name, employee_phone, to_char(employee_birthday,'YYYY-MM-DD') as employee_birthday from jeg_adm.employee where employee_id=" + id + ";");
        console.log(info.rows);
    }
    if (type == 3) { // find by cuitcuil
        info = await pool.query("select employee_id, employee_dni, employee_addr, employee_cuil, employee_email, employee_name, employee_phone, to_char(employee_birthday,'YYYY-MM-DD') as employee_birthday from jeg_adm.employee where employee_cuil=" + cuil + ";");
        console.log(info.rows);
    }

    this.dni = info.rows[0].employee_dni;
    this.name = info.rows[0].employee_name;
    this.email = info.rows[0].employee_email;
    this.addr = info.rows[0].employee_addr;
    this.cuil = info.rows[0].employee_cuil;
    this.id = info.rows[0].employee_id;
    this.phone = info.rows[0].employee_phone;
    this.birthday = info.rows[0].employee_birthday;

    console.log("fin de pullData");
}

Employee.prototype.updateData = async function () {
    const dni = this.dni;
    const name = this.name;
    const cuil = this.cuil;
    const addr = this.addr;
    const email = this.email;
    const phone = this.phone;
    const birthday = this.birthday;
    const id = this.id;

    await pool.query("update jeg_adm.employee set employee_dni='" + dni + "',employee_name='" + name + "',employee_cuil='" + cuil + "',employee_addr='" + addr + "',employee_email='" + email + "',employee_phone='" + phone + "',employee_birthday='" + birthday + "' where employee_id=" + id + ";");
}

Employee.prototype.delete = async function () {
    var id = this.id;

    await pool.query("delete from jeg_adm.employee where employee_id=" + id + ";");
}

module.exports.employee = Employee; 