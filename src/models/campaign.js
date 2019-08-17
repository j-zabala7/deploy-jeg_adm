const pool = require('../database.js');


function Campaign(id, name, start, end, description) {
    this.id = id;

    //  this.start = new Date(start).toLocaleDateString();
    this.start =  start;

    this.name = name;

    // this.end = new Date(end).toLocaleDateString();
    this.end =  end;

    this.description = description;
    console.log("-------Campaign---------"+this.id+"--------------------");
    console.log(start);
    console.log(end);

}

Campaign.prototype.show = function () {
    const id = this.id;
    const name = this.name;
    const start = this.start;
    const end = this.end;
    const description = this.description;

    // console.log(id + ", " + ", " + start + ", " + end + ".");
    console.log(id + ", " + name + ", " + start + ", " + end + ", " + description + ".");

}

Campaign.prototype.makePersistent = async function () {
    const id = this.id;
    const name = this.name;
    const start = this.start;
    const end = this.end;
    const description = this.description;
    console.log("-------------> make makePersistent");
    console.log(start);
    console.log(end);
    await pool.query("insert into jeg_adm.campaign values (default,'" + name + "','" + start + "','" + end + "','" + description + "');").catch((e)=> {console.log("--------------------------------");console.error(e)});;
    // await pool.query("insert into jeg_adm.campaign values (default,'" + start + "','" + end + "');").catch((e) => { console.log("--------------------------------"); console.error(e) });;

}

Campaign.prototype.pullData = async function () {
    const id = this.id;
    console.log("id en pullData: "+this.id);

    var info = await pool.query("select campaign_id,campaign_name,to_char(campaign_date_start, 'YYYY-MM-DD') as campaign_date_start, to_char(campaign_date_end, 'YYYY-MM-DD') as campaign_date_end, campaign_description from jeg_adm.campaign where campaign_id=" + id + ";");
    
    
    this.id = info.rows[0].campaign_id;
    this.name = info.rows[0].campaign_name;
    this.start = info.rows[0].campaign_date_start;
    this.end = info.rows[0].campaign_date_end;
    this.description = info.rows[0].campaign_description;

    
    
}

Campaign.prototype.updateData = async function () {
    const id = this.id;
    const name = this.name;
    const start = this.start;
    const end = this.end;
    const description = this.description;
    console.log("antes de query en updateData");
    await pool.query("update jeg_adm.campaign set campaign_date_start='" + start + "',campaign_date_end='" + end + "',campaign_name='" + name + "', campaign_description='" + description + "' where campaign_id=" + id + ";");
    // await pool.query("update jeg_adm.campaign set campaign_date_start=" + start + ",campaign_date_end=" + end + "where campaign_id=" + id + ";");

}

Campaign.prototype.delete = async function () {
    const id = this.id;

    await pool.query("delete from jeg_adm.campaign where campaign_id=" + id + ";");
}

module.exports.campaign = Campaign; 