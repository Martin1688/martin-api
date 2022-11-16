require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
//指定API router管理檔
const apiRouter = require(__dirname +'/app_api/routes/index');
//指定Web router管理檔
const webRouter = require(__dirname +'/app_public/routes/index');

var app = express();
app.use(express.json());


app.use(logger('dev'));
// parse application/x-www-form-urlencoded  會將request 的 body 轉為utf8文字
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json())
//設定網頁的根目錄
app.use(express.static(path.join(__dirname, 'app_public')));

//Cross-Origin Resource Sharing (CORS) 設定
app.use('/api', (req, res, next) => {
    //console.log('cors');
    if(req.headers.origin){
        console.log(req.headers.origin);
    }
    var allowedOrigins = ['https://martin-web.vercel.app', 'https://martin-api.vercel.app', 'http://localhost:4200', 'http://localhost:3000', 'http://127.0.0.1:3000','http://127.0.0.1:4200'];
    var origin = req.headers.origin === undefined ? req.headers.host:req.headers.origin;
    //console.log(req.headers);
    //console.log(origin);
    if (allowedOrigins.indexOf(origin) > -1) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    //res.header('Access-Control-Allow-Origin', 'http://localhost:4200');

    //res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS,PATCH,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

//如果是API就轉到API router管理檔，router管理檔會將path與處理函數對應
app.use('/api', apiRouter);
//如果是網頁就轉到Web router管理檔，router管理檔會將path與網頁對應
app.use('/web', webRouter);

//指定首頁
app.get('*', function(req, res, next) {
    // const prars=JSON.stringify(req.params);
    // console.log(paras);
    // //console.log(__filename);
    // console.log('here is starter.'+req.path);
    let myroute =__dirname;
    const fname = JSON.stringify(req.path);
    // console.log(fname);
    if(fname.indexOf('favicon') > -1){
        myroute += '/favicon.ico';
    } else{
        myroute +='/app_public/pages/login.html';
    }
     //myroute =`${__dirname}/app_public/pages/index.html`;//path.join(__dirname, 'app_public', 'pages', 'index.html');
    //console.log(myroute);
    res.sendFile(myroute);
});


app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res
            .status(401)
            .json({ "message": err.name + ": " + err.message });
    }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
const PORT = process.env.PORT || 3000;
//const apost =':'+PORT;
app.listen(PORT, () => {
    //console.log(JSON.stringify(path.myroute));
    console.log(`Server running at port: ${PORT}`);
});