import crypto from 'crypto';
import axios from 'axios';
import { query } from '../config/database.js';

// POST /api/payment/initiate
export const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (!orderResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];
    const transactionUuid = `${order.order_number}-${Date.now()}`;
    const amount = parseFloat(order.total_amount);
    const taxAmount = 0;
    const totalAmount = amount;
    const productCode = process.env.ESEWA_MERCHANT_CODE;

    // Generate signature
    const signatureString =
      `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

    const signature = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(signatureString)
      .digest('base64');

    // Save transaction uuid to order
    await query(
      'UPDATE orders SET esewa_transaction_uuid = $1 WHERE id = $2',
      [transactionUuid, order.id]
    );

    res.json({
      success: true,
      paymentData: {
        amount: amount.toString(),
        tax_amount: taxAmount.toString(),
        total_amount: totalAmount.toString(),
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: process.env.ESEWA_SUCCESS_URL,
        failure_url: process.env.ESEWA_FAILURE_URL,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature
      },
      esewaUrl: `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/form`
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Payment data required'
      });
    }

    // Decode base64 data from eSewa
    const decodedData = JSON.parse(
      Buffer.from(data, 'base64').toString('utf-8')
    );

    const {
      transaction_uuid,
      total_amount,
      status,
      signed_field_names,
      signature
    } = decodedData;

    // Verify signature
    const productCode = process.env.ESEWA_MERCHANT_CODE;
    const signatureString =
      `transaction_code=${decodedData.transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${productCode},signed_field_names=${signed_field_names}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(signatureString)
      .digest('base64');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    if (status !== 'COMPLETE') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Find order by transaction uuid
    const orderResult = await query(
      'SELECT * FROM orders WHERE esewa_transaction_uuid = $1',
      [transaction_uuid]
    );

    if (!orderResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Update order payment status
    await query(
      `UPDATE orders SET
        payment_status = 'paid',
        status = 'confirmed',
        payment_reference = $1
       WHERE id = $2`,
      [decodedData.transaction_code, order.id]
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: 'confirmed',
        paymentStatus: 'paid'
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/payment/status/:orderId
export const getPaymentStatus = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, order_number, status, payment_status,
              total_amount, esewa_transaction_uuid
       FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.orderId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({ success: true, payment: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};