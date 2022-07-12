const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(cors());

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://ankit:ankit@majorcluster.vxudnug.mongodb.net/face-recognition?retryWrites=true&w=majority');
  console.log('mongoDB connected!!!')
}  

const usersSchema = new mongoose.Schema({
    name: { type : String , required : true},
    email: { type : String , unique : true, required : true, lowercase: true},
    entries: {type: Number, default: 0},
    joined: Date
});

const User = mongoose.model('User', usersSchema);

const loginSchema = new mongoose.Schema({
    hash: String,
    email: { type : String , unique : true, required : true},
});

const Login = mongoose.model('Login', loginSchema);


app.get('/' , (req , res) => {
    res.send(database.users)
})

app.post('/signin' , async (req , res) => {
    const {email, password} = req.body;
    await Login.find({'email': email})
    .then(sLogin => {
        const isValid = bcrypt.compareSync(password, sLogin[0].hash);
        if(isValid){
             User.find({'email': req.body.email})
            .then(sUser => {
                res.json(sUser);
            })
            .catch(err => {
              res.status(400).json('Unable to get user!!!')
            })
        }
        else{
            res.status(400).json('Wrong Credentials!!!');
        }
    })
    .catch(err => {
        res.status(400).json('Wrong Credentials!!!')
    })
})

app.post('/register' , async (req , res) => {
    const {email , name , password} = req.body;
    const hash = bcrypt.hashSync(password);
    let loginFound = false;

    const login = new Login({
        hash: hash,
        email: email
    })
    await login.save()
    .then(lUser =>{
        loginFound = true;
    }).catch(err =>{
        console.log(err)
        loginFound = false;
        res.status(400).json('Unable to register!!!');
    });

    if(loginFound){
        const user = new User({
            name: name,
            email: login.email,
            joined: new Date
        });
        await user.save()
        .then(user =>{
            console.log(user)
            res.json(user);
        })
        .catch(err =>{
            res.status(401).json('Unable to Register!!!')
        });
    }
})

app.get('/profile/:id' , async (req , res) => {
    const {id} = req.params;
    await User.findById(id)
    .then(user =>{
        if(user){
            res.json(user);
        }
        else{
            res.status(400).json('Not Found!!!')
        }
    })
    .catch(err =>{
        res.status(400).json('error getting the user!!!')
    })
})

app.put('/image' , async (req , res) =>{
    const {id} = req.body;
    await User.findByIdAndUpdate({'_id': id}, {$inc: {entries: 1}})
    .then(user =>{
        if(user){
            res.json(user.entries);
        }
        else{
            res.status(400).json('Not Found!!!')
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(400).json('Unable to Show!!!');
    })
})


app.listen(3000 , () =>{
    console.log('app is running petty good yaaa!!!')
});