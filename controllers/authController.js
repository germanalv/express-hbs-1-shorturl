const User = require("../models/User");
const { validationResult } = require('express-validator');
const {nanoid} = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerForm = (req, res) => {
    res.render("register");
};

const loginForm = (req, res) => {
    res.render("login");
};

const registerUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.json(errors)

        req.flash('mensajes', errors.array())
        return res.redirect('/auth/register')

    }
    
    const {userName, email, password} = req.body;
    try {
        let user = await User.findOne({ email: email});
        if (user) throw new Error("Ya existe usuario");
        user = new User({userName, email, password, tokenConfirm: nanoid() });
        //Tambien se puede pasar todo lo que viene en req.body
        //new User(req.body)
        //Graba en la bas de datos
        await user.save(); 

        //Enviar correo con la confirmacion de la cuenta

        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.USEREMAIL,
                pass: process.env.PASSEMAIL,
            },
        });

        await transport.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>',
            to: user.email,
            subject: "verifique cuenta de correo",
            html: `<a href="${ process.env.PATHHEROKU || 'http://localhost:5000'}/auth/confirmar/${user.tokenConfirm}">verificar cuenta aquí</a>`,
        });

        req.flash('mensajes', [{msg: "Revisa tu correo electrónico y valida cuenta" }])

        res.redirect('/auth/login')
        
    } catch (error) {
        //res.json({error: error.message});
        req.flash('mensajes', [{msg: error.message }])
        return res.redirect('/auth/register')
    }
};

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('mensajes', errors.array())
        return res.redirect('/auth/login')
    }

    const {email, password} = req.body;
    try {
        const user = await User.findOne({email: email});
        if (!user) throw new Error("No existe email");
        if (!user.cuentaConfirmada) throw new Error("Cuenta no confirmada");
        if (!await user.comparePassword(password)) throw new Error("Contraseña no correcta");
         // me está creando la sesión de usuario a través de passport
         req.login(user, function (err) {
            if (err) throw new Error("Error con al crear la sesión");
            res.redirect("/");
        });
    } catch (error) {
        // console.log(error);
        req.flash('mensajes', [{msg: error.message }])
        res.redirect('/auth/login')
        // res.send(error.message);
    }
};

const confirmarCuenta =  async (req, res) => {
    const {token} = req.params;
    try {
        const user = await User.findOne({tokenConfirm: token});
        if(!user) throw new Error("No existe usuario")
        user.cuentaConfirmada = true;
        user.tokenConfirm = null;
        await user.save(); 
        
        req.flash('mensajes', [
            { msg: "Cuenta verificada! Puede iniciar sesión." }
        ]);
        res.redirect('/auth/login')
    } catch (error) {
        req.flash('mensajes', [{msg: error.message }])
        return res.redirect('/auth/login')
    }      

};

const cerrarSesion = (req, res) => {
    req.logout();
    return res.redirect('/');
};

module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion,
};