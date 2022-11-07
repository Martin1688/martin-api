var sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const dbpath = 'app_api/models/client.db';
//const dbpath = '../models/shopdb.db';
var db = new sqlite3.Database(dbpath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.log(err);
        }
    });
const secretWord = process.env.JWT_SECRET || 'heyheymyyPrivateSecret';

//new sqlite3.Database(dbpath);


const dbinit = (req, res) => {
    console.log('dbinit');

    // const sql_create = `CREATE TABLE IF NOT EXISTS Books (
    //     Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    //     Title VARCHAR(100) NOT NULL,
    //     Author VARCHAR(100) NOT NULL,
    //     Comments TEXT
    //   );`;

    //   db.run(sql_create, err => {
    //     if (err) {
    //       return console.log(err.message);
    //     } else {
    //         console.log("Successful creation of the 'Books' table");
    //     }
    //   });



    let createsql = '';
    createsql = 'CREATE TABLE IF NOT EXISTS usertb (';
    createsql += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    createsql += 'name text NOT NULL,';
    createsql += 'password text NOT NULL,';
    createsql += 'phoneno text NOT NULL,';
    createsql += 'email text NOT NULL UNIQUE,';
    createsql += 'gender INTEGER NOT NULL,';
    createsql += 'role text NOT NULL,';//1.admin, 2.shophost, 3.client
    createsql += 'created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)';
    db.serialize(() => {
        db.run(createsql, (err) => {
            if (err) {
                console.log(err);
                res.status(401).json({ message: err, data: '' });
            } else {
                console.log('usertb is existed');
            }
        });
    });

    //預插入系統管理者
    const sql = 'SELECT * from usertb where email = ?';
    db.serialize(() => {
        db.get(sql, ['martinfb168@gmail.com'], (err, rows) => {
            if (err) {
                console.log(err);
            } else if (rows) {
                console.log(rows);
                console.log('admin existed.');
                res.status(200).json({ message: '', data: '' });
            } else {
                const tabName = 'usertb';
                const colList = ['name', 'password', 'phoneno', 'email', 'gender', 'role',];
                const valList = ['Martin', 'home888', '0933866241', 'martinfb168@gmail.com', '1', 'admin'];
                insertrow(tabName, colList, valList, res);
            }
        });
    });
}

const getuserbymail = (mail) => {
    let ret = false;
    const sql = 'SELECT * from usertb where email = ?';
    db.serialize(() => {
        db.get(sql, [mail], (err, rows) => {
            if (err) {
                console.log(err);
                return ret;
            } else if (rows) {
                console.log(rows);
                console.log('admin existed.');
                ret = true;
                return ret;
            }
        });
    });
}

const insertrow = (tabName, colList, valList, res) => {
    const colCount = colList.length;
    console.log(colCount);
    let colStr = '(';
    let qmStr = '(';
    for (let i = 0; i < colCount; i++) {
        if (i === colCount - 1) {
            colStr += colList[i] + ')';
            qmStr += '?)';
        } else {
            colStr += colList[i] + ',';
            qmStr += '?,';
        }
    }
    const sqlStr = `insert into ${tabName}${colStr} values${qmStr}`;
    console.log(sqlStr);
    //res.status(200).json({ message: '', data: '' });
    db.serialize(() => {
        db.run(sqlStr, valList, (err) => {
            if (err) {
                console.log(err);
                res.status(401).json({ message: err, data: '' });
            } else {
                console.log(`A row inserted to ${tabName}`);
                res.status(200).json({ message: '', data: '' });
            }
        });
    });
}

// for register user of a shop
const insert1row = (req, res) => {
    // const name=req.name; 
    // const password=req.password; 
    // const phoneno=req.phoneno; 
    // const email=req.email; 
    // const gender=req.gender; 
    // const role=req.role;
    const strObj = req.strobj;
    const obj = JSON.parse(strObj);
    const colList = Object.keys(obj);


    const tabName = req.tabName;
    const valList = colList.map(key => {
        return obj[key];
    })
    console.log(colList);
    console.log(valList);
    res.status(200).json({ message: '', data: '' });
    //insertrow(tabName, colList, valList, res);
}

const login = (req, res) => {
    const password = req.password;
    const email = req.email;
    const shopid = req.shopid;
    const sql = 'SELECT usertb.*  from usertb  where usertb.email = ? ';
    db.serialize(() => {
        db.get(sql, [email, shopid], (err, rows) => {
            if (err) {
                console.log(err);
            } else if (rows) {
                console.log(rows);
                if (rows.password === password) {
                    let ret = new Object();
                    ret.name = rows.name;
                    ret.role = rows.role;
                    ret.token = generateJwt(email);
                    res.status(200).json({ message: '', data: ret });
                } else {
                    res.status(401).json({ message: 'password 不正確', data: '' });
                }
            } else {
                res.status(400).json({ message: 'email 不正確', data: '' });
            }
        });
    });
}
const generateJwt = function (mail) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    console.log(secretWord);
    return jwt.sign({
        email: mail,
        exp: parseInt(expiry.getTime() / 1000, 10),
    }, secretWord);
};
//db.close();
//


module.exports = {
    dbinit,
    insert1row,
    login
};    