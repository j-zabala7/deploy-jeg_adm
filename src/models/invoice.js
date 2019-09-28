const pool = require('../database.js');


function Invoice(id, client_id, total, subtotal, iva, state, date, currency, description, nro, type, amount_iva) {
    this.id = id;
    this.client_id = client_id;
    this.total = total;
    this.subtotal = subtotal;
    this.iva = iva;
    this.state = state;
    this.date = (date == "") ? null : ("'" + date + "'");
    this.description = description;
    this.currency = currency;
    this.nro = nro;
    this.type = type;
    this.amount_iva = amount_iva;
}

Invoice.prototype.show = function () {
    const id = this.id;
    const client_id = this.cleint_id;
    const total = this.total;
    const subtotal = this.subtotal;
    const state = this.state;
    const iva = this.iva;
    const date = this.date;
    const description = this.description;
    const currency = this.currency;
    const nro = this.nro;
    const type = this.type;
    const amount_iva = this.amount_iva;

    console.log(id + ", " + client_id + ", " + total + ", " + subtotal + ", " + iva + ", " + state + ", " + date + ", " + description + ", " + currency + ", " + nro + ", " + type + ", " + amount_iva + ".");
}

Invoice.prototype.makePersistent = async function () {
    const total = this.total;
    const state = this.state;
    const subtotal = this.subtotal;
    const currency = this.currency;
    const iva = this.iva;
    const nro = this.nro;
    const type = this.type;
    const amount_iva = this.amount_iva;

    const client_id = this.client_id;

    const date = this.date;
    const description = this.description;


    await pool.query("insert into jeg_adm.invoice values (default," + client_id + "," + date + "," + subtotal + "," + amount_iva + "," + total + ",'" + description + "','" + currency + "'," + iva + ",'" + state + "','" + type + "'," + nro + ");");
}

Invoice.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select invoice_currency, invoice_nro, invoice_type, client_id, total_amount, subtotal_amount, invoice_description, iva_id, invoice_state, to_char(invoice_date, 'YYYY-MM-DD') as invoice_date from jeg_adm.invoice where invoice_id=" + id + ";");
    console.log(info.rows[0]);


    this.client_id = info.rows[0].client_id;
    this.total = info.rows[0].total_amount;
    this.subtotal = info.rows[0].subtotal_amount;
    this.state = info.rows[0].invoice_state;
    this.currency = info.rows[0].invoice_currency;
    this.date = info.rows[0].invoice_date;
    this.description = info.rows[0].invoice_description;
    this.iva_id = info.rows[0].iva_id;
    this.nro = info.rows[0].invoice_nro;
    this.type = info.rows[0].invoice_type;
    this.amount_iva = info.rows[0].amount_iva;
}

Invoice.prototype.updateData = async function () {
    const client_id = this.client_id;
    const total = this.total;
    const subtotal = this.subtotal;
    const iva = this.iva;
    const state = this.state;
    const currency = this.currency;
    const nro = this.nro;
    const type = this.type;
    const amount_iva = this.amount_iva;

    const date = (this.date != null && this.date != "") ? (this.date) : 'NULL';
    const description = this.description;
    const id = this.id;

    await pool.query("update jeg_adm.invoice set client_id=" + client_id + ",invoice_state='" + state + "',total_amount=" + total + ",amount_iva=" + amount_iva + ",subtotal_amount=" + subtotal + ",invoice_description='" + description + "',iva_id=" + iva + ",invoice_date=" + date + ",invoice_currency='" + currency + "',invoice_nro=" + nro + ",invoice_type='" + type + "' where invoice_id=" + id + ";");
}

Invoice.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.invoice where invoice_id=" + id + ";");
}

module.exports.invoice = Invoice; 