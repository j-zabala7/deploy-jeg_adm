const pool = require('../database.js');


function Client(dni, name, cuitcuil, addr, id, email, phone) {
    this.id = id;
    this.dni = (dni == "") ? null : ("'" + dni + "'");
    this.name = name;
    this.cuitcuil = (cuitcuil == "") ? null : ("'" + cuitcuil + "'");
    this.addr = addr;
    this.email = email;
    this.phone = phone;
}

Client.prototype.show = function () {
    const dni = this.dni;
    const name = this.name;
    const cuitcuil = this.cuitcuil;
    const addr = this.addr;
    const email = this.email;
    const phone = this.phone;

    console.log(dni + ", " + name + ", " + cuitcuil + ", " + addr + ", " + email + ", " + phone + ", " + this.id);
}

Client.prototype.makePersistent = async function () {
    const dni = this.dni;
    const name = this.name;
    const cuitcuil = this.cuitcuil;
    const addr = this.addr;
    const email = this.email;
    const phone = this.phone;
    await pool.query("insert into jeg_adm.client values (default,'" + name + "'," + cuitcuil + "," + dni + ",'" + email + "','" + phone + "','" + addr + "');");
}

Client.prototype.pullData = async function (type) {
    var dni = this.dni;
    var id = this.id;
    var cuitcuil = this.cuitcuil;
    var info;

    console.log("type: " + type);

    if (type != 2 && type != 1 && type != 3)
        console.error("In models client.js: pullData -> type!=1 and type!=2 and type!=3");

    if (type == 1) { //find by dni
        info = await pool.query("select * from jeg_adm.client where client_dni=" + dni + ";");
        console.log(info);
    }
    if (type == 2) { //find by id
        info = await pool.query("select * from jeg_adm.client where client_id=" + id + ";");
        console.log(info);
    }
    if (type == 3) { // find by cuitcuil
        info = await pool.query("select * from jeg_adm.client where cuil_cuit=" + cuitcuil + ";");
        console.log(info);
    }
    this.dni = info.rows[0].client_dni;
    this.name = info.rows[0].client_name;
    this.email = info.rows[0].email;
    this.addr = info.rows[0].addr;
    this.cuitcuil = info.rows[0].cuil_cuit;
    this.id = info.rows[0].client_id;
    this.phone = info.rows[0].phone;

    return;
}

Client.prototype.updateData = async function () {
    const id = this.id;


    const dni = this.dni;
    const name = this.name;
    const cuitcuil = this.cuitcuil;
    const addr = this.addr;
    const email = this.email;
    const phone = this.phone;

    await pool.query("update jeg_adm.client set client_dni=" + dni + ",client_name='" + name + "',cuil_cuit=" + cuitcuil + ",addr='" + addr + "',email='" + email + "',phone='" + phone + "' where client_id=" + id + ";");
}

Client.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.client where client_id=" + id + ";");
}

module.exports.client = Client; 