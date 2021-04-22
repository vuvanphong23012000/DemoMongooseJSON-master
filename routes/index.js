var express = require('express');
var router = express.Router();
// sinh viên bổ sung đường kết nối tới mongoDB của mình vào dòng 4
var dbConnect = 'mongodb+srv://phongvvph12450:Oanhbong97@cluster0.9c8cf.mongodb.net/tinder?retryWrites=true&w=majority';
// getting-started.js
const mongoose = require('mongoose');
mongoose.connect(dbConnect, {useNewUrlParser: true, useUnifiedTopology: true});

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        var chuoi=file.originalname;
        var duoi=file.originalname.slice(chuoi.length-4,chuoi.length);
        if(duoi=='.jpg'){

            cb(null, file.fieldname + '-' + Date.now() +duoi)
        }else {
            cb('khong phải file jpg',null)
        }
    }
});
var upload=multer({
    storage:storage,
}).single('avatar');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('connected')
});

var user = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    address: String,
    number_phone: String,
    avatar: String
});
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.get('/Login', function (req, res, next) {
    res.render('Login', {title: 'Express'});
});
router.get('/Home',function (req,res){
    var type=req.query.type;
    if(type=='json') {
        res.send(user)
    }
    var userConnect1=db.model('users',user);
    userConnect1.find({},function (err,users) { //lay tat ca
        if(err){
            res.render('listUser',{title:'Express :err'+err})
        }
        res.render('listUser',{title:'Express :Success',users:users})
    })
});
router.post('/Login', function (req, res) {
    var userConnect = db.model('users', user);
    upload(req,res,function (err){
        if(err){
            console.log(err)
            return;
        }else {
            userConnect({
                username: req.body.username,
                password: req.body.password,
                name: req.body.name,
                address: req.body.address,
                number_phone: req.body.number_phone,
                avatar: req.file.filename
            }).save(function (error) {
                if(err){
                    res.render('Login',{title:'Express :err'})
                }else {
                    var userConnect1=db.model('users',user);
                    userConnect1.find({},function (err,users) { //lay tat ca
                        if(err){
                            res.render('Login',{title:'Express :err'+err})
                        }
                        res.render('Login',{title:'Express :Success',users:users})
                    })
                }
            });
        }
    })

});


router.get('/deleteUsers/:id',function (req,res) {

    db.model('users',user).deleteOne({ _id: req.params.id}, function (err) {
        if (err) {
            console.log('Lỗi')
        }

        res.redirect('../Home')

    });
})


router.get('/updateUser/:id',function (req,res) {
    console.log('id:'+req.params.id)
    db.model('users',user).findById(req.params.id,function (err,data) {
        if(err){
            console.log("loi")
        }else {
            res.render("updateUser",{dulieu: data})

        }
    })
})
router.post('/updateUser',function (req,res) {
    var userConnect=db.model('users',user);
    upload(req, res, function (err){
        if(err){
            console.log(err)

        }else {
            if(!req.file){
                userConnect.updateOne(req.body._id,{
                    username:req.body.userNameUd,
                    password:req.body.passwordUd,
                    name: req.body.name,
                    address: req.body.address,
                    number_phone: req.body.numberPhoneUd,
                },function (err) {
                    if(err){
                        console.log(err)
                    }else {
                        res.redirect('../Home')
                    }
                }  )
            }else {

                userConnect.updateOne(req.body._id,{

                    username:req.body.userNameUd,
                    password:req.body.passwordUd,
                    name: req.body.name,
                    address: req.body.address,
                    number_phone: req.body.numberPhoneUd,
                    avatar:req.file.filename,
                },function (err) {
                    if(err){
                        console.log(err)
                    }else {
                        res.redirect('../Home')
                    }
                }  )
            }
        }

    });


/*
    router.post('/update',(req,res) =>{
        var userConnect=db.model('users',user);
        userConnect.updateOne(req.body._id,{
            userName:req.body.usernameDK,
            email:req.body.emailDK,
            sdt:req.body.sdtDK,
            avatar:req.file.filename,
        }).then(data =>{
            console.log(data)
            res.send(data)
        }).catch(err => {
            console.log("error",err)
        })
    })*/
    router.post("/usersData", async (req, res) => {
        var userConnect=db.model('users',user);
        const u = new userConnect(req.body);
        try {
            await u.save();
            res.send(u);
        } catch (error) {
            res.status(500).send(error);
        }
    });
    router.post("/deleteData", (req, res) => {
        db.model('users',user).findByIdAndRemove(req.body.id)
            .then((data) => {
                console.log(data);
                res.send(data);
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    });
    router.post("/updateData", (req, res) => {
        db.model('users',user).findByIdAndUpdate(req.body.id, {
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            address: req.body.address,
            number_phone: req.body.number_phone,
        })
            .then((data) => {
                console.log(data);
                res.send(data);
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    });
});
router.get('/getUsers', function (req, res) {
    var connectUsers = db.model('users', user);
    var baseJson = {
        errorCode: undefined,
        errorMessage: undefined,
        data: undefined
    }
    connectUsers.find({}, function (err, users) {
        if (err) {
            baseJson.errorCode = 403
            baseJson.errorMessage = '403 Forbidden'
            baseJson.data = []
        } else {
            baseJson.errorCode = 200
            baseJson.errorMessage = 'OK'
            baseJson.data = users
        }
        res.send(baseJson);
    })

});
module.exports = router;
