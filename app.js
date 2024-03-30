const express = require('express');
const { chromium } = require('playwright');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// wait for variabl name, ape1, ape2 passed with post request


app.get('/server', async (req, res) => {
  const name = req.body.name ? req.body.name : null;
  const ape1 = req.body.ape1 ? req.body.ape1 : null;
  const ape2 = req.body.ape2 ? req.body.ape2 : null;
  console.log(name, ape1, ape2)
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await browser.newPage();


    await page.goto('https://www.zaragoza.es/ciudad/cementerios/');
    await page.waitForSelector('//*[@id="menu"]/ul/li[1]/div/a');
    await page.click('//*[@id="menu"]/ul/li[1]/div/a');
    await page.screenshot({ path: 'primera.png' });
    await page.waitForSelector('//*[@id="menu"]/ul/li[1]/ul/li[5]/a');
    await page.click('//*[@id="menu"]/ul/li[1]/ul/li[5]/a');
    await page.screenshot({ path: 'web.png' });
    await page.waitForSelector('#snombre');
    await page.fill('#snombre', name);
    await page.fill('#sape1', ape1);
    await page.fill('#sape2', ape2);

    await page.screenshot({ path: 'relleno.png' });
    await page.waitForSelector('//*[@id="formularioMapaTotem:buscar"]');
    await page.click('//*[@id="formularioMapaTotem:buscar"]');
    await page.screenshot({ path: 'lista.png' });

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
        rowData.elegir = columns[10] ? await columns[10].innerText() : null;

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
