const pool = require('../database.js');


function Payment(id, invoice_id, total, date, description, payment_method, id_p_m, camp_id, work_id, currency) {
    this.id = id;
    this.total = total;
    this.invoice_id = invoice_id;
    this.camp_id = camp_id;
    this.work_id = work_id;
    this.date = (date == "") ? null : ("'" + date + "'");
    this.description = description;
    this.payment_method = payment_method;
    this.id_p_m = id_p_m;
    this.currency = currency;
}

Payment.prototype.show = function () {
    const id = this.id;
    const invoice_id = this.invoice_id;
    const total = this.total;
    const payment_method = this.payment_method;
    const camp_id = this.camp_id;
    const work_id = this.work_id;
    const date = this.date;
    const description = this.description;
    const currency = this.currency;
    const id_p_m = this.id_p_m;

    console.log(id + ", " + invoice_id + ", " + total + ", " + payment_method + ", " + camp_id + ", " + work_id + ", " + date + ", " + description + ", " + currency + ", " + id_p_m + ".");
}

Payment.prototype.makePersistent = async function () {
    const total = this.total;
    const invoice_id = this.invoice_id;
    const payment_method = this.payment_method;
    const currency = this.currency;
    const id_p_m = this.id_p_m;

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
    console.log("insert into jeg_adm.payment values (default," + invoice_id + "," + camp_id + "," + work_id + "," + total + "," + date + ",'" + payment_method + "','" + id_p_m + "','" + currency + "','" + description + "');");
    await pool.query("insert into jeg_adm.payment values (default," + invoice_id + "," + camp_id + "," + work_id + "," + total + "," + date + ",'" + payment_method + "','" + id_p_m + "','" + currency + "','" + description + "');");
}

Payment.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select payment_id, invoice_id, campaign_id, work_id, payment_total, to_char(payment_date, 'YYYY-MM-DD') as payment_date, payment_method, id_payment_method, payment_currency, payment_description from jeg_adm.payment where payment_id=" + id + ";");
    console.log(info.rows[0]);


    this.invoice_id = info.rows[0].invoice_id;
    this.total = info.rows[0].payment_total;
    this.payment_method = info.rows[0].payment_method;
    this.camp_id = info.rows[0].campaign_id;
    this.work_id = info.rows[0].work_id;
    this.date = info.rows[0].payment_date;
    this.description = info.rows[0].payment_description;
    this.currency = info.rows[0].payment_currency;
    this.id_p_m = info.rows[0].id_payment_method;
}

Payment.prototype.updateData = async function () {
    const invoice_id = (this.invoice_id) ? this.invoice_id : null;
    const total = this.total;
    const payment_method = this.payment_method;
    const camp_id = (this.camp_id) ? this.camp_id : null;
    const work_id = (this.work_id) ? this.work_id : null;
    const currency = this.currency;
    const id_p_m = this.id_p_m;
    const date = (this.date != null && this.date != "") ? (this.date) : 'NULL';
    const description = this.description;
    const id = this.id;


    await pool.query("update jeg_adm.payment set invoice_id=" + invoice_id + ",payment_total=" + total + ",payment_method='" + payment_method + "',payment_description='" + description + "',campaign_id=" + camp_id + ",work_id=" + work_id + ",payment_date=" + date + ",payment_currency='" + currency + "',id_payment_method='" + id_p_m + "' where payment_id=" + id + ";").catch((e) => {
        console.log("-------------------> update payment.js model");
        console.log(e);
    });
}

Payment.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.payment where payment_id=" + id + ";").catch((e) => {
        console.log("---------------payment model delete----------------");
        console.log(e);
    });
}

module.exports.payment = Payment; 