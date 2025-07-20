const mongoose = require("mongoose");

const connDB = async () => {
    // try {
        await mongoose.connect(
            "mongodb+srv://project01:Animal%40%408000@project01.zfjbz.mongodb.net/devTinder?retryWrites=true&w=majority&appName=project01"
        );

};

module.exports = connDB;