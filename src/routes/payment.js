const express=require("express");
const { userAuth } = require("../middlewares/Auth");
const paymentrouter=express.Router();
const razorpayInstance=require("../utils/razorpay")
const Payment = require("../models/payment");
const { memberShipAmount } = require("../utils/constant");
paymentrouter.post("/payment/create",userAuth,async(req,res)=>{
    try{
      const{membershipType}=req.body;
      const{firstName,lastName,email}=req.body;
const order= await razorpayInstance.orders.create({
     amount: 500,  // paise
  currency: memberShipAmount[membershipType]*100,
  receipt: "order_rcptid",
  "notes":{
    firstName,
    lastName,
    email,
    membershipType:membershipType,
  },
});
  // save it to database
  console.log(order);
  
  const paymentDoc = await Payment.create({
    userId: req.user._id,
    orderId: order.id,
    paymentId: null,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    receipt: order.receipt || null,
    offer_id: order.offer_id || null,
    notes: order.notes || undefined,
   // rawOrder: order,
  });

  // single response: include both the provider order and the saved payment doc
  return res.status(201).json({... paymentDoc.toJSON() });
    }
    catch(err){
  console.log(err.message);
  res.status(400).json({message: "Payment order creation failed", error: err.message});
    }
})
module.exports=paymentrouter;