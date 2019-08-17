const pool = require('../database.js');


function Lot(id, name, ha, cs_id, description) {
    this.id = id;
    this.name = name;
    this.ha = ha;
    this.cs_id = cs_id;
    this.description = description;
}

Lot.prototype.show = function () {
    const id = this.id;
    const name = this.name;
    const ha = this.ha;
    const cs_id = this.cs_id;
    const description = this.description;

    console.log(id + ", " + name + ", " + ha + ", " + cs_id + ", " + description + ".");
}

Lot.prototype.makePersistent = async function () {
    const name = this.name;
    const ha = this.ha;
    const cs_id = this.cs_id;
    const description = this.description;

    await pool.query("insert into jeg_adm.lot values (default,'" + name + "','" + ha + "','" + cs_id + "','" + description + "');");
}

Lot.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select * from jeg_adm.lot where lot_id=" + id + ";");
    console.log(info.rows[0]);


    this.name = info.rows[0].lot_name;
    this.ha = info.rows[0].lot_ha;
    this.cs_id = info.rows[0].countryside_id;
    this.description = info.rows[0].lot_description;
    this.id = info.rows[0].lot_id;

}

Lot.prototype.updateData = async function () {
    const id = this.id;
    const name = this.name;
    const ha = this.ha;
    const cs_id = this.cs_id;
    const description = this.description;

    await pool.query("update jeg_adm.lot set lot_ha=" + ha + ",lot_name='" + name +  "',countryside_id=" + cs_id + ",lot_description='" + description + "' where lot_id=" + id + ";");
}

Lot.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.lot where lot_id=" + id + ";");
}

module.exports.lot = Lot; 