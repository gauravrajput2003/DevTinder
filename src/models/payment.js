const mongoose = require("mongoose");
const { Schema } = mongoose;





const PaymentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        orderId: {
            type: String,
            required: true,
            index: true,
        },
        paymentId: {
            type: String,
            default: null,
            index: true,
        },
        amount: {
            type: Number, // stored in subunits (e.g., paise)
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
        status: {
            type: String,
            enum: ["created", "attempted", "paid", "failed", "refunded"],
            default: "created",
            index: true,
        },
        receipt: {
            type: String,
            default: null,
        },
        offer_id: {
            type: String,
            default: null,
        },
        notes: {
            firstName: { type: String },
            lastName: { type: String },
            membershipType: { type: String },
        },
        rawOrder: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("payment", PaymentSchema);