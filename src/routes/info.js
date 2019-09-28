var fs = require('fs');

const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
const express = require('express');
const path = require('path');

const router = express.Router();

const pool = require('../database.js');

router.get('/info', async (req, res) => {
    var result = await pool.query("select client_id, client_name from jeg_adm.client;").catch((e) => { console.log("--------------info.js------------------"); console.error(e) });
    console.log(result.rows);
    res.render('info/selector', { clients: result.rows });
});

router.post('/infoClient', async (req, res) => {
    console.log('infoClient ' + req.body.idClient);
    var result = await pool.query("select * from jeg_adm.countryside where client_id=" + req.body.idClient + ";").catch((e) => { console.log("--------------info.js / infoClient------------------"); console.error(e) });
    console.log(result.rows);
    res.json(result.rows);
});

router.post('/infoCampo', async (req, res) => {
    console.log('infoCampo -> ' + req.body.idCampo);
    var result = await pool.query("select * from jeg_adm.lot where countryside_id=" + req.body.idCampo + ";").catch((e) => { console.log("--------------info.js/ /infoCampo------------------"); console.error(e) });
    console.log(result);
    console.log(result.rows);
    res.json(result.rows);
});

router.get('/info2', (req, res) =>{
    res.render('info/table');
});

router.get('/info3', (req, res) =>{
    res.render('info/table2');
});

router.get('/info4', (req, res) =>{
    res.render('info/pline');
});

router.get('/info5', (req, res) =>{
    res.render('info/tableSum');
});

router.get('/recibo', async (res,req) => {
    console.log('recibo');
    var templateHtml = fs.readFileSync(path.join('/home/joaquin/Escritorio/GIT/jeg-adm/src', 'pdf-template.html'), 'utf8');
    console.log(templateHtml);
    var milis = new Date();
    var d = new Date();
	milis = milis.getTime();
    const data = {
        employee: {
            name:'Jorge'
        },
        date: ( d.getDate() + '\\' + (d.getMonth()+1) + '\\' + d.getFullYear()),
        campaign:{
            name: '2019 soja'
        },
        amount:15,
        name:'recibo',
        signature:'Javier E.Gil'
    };
    var pdfPath = path.join('/home/joaquin/Escritorio/ppdf', `${data.name}-${data.date}-${milis}.pdf`);

    var options = {
        //width: '1230px',
        width: '1230px',

		headerTemplate: "<p></p>",
		footerTemplate: "<p></p>",
		displayHeaderFooter: false,
		margin: {
			top: "10px",
			bottom: "30px"
		},
		printBackground: true,
		path: pdfPath
	}
    var template = handlebars.compile(templateHtml);
    console.log(template);
	var html = template(data);
    console.log(html);
   

 


    const browser = await puppeteer.launch();

    var page = await browser.newPage();

    await page.goto(`data:text/html;charset=UTF-8,${html}`, {
		waitUntil: 'networkidle0'
	});

    await page.pdf(options);
	await browser.close();


});




module.exports = router;