const pool = require('../database.js');


function Expense(id, made_to, amount, date, description, state, camp_id, work_id, currency) {
    this.id = id;
    this.amount = amount;
    this.state = state;
    this.camp_id = camp_id;
    this.work_id = work_id;
    this.date = date;
    this.description = description;
    this.made_to = made_to;
    this.currency = currency;
}

Expense.prototype.show = function () {
    const id = this.id;
    const made_to = this.made_to;
    const amount = this.amount;
    const state = this.state;
    const camp_id = this.camp_id;
    const work_id = this.work_id;
    const date = this.date;
    const description = this.description;
    const currency = this.currency;

    console.log(id + ", " + made_to + ", " + amount + ", " + state + ", " + camp_id + ", " + work_id + ", " + date + ", " + description + ", " + currency + ".");
}

Expense.prototype.makePersistent = async function () {
    const amount = this.amount;
    const state = this.state;
    const made_to = this.made_to;
    const currency = this.currency;

    var camp_id;
    if (this.camp_id === "default") {
        camp_id = 'NULL';
    } else {
        camp_id = this.camp_id;
    }

    var work_id;
    if (this.work_id === "default") {
        work_id = 'NULL';
    } else {
        work_id = this.work_id;
    }

    const date = this.date;
    const description = this.description;

    await pool.query("insert into jeg_adm.expenses values (default,'" + made_to + "','" + amount + "','" + description + "','" + state + "','" + date + "'," + camp_id + "," + work_id + ",'" + currency + "');");
}

Expense.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select expenses_id, expenses_currency, expenses_amount, expenses_state, expenses_description, made_to, work_id, campaign_id, to_char(expenses_date, 'YYYY-MM-DD') as expenses_date from jeg_adm.expenses where expenses_id=" + id + ";");
    console.log(info.rows[0]);


    this.made_to = info.rows[0].made_to;
    this.amount = info.rows[0].expenses_amount;
    this.state = info.rows[0].expenses_state;
    this.camp_id = info.rows[0].campaign_id;
    this.work_id = info.rows[0].work_id;
    this.date = info.rows[0].expenses_date;
    this.description = info.rows[0].expenses_description;
    this.currency = info.rows[0].expenses_currency;
}

Expense.prototype.updateData = async function () {
    const made_to = this.made_to;
    const amount = this.amount;
    const state = this.state;
    const camp_id = this.camp_id;
    const work_id = this.work_id;
    const currency = this.currency;

    const date = (this.date != null && this.date != "") ? (this.date) : 'NULL';
    const description = this.description;
    const id = this.id;

    await pool.query("update jeg_adm.expenses set made_to='" + made_to + "',expenses_amount=" + amount + ",expenses_state='" + state + "',expenses_description='" + description + "',campaign_id=" + camp_id + ",work_id=" + work_id + ",expenses_date='" + date + "',expenses_currency='" + currency + "' where expenses_id=" + id + ";");
}

Expense.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.expenses where expenses_id=" + id + ";").catch((e) => {
        console.log("---------------expense model delete----------------");
        console.log(e);
    });
}

module.exports.expense = Expense; 