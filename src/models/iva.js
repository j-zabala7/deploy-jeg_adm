const pool = require('../database.js');


function Iva(id, value, description) {
    this.id = id;
    this.value = value;
    this.description = description;
}

Iva.prototype.show = function () {
    const id = this.id;
    const value = this.value;
    const description = this.description;

    console.log(id + ", " + value + ", " + description + ".");
}

Iva.prototype.makePersistent = async function () {
    const value = this.value;
    const description = this.description;

    await pool.query("insert into jeg_adm.iva values (default," + value + ",'" + description + "');");
}

Iva.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select * from jeg_adm.iva where iva_id=" + id + ";");
    console.log(info.rows[0]);


    this.name = info.rows[0].iva_value;
    this.description = info.rows[0].iva_description;
    this.id = info.rows[0].iva_id;

}

Iva.prototype.updateData = async function () {
    const id = this.id;
    const value = this.value;
    const description = this.description;

    await pool.query("update jeg_adm.iva set iva_value=" + value + ",iva_description='" + description + "' where iva_id=" + id + ";");
}

Iva.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.iva where iva_id=" + id + ";");
}

module.exports.iva = Iva; 