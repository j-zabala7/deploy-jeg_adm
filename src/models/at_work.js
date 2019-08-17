const pool = require('../database.js');


function at_Work(id, employee, ha, price, total, work, campaign, description) {
    this.id = id;
    this.employee = employee;
    this.ha = ha;
    this.price = price;
    this.total = total;
    this.work = work;
    this.campaign = campaign;
    this.description = description;
}

at_Work.prototype.show = function () {
    const id = this.id;
    const employee = this.employee;
    const ha = this.ha;
    const price = this.price;
    const total = this.total;
    const work = this.work;
    const campaign = this.campaign;
    const description = this.description;

    console.log(id + ", " + employee + ", " + ha + ", " + price + ", " + total + ", " + work + ", " + campaign + ", " + description + ".");
}

at_Work.prototype.makePersistent = async function () {
    const employee = this.employee;
    const ha = this.ha;
    const price = this.price;
    const total = this.total;
    const work = this.work;
    const campaign = this.campaign;
    const description = this.description;

    await pool.query("insert into jeg_adm.at_work values (default," + employee + "," + work + "," + ha + "," + price + "," + total + ",'" + description + "'," + campaign + ");");
}

at_Work.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select * from jeg_adm.at_work where at_work_id=" + id + ";");
    console.log(info.rows[0]);


    this.employee = info.rows[0].employee_id;
    this.ha = info.rows[0].has;
    this.campaign = info.rows[0].campaign_id;
    this.description = info.rows[0].at_work_description;
    this.price = info.rows[0].at_work_pricexha;
    this.total = info.rows[0].total;
    this.work = info.rows[0].work_id;
}

at_Work.prototype.updateData = async function () {
    const id = this.id;
    const employee = this.employee;
    const ha = this.ha;
    const price = this.price;
    const total = this.total;
    const work = this.work;
    const campaign = this.campaign;
    const description = this.description;

    await pool.query("update jeg_adm.at_work set has=" + ha + ",employee_id=" + employee + ",campaign_id=" + campaign + ",work_id=" + work + ",at_work_pricexha=" + price + ",total=" + total + ",at_work_description='" + description + "' where at_work_id=" + id + ";");
}

at_Work.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.at_work where at_work_id=" + id + ";");
}

module.exports.at_work = at_Work; 