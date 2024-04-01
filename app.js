const express = require('express');
const { chromium } = require('playwright');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 4000;
const SSL_KEY_PATH = './tutorial.key';
const SSL_CERT_PATH = './tutorial.crt'

app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(bodyParser.json());

const serverOptions = {
  key: fs.readFileSync(SSL_KEY_PATH),
  cert: fs.readFileSync(SSL_CERT_PATH)
};

app.post('/server', async (req, res) => {

  const name = req.body.data.name ? req.body.data.name : '';
  const ape1 = req.body.data.ape1 ? req.body.data.ape1 : '';
  const ape2 = req.body.data.ape2 ? req.body.data.ape2 : '';
  console.log(req.body.data);
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.zaragoza.es/ciudad/cementerios/');
    await page.waitForSelector('//*[@id="menu"]/ul/li[1]/div/a');
    await page.click('//*[@id="menu"]/ul/li[1]/div/a');
    await page.waitForSelector('//*[@id="menu"]/ul/li[1]/ul/li[5]/a');
    await page.click('//*[@id="menu"]/ul/li[1]/ul/li[5]/a');
    await page.waitForSelector('#snombre');
    await page.fill('#snombre', name);
    await page.fill('#sape1', ape1);
    await page.fill('#sape2', ape2);
    await page.screenshot({ path: 'example.png' });
    await page.waitForSelector('//*[@id="formularioMapaTotem:buscar"]');
    await page.click('//*[@id="formularioMapaTotem:buscar"]');
    await page.screenshot({ path: 'example2.png' });

    const tabla = await page.waitForSelector('//*[@id="formularioMapaTotem:resultsTable"]');
    const rows = await tabla.$$('tr');
    const data = [];

    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const columns = await rows[i].$$('td');
        const rowData = {};

        rowData.manzana = columns[0] ? await columns[0].innerText() : null;
        rowData.cuadro = columns[1] ? await columns[1].innerText() : null;
        rowData.fila = columns[2] ? await columns[2].innerText() : null;
        rowData.numero = columns[3] ? await columns[3].innerText() : null;
        rowData.primer_apellido = columns[4] ? await columns[4].innerText() : null;
        rowData.segundo_apellido = columns[5] ? await columns[5].innerText() : null;
        rowData.nombre = columns[6] ? await columns[6].innerText() : null;
        rowData.fecha_nacimiento = columns[7] ? await columns[7].innerText() : null;
        rowData.fecha_defuncion = columns[8] ? await columns[8].innerText() : null;
        rowData.tipo_restos = columns[9] ? await columns[9].innerText() : null;
        rowData.elegir = columns[10] ? (await columns[10].innerHTML()).match(/selContenedor\('(\d+)'\)/)[1] : null;

        data.push(rowData);
      }
    }

    res.json(data);
    await browser.close();
  } catch (error) {
    console.error('Error scraping website:', error);
    res.status(500).json({ error: 'An error occurred while scraping the website' });
  }
});

https.createServer(serverOptions, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
