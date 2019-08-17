const pool = require('../database.js');


function Work(id, type, state, description, start, end, price, lot_id, ha, camp_id, cs_id, client_id, cereal, currency) {
    this.id = id;
    this.type = type;
    this.ha = ha;
    this.state = state;
    this.description = description;
    this.start = start;
    this.end = end;
    this.price = price;
    this.lot_id = lot_id;
    this.camp_id = camp_id;
    this.cs_id = cs_id;
    this.client_id = client_id;
    this.cereal = cereal;
    this.currency = currency;
}

Work.prototype.show = function () {
    const id = this.id;
    const type = this.type;
    const ha = this.ha;
    const state = this.state;
    const description = this.description;
    const start = this.start;
    const end = this.end;
    const price = this.price;
    const lot_id = this.lot_id;
    const camp_id = this.camp_id;
    const cs_id = this.cs_id;
    const client_id = this.client_id;
    const cereal = this.cereal;
    const currency = this.currency;

    console.log(id + ", " + type + ", " + state + ", " + description + ", " + start + ", " + end + ", " + price + ", " + lot_id + ", " + ha + ", " + camp_id + ", " + cs_id +  ", " + client_id + ", " + cereal + ", " + currency + ".");
}

Work.prototype.makePersistent = async function () {
    const id = this.id;
    const type = this.type;
    const ha = this.ha;
    const state = this.state;
    const description = this.description;
    const start = this.start;
    const end = this.end;
    const price = this.price;
    const lot_id = this.lot_id;
    const camp_id = this.camp_id;
    const client_id = this.client_id;
    const cereal = this.cereal;
    const currency = this.currency;
    const cs_id = this.cs_id;

    await pool.query("insert into jeg_adm.work values (default,'" + type + "','" + state + "','" + description + "','" + start + "','" + end + "'," + price + "," + lot_id + "," + ha + "," + camp_id + "," + cs_id + "," + client_id + ",'" + cereal + "','" + currency + "');");
}

Work.prototype.pullData = async function () {

    const id = this.id;

    console.log("pull data antes de query");

    const info = await pool.query("select work_id, type, work_state, work_description, to_char(start_date, 'YYYY-MM-DD') as start_date, to_char(end_date, 'YYYY-MM-DD') as end_date, pricexha, lot_id, work_ha, campaign_id, countryside_id, client_id, cereal, currency from jeg_adm.work where work_id=" + id + ";");
    console.log("PULL DATA ");
    console.log(info.rows[0]);


    this.description = info.rows[0].work_description;
    this.ha = info.rows[0].work_ha;
    this.state = info.rows[0].work_state;
    this.id = info.rows[0].work_id;
    this.price = info.rows[0].pricexha;
    this.start = info.rows[0].start_date;
    this.end = info.rows[0].end_date;
    this.type = info.rows[0].type;
    this.lot_id = info.rows[0].lot_id;
    this.camp_id = info.rows[0].campaign_id;
    this.cs_id = info.rows[0].countryside_id;
    this.client_id = info.rows[0].client_id;
    this.cereal = info.rows[0].cereal;
    this.currency = info.rows[0].currency;
    

}

Work.prototype.updateData = async function () {
    const id = this.id;
    const type = this.type;
    const ha = this.ha;
    const state = this.state;
    const description = this.description;
    const start = this.start;
    const end = this.end;
    const price = this.price;
    const lot_id = this.lot_id;
    const camp_id = this.camp_id;
    const cs_id = this.cs_id;
    const client_id = this.client_id;
    const cereal = this.cereal;
    const currency = this.currency;
    console.log("antes del query ->  updateData");
    this.show();
    await pool.query("update jeg_adm.work set work_ha=" + ha + ",type='" + type +  "',campaign_id=" + camp_id + ",work_description='" + description + "',lot_id=" + lot_id + ",work_state='" + state + "',start_date='" + start + "',end_date='" + end + "',pricexha=" + price + ",countryside_id=" + cs_id + ",client_id=" + client_id + ",cereal='" + cereal + "',currency='" + currency + "' where work_id=" + id + ";").catch((e)=>{console.log("-------------------update Data work------------------"); console.log(e);});
}

Work.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.work where work_id=" + id + ";");
}

module.exports.work = Work; 