const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>{
    const myroute =__dirname.replace('routes','pages')+'/default.html';//`${}/app_public/pages/default.html`;//path.join(__dirname, 'app_public', 'pages', 'index.html');
    console.log(myroute);
    console.log(req.path);
    res.sendFile(myroute);
});
router.get('/test',(req,res)=>{
    const myroute =__dirname.replace('routes','pages')+req.path.toString()+'.html';//`${}/app_public/pages/default.html`;//path.join(__dirname, 'app_public', 'pages', 'index.html');
    console.log(myroute);
    console.log(req.path);
    res.sendFile(myroute);
});
router.get('/shopregister',(req,res)=>{
    const myroute =__dirname.replace('routes','pages')+req.path.toString()+'.html';//`${}/app_public/pages/default.html`;//path.join(__dirname, 'app_public', 'pages', 'index.html');
    console.log(myroute);
    console.log(req.path);
    res.sendFile(myroute);
});
router.get('/login',(req,res)=>{
    const myroute =__dirname.replace('routes','pages')+req.path.toString()+'.html';//`${}/app_public/pages/default.html`;//path.join(__dirname, 'app_public', 'pages', 'index.html');
    console.log(myroute);
    console.log(req.path);
    res.sendFile(myroute);
});
router.route('/')

module.exports = router;