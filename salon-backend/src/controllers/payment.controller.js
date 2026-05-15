import path from 'path';
import fs from 'fs';
import Appointment from '../models/Appointment.js';
import Salon from '../models/Salon.js';
import AppError from '../../errors/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { generateInvoicePDF } from '../helpers/invoice.helper.js';
import { uploadToImageKit } from '../middlewares/upload.middleware.js';

export const getQRCode = asyncHandler(async (req, res) => {
  const salon = await Salon.findById(req.params.salonId).select('qrImage name');
  if (!salon) throw new AppError('Salon not found', 404);
  success(res, 'QR fetched', { qrImage: salon.qrImage, salonName: salon.name });
});

export const confirmCashPayment = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const appt = await Appointment.findOne({ _id: req.params.id, salon: salon._id })
    .populate('services', 'name price discountPrice duration')
    .populate('customer', 'name email');
  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.paymentStatus === 'paid') throw new AppError('Already paid', 400);

  appt.tipAmount = req.body.tipAmount || 0;
  appt.paymentStatus = 'paid';
  appt.status = 'completed';

  const tmpPath = path.join('/tmp', `invoice_${appt._id}.pdf`);
  await generateInvoicePDF(appt, tmpPath);
  const fileBuffer = fs.readFileSync(tmpPath);
  const { url } = await uploadToImageKit(
    { buffer: fileBuffer, originalname: `invoice_${appt._id}.pdf`, mimetype: 'application/pdf' },
    'invoices'
  );
  fs.unlinkSync(tmpPath);

  appt.invoiceUrl = url;
  await appt.save();

  success(res, 'Payment confirmed and invoice generated', { invoiceUrl: url });
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    customer: req.user._id,
    paymentStatus: { $in: ['paid', 'partially_paid', 'refunded'] },
  })
    .select('totalAmount paymentMethod paymentStatus date invoiceUrl tipAmount discountAmount createdAt salon')
    .populate('salon', 'name images')
    .sort({ date: -1 });
  success(res, 'Payment history fetched', appointments);
});

export const addTip = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  const appt = await Appointment.findOne({ _id: req.params.id, salon: salon?._id });
  if (!appt) throw new AppError('Appointment not found', 404);
  appt.tipAmount = req.body.tipAmount || 0;
  await appt.save();
  success(res, 'Tip updated', { tipAmount: appt.tipAmount });
});
