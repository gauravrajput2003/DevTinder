const express=require("express");
const { userAuth } = require("../middlewares/Auth");
const paymentrouter=express.Router();
const razorpayInstance=require("../utils/razorpay")
const Payment = require("../models/payment");
const User=require("../models/user");
const { memberShipAmount } = require("../utils/constant");
const { validateWebhookSignature, validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
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
});

// Dedicated webhook handler (to be mounted with express.raw in app.js)
async function webhookHandler(req, res){
  try{
    const signature = req.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if(!signature){
      return res.status(400).json({ msg: "Missing webhook signature" });
    }
    if(!secret){
      return res.status(500).json({ msg: "Webhook secret not configured" });
    }

    // Razorpay requires the exact raw body string for signature verification
    let rawBody;
    if(Buffer.isBuffer(req.body)) rawBody = req.body.toString('utf8');
    else if(typeof req.body === 'string') rawBody = req.body;
    else rawBody = JSON.stringify(req.body || {});

    const isValid = validateWebhookSignature(rawBody, signature, secret);
    if(!isValid){
      return res.status(400).json({ msg: "webhook signature is invalid" });
    }

    // Parse body for processing
    let bodyObj = req.body;
    if(Buffer.isBuffer(bodyObj) || typeof bodyObj === 'string'){
      try { bodyObj = JSON.parse(rawBody); } catch(_e){
        return res.status(400).json({ msg: "Invalid JSON payload" });
      }
    }

    const event = bodyObj?.event || '';
    const paymentEntity = bodyObj?.payload?.payment?.entity;

    if(!paymentEntity){
      // Not a payment.* event we care about; ack anyway
      return res.status(200).json({ msg: "webhook received (ignored)" });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;
    const providerStatus = paymentEntity.status; // e.g., 'captured', 'failed', 'authorized'

    if(!orderId){
      return res.status(200).json({ msg: "webhook received (no order id)" });
    }

    const paymentDoc = await Payment.findOne({ orderId });
    if(!paymentDoc){
      // No matching order in our DB; ack to avoid retries but log server-side
      console.warn(`[Webhook] Payment doc not found for order ${orderId}`);
      return res.status(200).json({ msg: "ok" });
    }

    // Map provider status to our model status
    let mappedStatus = paymentDoc.status;
    if(providerStatus === 'captured') mappedStatus = 'paid';
    else if(providerStatus === 'failed') mappedStatus = 'failed';
    else if(providerStatus === 'authorized' || providerStatus === 'created') mappedStatus = 'attempted';

    // Idempotency: only update if changed
    paymentDoc.paymentId = paymentId || paymentDoc.paymentId;
    paymentDoc.status = mappedStatus;
    await paymentDoc.save();

    // On success, upgrade user to premium
    if(mappedStatus === 'paid'){
      const userDoc = await User.findById(paymentDoc.userId);
      if(userDoc){
        userDoc.isPremium = true;
        // Note schema uses memberShipType
        userDoc.memberShipType = paymentDoc?.notes?.membershipType || userDoc.memberShipType;
        await userDoc.save();
      }
    }

    return res.status(200).json({ msg: "webhook received successfully" });
  } catch(err){
    console.error('[Webhook] Error:', err);
    return res.status(500).json({ msg: err.message });
  }
}

// Expose handler for app-level raw route mounting
paymentrouter.webhookHandler = webhookHandler;

// Optional: helpful GET response so browser hits don't show 404
paymentrouter.get("/payment/webhook", (req, res) => {
  res.status(405).send("Webhook endpoint is alive. Use POST from Razorpay.");
});

// Fallback verification endpoint (frontend calls this on success callback)
paymentrouter.post("/payment/verify", userAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing verification fields" });
    }

    const valid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_SECRET
    );
    if (!valid) return res.status(400).json({ message: "Invalid payment signature" });

    const paymentDoc = await Payment.findOne({ orderId: razorpay_order_id });
    if (!paymentDoc) return res.status(404).json({ message: "Order not found" });

    // Update payment
    paymentDoc.paymentId = razorpay_payment_id;
    paymentDoc.status = 'paid';
    await paymentDoc.save();

    // Upgrade user
    const userDoc = await User.findById(paymentDoc.userId);
    if (userDoc) {
      userDoc.isPremium = true;
      userDoc.memberShipType = paymentDoc?.notes?.membershipType || userDoc.memberShipType;
      await userDoc.save();
    }

    return res.status(200).json({ message: "Payment verified and user upgraded" });
  } catch (err) {
    console.error('[Verify] Error:', err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports=paymentrouter;