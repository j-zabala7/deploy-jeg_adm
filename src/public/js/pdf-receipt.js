var fs = require('fs');

const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
const path = require('path');


module.exports = {
    async pdf_creator(info) {
        console.log('recibo>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><');
        console.log(info);
        var templateHtml;
        const pathToReceipt = '/home/joaquin/Escritorio/GIT/jeg-adm/src/receipt/'; // para windows: \\ (uno es para el escapar el simbolo)
        if (info.work_type)
            templateHtml = fs.readFileSync(path.join(pathToReceipt, 'pdf-templatew.html'), 'utf8');
        else
            templateHtml = fs.readFileSync(path.join(pathToReceipt, 'pdf-template2.html'), 'utf8');

        console.log(templateHtml);
        var milis = new Date();
        var d = new Date();
        var date = new Date(info.date);
        console.log((date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()));
        milis = milis.getTime();
        const data = {
            employee: {
                name: info.employee_name
            },
            //date: (d.getDate() + '\\' + (d.getMonth() + 1) + '\\' + d.getFullYear()),
            date: (date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear()),
            campaign: {
                name: info.campaign_name
            },
            work: {
                name: info.work_type
            },
            amount: info.amount,
            name: 'recibo-' + info.employee_name,
            signature: info.signature,
            concept: info.concept
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

        const pdf = await page.pdf(options);
        await browser.close();
        return pdf;

    }

}