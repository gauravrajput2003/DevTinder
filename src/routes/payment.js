const express=require("express");
const { userAuth } = require("../middlewares/Auth");
const paymentrouter=express.Router();
const razorpayInstance=require("../utils/razorpay")
const Payment = require("../models/payment");
const { memberShipAmount } = require("../utils/constant");
paymentrouter.post("/payment/create",userAuth,async(req,res)=>{
    try{
  const { membershipType } = req.body;
  const body = req.body || {};
  const firstName = body.firstName || req.user?.firstName || "";
  const lastName = body.lastName || req.user?.lastName || "";
  const email = body.email || req.user?.email || "";
      if(!membershipType){
        return res.status(400).json({message:"membershipType is required"});
      }
      const planKey = String(membershipType).toLowerCase();
      const rupees = memberShipAmount[planKey];
      if(!rupees){
        return res.status(400).json({message:`Invalid membershipType: ${membershipType}`});
      }
const order= await razorpayInstance.orders.create({
  amount: Math.round(rupees*100),  // paise
  currency: "INR",
  receipt: `order_${planKey}_${Date.now()}`,
  "notes":{
    firstName: firstName,
    lastName: lastName,
    email: email,
    membershipType: planKey,
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

  // single response: include the provider order, saved payment doc, and Razorpay keyId
  return res.status(201).json({
    message: "Order created",
    keyId: process.env.RAZORPAY_KEY,
    order,
    payment: paymentDoc.toJSON(),
  });
    }
    catch(err){
  console.log(err.message);
  res.status(400).json({message: "Payment order creation failed", error: err.message});
    }
})
module.exports=paymentrouter;