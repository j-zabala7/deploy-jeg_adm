const pool = require('../database.js');


function Withdrawal(id, emp_id, amount, date, type, deliverer, camp_id, work_id, description, currency) {
    this.id = id;
    this.emp_id = emp_id;
    this.amount = amount;
    this.type = type;
    this.deliverer = deliverer;
    this.camp_id = (camp_id != "default") ? (camp_id) : null;
    this.work_id = (work_id != "default") ? (work_id) : null;
    this.date = (date != "") ? ("'" + date + "'") : (null);
    this.description = description;
    this.currency = currency;
}

Withdrawal.prototype.show = function () {
    const id = this.id;
    const emp_id = this.emp_id;
    const amount = this.amount;
    const type = this.type;
    const deliverer = this.deliverer;
    const camp_id = this.camp_id;
    const work_id = this.work_id;
    const date = this.date;
    const description = this.description;
    const currency = this.currency;

    console.log(id + ", " + emp_id + ", " + amount + ", " + type + ", " + deliverer + ", " + camp_id + ", " + work_id + ", " + date + ", " + description + ", " + currency + ".");
}

Withdrawal.prototype.makePersistent = async function () {
    const amount = this.amount;
    const type = this.type;
    const deliverer = this.deliverer;
    const currency = this.currency;

    const work_id = this.work_id;
    const camp_id = this.camp_id;

    if (camp_id == 'default')
        console.log('camp_id == default (1er)');
    if (camp_id == "default")
        console.log('camp_id == default segundo');

    var emp_id;
    if (this.emp_id == "default") {
        emp_id = null;
    } else {
        emp_id = this.emp_id;
    }
    const date = this.date;
    const description = this.description;

    await pool.query("insert into jeg_adm.withdrawal values (default," + emp_id + ",'" + amount + "'," + date + ",'" + type + "','" + deliverer + "'," + camp_id + "," + work_id + ",'" + description + "','" + currency + "');");
}

Withdrawal.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select withdrawal_currency, employee_id, withdrawal_amount, withdrawal_type, withdrawal_date, withdrawal_description, deliverer, work_id, campaign_id, work_id, to_char(withdrawal_date, 'YYYY-MM-DD') as withdrawal_date from jeg_adm.withdrawal where withdrawal_id=" + id + ";");
    console.log(info.rows[0]);


    this.emp_id = info.rows[0].employee_id;
    this.amount = info.rows[0].withdrawal_amount;
    this.type = info.rows[0].withdrawal_type;
    this.deliverer = info.rows[0].deliverer;
    this.camp_id = info.rows[0].campaign_id;
    this.work_id = info.rows[0].work_id;
    this.date = info.rows[0].withdrawal_date;
    this.description = info.rows[0].withdrawal_description;
    this.currency = info.rows[0].withdrawal_currency;
}

Withdrawal.prototype.updateData = async function () {
    const emp_id = this.emp_id;
    const amount = this.amount;
    const type = this.type;
    const deliverer = this.deliverer;
    const camp_id = this.camp_id;
    const work_id = this.work_id;
    const currency = this.currency;


    const date = (this.date != null && this.date != "") ? (this.date) : 'NULL';
    const description = this.description;
    const id = this.id;

    await pool.query("update jeg_adm.withdrawal set employee_id=" + emp_id + ",deliverer='" + deliverer + "',withdrawal_amount=" + amount + ",withdrawal_type='" + type + "',withdrawal_description='" + description + "',campaign_id=" + camp_id + ",work_id=" + work_id + ",withdrawal_date=" + date + ",withdrawal_currency='" + currency + "' where withdrawal_id=" + id + ";");
}

Withdrawal.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.withdrawal where withdrawal_id=" + id + ";");
}

module.exports.withdrawal = Withdrawal; 