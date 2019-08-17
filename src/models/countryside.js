const pool = require('../database.js');


function Countryside(id, name, location, ha, c_id) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.ha = ha;
    this.c_id = c_id;
    console.log("COUNTRYSIDE: "+this.id);
}

Countryside.prototype.show = function () {
    const id = this.id;
    const name = this.name;
    const location = this.location;
    const ha = this.ha;
    const c_id = this.c_id;

    console.log(id + ", " + name + ", " + location + ", " + ha + ", " + c_id + ".");
}

Countryside.prototype.makePersistent = async function () {
    const name = this.name;
    const location = this.location;
    const ha = this.ha;
    const c_id = this.c_id;

    await pool.query("insert into jeg_adm.countryside values (default,'" + name + "','" + location + "','" + ha + "'," + c_id + ");");
}

Countryside.prototype.pullData = async function () {
    var id = this.id;



    var info = await pool.query("select * from jeg_adm.countryside where countryside_id=" + id + ";");
    console.log(info.rows);
    console.log(info.rows[0].countryside_id);

    this.id = info.rows[0].countryside_id;
    this.name = info.rows[0].countryside_name;
    this.location = info.rows[0].location;
    this.ha = info.rows[0].countryside_ha;
    this.c_id = info.rows[0].client_id;
    

}

Countryside.prototype.updateData = async function () {
    const id = this.id;
    const name = this.name;
    const location = this.location;
    const ha = this.ha;
    const c_id = this.c_id;

    await pool.query("update jeg_adm.countryside set countryside_name='" + name + "',location='" + location + "',countryside_ha=" + ha + ",client_id=" + c_id + "where countryside_id=" + id + ";");
}

Countryside.prototype.delete = async function () {
    var id = this.id;

    await pool.query("delete from jeg_adm.countryside where countryside_id=" + id + ";");
}

module.exports.countryside = Countryside; 