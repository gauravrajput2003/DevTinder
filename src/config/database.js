const mongoose = require("mongoose");

const connDB = async () => {
    // try {
        await mongoose.connect(
        process.env.MONGODB_STRING
        );

};

module.exports = connDB;