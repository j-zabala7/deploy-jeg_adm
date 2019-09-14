const pool = require('../database.js');


function Invoice_line(id, invoice_id, invoiced_ha, total_ha, amount, currency, work_id, description) {
    this.id = id;
    this.invoice_id = invoice_id;
    this.amount = amount;
    this.invoiced_ha = invoiced_ha;
    this.total_ha = total_ha;
    this.work_id = work_id;
    this.description = description;
    this.currency = currency;
}

Invoice_line.prototype.show = function () {
    const id = this.id;
    const invoice_id = this.invoice_id;
    const amount = this.amount;
    const invoiced_ha = this.invoiced_ha;
    const total_ha = this.total_ha;
    const work_id = this.work_id;
    const description = this.description;
    const currency = this.currency;

    console.log(id + ", " + invoice_id + ", " + amount + ", " + invoiced_ha + ", " + total_ha + ", " + currency + ", " + work_id + ", " + description + ".");
}

Invoice_line.prototype.makePersistent = async function () {
    const amount = this.amount;
    const invoice_id = this.invoice_id;
    const work_id = this.work_id;
    const currency = this.currency;
    const invoiced_ha = this.invoiced_ha;
    const total_ha = this.total_ha;
    const description = this.description;

    await pool.query("insert into jeg_adm.invoice_line values (default," + invoice_id + "," + work_id + "," + invoiced_ha + "," + total_ha + "," + amount + ",'" + description + "','" + currency + "');");
}

Invoice_line.prototype.pullData = async function () {

    const id = this.id;



    const info = await pool.query("select * from jeg_adm.invoice_line where invoice_line_id=" + id + ";");
    console.log(info.rows[0]);


    this.work_id = info.rows[0].work_id;
    this.amount = info.rows[0].amount_invoice_line;
    this.invoice_id = info.rows[0].invoice_id;
    this.invoiced_ha = info.rows[0].invoiced_ha;
    this.currency = info.rows[0].invoice_line_currency;
    this.description = info.rows[0].invoice_line_description;
    this.total_ha = info.rows[0].total_ha;
}

Invoice_line.prototype.updateData = async function () {
    const invoice = this.invoice_id;
    const work = this.work_id;
    const total_ha = this.total_ha;
    const amount = this.amount;
    const invoiced_ha = this.invoiced_ha;
    const currency = this.currency;


    const description = this.description;
    const id = this.id;

    await pool.query("update jeg_adm.invoice_line set invoice_id=" + invoice + ",work_id=" + work + ",invoiced_ha=" + invoiced_ha + ",total_ha=" + total_ha + ",invoice_line_description='" + description + "',amount_invoice_line=" + amount + ",invoice_line_currency='" + currency + "' where invoice_line_id=" + id + ";");
}

Invoice_line.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.invoice_line where invoice_line_id=" + id + ";");
}

module.exports.invoice_line = Invoice_line; 