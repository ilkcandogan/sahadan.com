var express = require('express');
var app = express();
var https = require("https");
const { jsonrepair } = require('jsonrepair');
var puppeteer = require("puppeteer-core");
//var puppeteer = require("puppeteer"); //Only Debug Mode

const URI = 'http://arsiv.sahadan.com/genis_ekran_iddaa_programi';
const launchOptions = {
  executablePath: process.env.CHROME_BIN,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ],
  //Only Debug Mode
  /*headless: false,
  defaultViewport: null,
  args: ['--start-maximized'],*/
}

setInterval(() => {
  https.get("https://sahadan-ilkcan.onrender.com/", (res) => {
    console.log("Server is alive...");
  });
}, (1000 * 60) * 5); //5min periods

app.get('/', (req, res) => {
  res.json({ status: 'alive' });
});

app.get('/options/:type', (req, res) => {
  (async () => {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    await page.goto(URI).catch(() => {
      browser.close();
    })
  
    const options = await page.$$eval((req.params.type == 'days' ? '#dayId' : '#groupId') + ' option', options => options.map(option => {
      return {
        value: option.value,
        text: option.innerText
      };
    }));

    res.json({status: 'success', options: options});
  
    await browser.close();
  })().catch(() => {
    res.json({status: 'error', message: 'Sahadan.com sunucularına bağlanılamadı. Lütfen tekrar deneyin.'});
  })
})

app.get('/options/:day/:unplayed/league', (req,res) => {
  (async () => {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    await page.goto(URI).catch(() => {
      browser.close();
    })

    const fetchData = await page.evaluate(async (day, unplayed) => {
      // API adresi
      const week = Mackolik.Program.currentWeek;
      const url = "https://arsiv.sahadan.com/AjaxHandlers/ProgramComboHandler.ashx?type=6&sortValue=DATE&week=" + week + "&day=" + day + "&sort=-1&sortDir=1&groupId=-1&np=" + unplayed + "&sport=1";

      // API'den veri al
      const response = await fetch(url);
      const text = await response.text();

      // Verileri döndür
      return text;
    
    }, req.params.day == 0 ? -1 : req.params.day, req.params.unplayed);

    const options = JSON.parse(jsonrepair(fetchData)).l.map((option) => {
      return {
        value: option[0],
        text: option[1]
      };
    })

    res.json({status: 'success', options: options })
    
    await browser.close();
  })().catch(() => {
    res.json({status: 'error', message: 'Sahadan.com sunucularına bağlanılamadı. Lütfen tekrar deneyin.'});
  })
})

app.get('/table/:day/:league/:unplayed', (req, res) => {

  (async () => {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    await page.goto(URI).catch(() => {
      browser.close();
    })

    const fetchData = await page.evaluate(async (day, league, unplayed) => {
      // API adresi
      const week = Mackolik.Program.currentWeek;
      const url = "http://arsiv.sahadan.com/AjaxHandlers/ProgramDataHandler.ashx?type=6&sortValue=DATE&week=" + week + "&day=" + day + "&sort=-1&sortDir=1&groupId=" + league + "&np=" + unplayed + "&sport=1";
  
      // API'den veri al
      const response = await fetch(url);
      const text = await response.text();

      // Verileri döndür
      return text;
    
    }, req.params.day == 0 ? -1 : req.params.day , parseInt(req.params.league) || -1, req.params.unplayed);

    var dataArr = [];
    Object.entries(JSON.parse(jsonrepair(fetchData))).map((data, index) => { data[1].map((d, index) => { dataArr.push(d.m) }) });

    var tableArr = [];
    dataArr.map((data, index) => {
      data.map((d, index)  => {
        /*let tmp = {
          saat: d[6],
          lig: d[26],
          mbs: d[13],
          evSahibi: d[1],
          misafir: d[3],
          iy: d[11] + ' - ' + d[12],
          ms: d[8] + ' - ' + d[9],
          grup: {
            macSonucu: {
              m1: d[16],
              mX: d[17],
              m2: d[18]
            },
            ilkYariSonucu: {
              i1: d[33],
              iX: d[34],
              i2: d[35]
            },
            handikapMacSonucu: {
              h1: d[36],
              hX: d[37],
              h2: d[38]
            },
            karsilikliGol: {
              var: d[39],
              yok: d[40]
            },
            cifteSans: {
              c1X: d[19],
              c12: d[20],
              cX2: d[21]
            },
            iy15Gol: {
              a: d[42],
              u: d[43]
            },
            au15Gol: {
              a: d[44],
              u: d[45]
            },
            au25Gol: {
              a: d[22],
              u: d[23]
            },
            au35Gol: {
              a: d[46],
              u: d[47]
            },
            toplamGol: {
              t01: d[29],
              t23: d[30],
              t46: d[31],
              t7: d[32]
            }
          }
        }*/
        if(!(req.params.unplayed == "0" && d[11] == "" && d[12] == "" & d[8] == "0" && d[9] == "0")) {
          let tmp = [
            d[6],
            /*d[26],
            d[13],*/
            d[1],
            d[3],
            d[11] + '-' + d[12],
            d[8] + '-' + d[9],
            "",
            d[16],
            d[17],
            d[18],
            d[33],
            d[34],
            d[35],
            d[36],
            d[37],
            d[38],
            d[39],
            d[40],
            d[19],
            d[20],
            d[21],
            d[42],
            d[43],
            d[44],
            d[45],
            d[22],
            d[23],
            d[46],
            d[47],
            d[29],
            d[30],
            d[31],
            d[32],
          ]
          tableArr.push(tmp)
        }
      })
    })

    res.json({status: 'success', table: tableArr})
 
    await browser.close();
  })().catch(() => {
    res.json({status: 'error', message: 'Sahadan.com sunucularına bağlanılamadı. Lütfen tekrar deneyin.'});
  })
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
