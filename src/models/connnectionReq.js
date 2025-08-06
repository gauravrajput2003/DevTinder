const mongoose = require("mongoose");

const connectionReqSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",//refrence to the user collection
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignore", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }
}, {
    timestamps: true,
});
connectionReqSchema.index({fromUserId:1,toUserId:1});

// --- THIS IS THE FIX ---
// The function must accept `next` as a parameter.
connectionReqSchema.pre("save", function(next) {
    const connectionRequest = this;

    // Check if the fromUserId is equal to toUserId
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        // Create a proper error object to be passed to the catch block
        const err = new Error("You cannot send a connection request to yourself.");
        return next(err); // Pass the error to the next middleware
    }

    // If everything is okay, proceed with saving
    next();
});

const connectionReqModel = new mongoose.model("ConnectionRequest", connectionReqSchema);
module.exports = connectionReqModel;