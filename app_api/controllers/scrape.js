const app = require('https');
const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const getexchange = (req, res) => {
    const url = 'https://rate.bot.com.tw/xrt?Lang=zh-TW';
    //console.log('getexchange');

    const request = app.request(url, (response) => {
        let info = '';
        response.on('data', (chunk) => {
            info = info + chunk.toString();
        });

        response.on('end', () => {
            //console.log('end');
            const data = [];
            const $ = cheerio.load(info); //載入body
            const list = $(".table-bordered tbody tr"); //尋找 class>tbody>tr
            const time = $(".time").html();
            //console.log(time);
            //console.log(list.length);
            for (let i = 0; i < list.length; i++) {
                const currency = list.eq(i).find("[class='visible-phone print_hide']").text().replace(/\n/g, '').trim();
                const cash = list.eq(i).find("[class='rate-content-cash text-right print_hide']");
                const spot = list.eq(i).find("[class='text-right display_none_print_show print_width']");
                const cash_bid = cash.eq(0).text();
                const cash_ask = cash.eq(1).text();
                const spot_bid = spot.eq(2).text();
                const spot_ask = spot.eq(3).text();
                data.push({ currency, cash_bid, cash_ask, spot_bid, spot_ask });
            }
            //console.log(data);
            res.status(200).json({ message: '', datetime: time, data: data });
        });
    })

    request.on('error', (error) => {
        console.log('An error', error);
        res.status(400).json({ message: error, data: '' });
    });
    request.end();
}

const getweatherevents= (req, res) =>{
    const urls =['https://www.cwb.gov.tw/V8/C/E/index.html','https://www.cwb.gov.tw/V8/C/P/Warning/W25.html','https://www.cwb.gov.tw/V8/C/P/Warning/W26.html','https://www.cwb.gov.tw/V8/C/P/Warning/W37.html','https://www.cwb.gov.tw/V8/C/P/Typhoon/TY_NEWS.html',] ;
    //地震報告,陸上強風特報,大雨特報,颱風消息,長浪即時訊息
    const info = [];
    (async () => {
        const browser = await puppeteer.launch({
            headless: true//false 會讓瀏覽器實際開啟//true 會再後台開啟           
        });
        const data = [];
        const page = await browser.newPage();
        await page.goto(urls[0]);
        let body = await page.content()
        let $ = await cheerio.load(body)
        const list = $(".eq-row");
        for (let i = 0; i < list.length; i++){
            const grade ='最大震度'+list.eq(i).find("[headers='maximum']").html();
            const div =list.eq(i).find("[class='eq-detail']");
            let datetime='';
            div.find('span').each(function(c,li){
                if(c==0){
                    datetime=$(li).html();
                }
            });
            //console.log(datetime.length);
            let obj ={};
            div.find('ul > li').each(function(n,el){
                if(n===0){
                    obj.locate=$(el).text();
                } else  if(n===1){
                    obj.deep=$(el).text();
                }else  if(n===2){
                    obj.scale=$(el).text();
                }
                
            });
            //console.log(list.eq(i).html());
            data.push({grade, datetime, obj});
        }
        info.push({title:'地震報告',data});
        for (let x = 1; x < 3; x++) {
            await page.goto(urls[x]);
            //let anchor = page.$("[title='發布情形']");
            //console.log(anchor);
            if(x < 3){
                await page.click("[title='發布情形']");
            }

            let body = await page.content();
            let $ = await cheerio.load(body);
            let title = $('.main-title').text();
            const div =$('.border-ltr-blue');
            //console.log(div.html());
            const content = div.find("#WarnContent").text();
            const time = div.find("#warningTime").text();
            //console.log(time.html());
            // for (let i = 0; i < list.length; i++) {
            //     //console.log(list.eq(i).find("[target='_self']").attr('href').split('=')[1]);//=""
            //     const county = list.eq(i).find("[class='city']").text().replace(/\n/g, '').trim();
            //     const temcs = list.eq(i).find("[class='tem-C is-active']");
            //     const rain = list.eq(i).find("[class='rain']");
            //     const temcstr = temcs.eq(0).text();
            //     const rainstr = rain.eq(0).text();
            //     const countyno = list.eq(i).find("[target='_self']").attr('href').split('=')[1];
            //     data.push({ county, temcstr, rainstr, countyno });
            // }
            info.push({ title: title, datetime: time, data: content });
        }
        await page.goto(urls[3]);
        const body3 = await page.content();
        $ = await cheerio.load(body3);
        let title = $('.main-title').text();
        let div =$('.content-border-gray');
        const content = div.find(".WarnContent").text();
        let time = div.find(".datetime").text();
        info.push({ title: title, datetime: time, data: content });
        // await page.goto(urls[4]);
        // await page.click("[href='#business-1']");
        // const body4 = await page.content();
        // $ = await cheerio.load(body4);
        // title = $('.main-title').text();
        // div =$('.col-md-12');
        // time = div.find("#TY_TIME").html();

        // const contentty=div.find('h4').text();
        // const contentbref=div.find("[href='#collapse-A1']").text();
        // const contentbody=div.find("[class='panel-body']").text();
        // console.log(contentbref);
        // info.push({ title: title,  datetime: time, data:{contentty,contentbref,contentbody} });
         res.status(200).json({ message: '', data: info });
       await browser.close();

    })();
}


const getweather = (req, res) => {
    const url = 'https://www.cwb.gov.tw/V8/C/W/County/index.html';
    const btnary = ['#btnDay0', '#btnDay1', '#btnDay2'];
    const info = [];
    (async () => {
        const browser = await puppeteer.launch({
            headless: true//false 會讓瀏覽器實際開啟//true 會再後台開啟           
        });
        const data = [];
        const page = await browser.newPage();
        await page.goto(url);
        for (let i = 0; i < btnary.length; i++) {
            await page.click(btnary[i]);
            let body = await page.content()
            let $ = await cheerio.load(body)
            const list = $("#town li");
            const time = $("#fcst_time");
            //console.log(time.html());
            for (let i = 0; i < list.length; i++) {
                //console.log(list.eq(i).find("[target='_self']").attr('href').split('=')[1]);//=""
                const county = list.eq(i).find("[class='city']").text().replace(/\n/g, '').trim();
                const temcs = list.eq(i).find("[class='tem-C is-active']");
                const rain = list.eq(i).find("[class='rain']");
                const temcstr = temcs.eq(0).text();
                const rainstr = rain.eq(0).text();
                const countyno = list.eq(i).find("[target='_self']").attr('href').split('=')[1];
                data.push({ county, temcstr, rainstr, countyno });
            }
            info.push({ title: $(btnary[i]).text(), datetime: time.html(), data: data });
        }
        let body = await page.content()
        let $ = await cheerio.load(body)
        const list = $(".warnlist li");
        let items = [];
        for (let i = 0; i < list.length; i++){
            //const item = list.eq(i).find('a').attr('title');
            //console.log(list.eq(i).find('a').html());
            items.push({title:list.eq(i).find('a').attr('title'),href:list.eq(i).find('a').attr('href')});
        }
        info.push({ title: '氣象特報', datetime: '', data: items });
        await browser.close();
        res.status(200).json({ message: '', data: info });
    })();
}
module.exports = {
    getexchange,
    getweather,
    getweatherevents
}; 