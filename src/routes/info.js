const express = require('express');

const router = express.Router();

const pool = require('../database.js');

router.get('/info', async (req,res) => {
    var result = await pool.query("select client_id, client_name from jeg_adm.client;").catch((e)=> {console.log("--------------info.js------------------");console.error(e)});
    console.log(result.rows);
    res.render('info/selector', {clients: result.rows});
});

router.post('/infoClient', async (req,res) => {
    console.log('infoClient '+req.body.idClient);
    var result = await pool.query("select * from jeg_adm.countryside where client_id="+req.body.idClient+";").catch((e)=> {console.log("--------------info.js / infoClient------------------");console.error(e)}); 
    console.log(result.rows);
    res.json(result.rows);
});

router.post('/infoCampo', async (req,res) => {
    console.log('infoCampo -> '+req.body.idCampo);
    var result = await pool.query("select * from jeg_adm.lot where countryside_id="+req.body.idCampo+";").catch((e)=> {console.log("--------------info.js/ /infoCampo------------------");console.error(e)}); 
    console.log(result);
    console.log(result.rows);
    res.json(result.rows);
});


module.exports = router;