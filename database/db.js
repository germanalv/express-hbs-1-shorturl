require("dotenv").config();
const mongoose = require("mongoose");

const clientDB = mongoose
    .connect(process.env.URI)
    .then((m) => {
        console.log("db conectada 🔥");
        return m.connection.getClient();
    })
    .catch((e) => console.log("error de conexión: " + e));

module.exports = clientDB;