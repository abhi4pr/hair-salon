const path = require('path');
const fs = require('fs');
const Appointment = require('../models/Appointment');
const Salon = require('../models/Salon');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { generateInvoicePDF } = require('../helpers/invoice.helper');
const { uploadToImageKit } = require('../middlewares/upload.middleware');

exports.getQRCode = asyncHandler(async (req, res) => {
  const salon = await Salon.findById(req.params.salonId).select('qrImage name');
  if (!salon) throw new AppError('Salon not found', 404);
  success(res, 'QR fetched', { qrImage: salon.qrImage, salonName: salon.name });
});

exports.confirmCashPayment = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const appt = await Appointment.findOne({ _id: req.params.id, salon: salon._id })
    .populate('services', 'name price discountPrice duration')
    .populate('customer', 'name email');

  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.paymentStatus === 'paid') throw new AppError('Already paid', 400);

  const { tipAmount = 0 } = req.body;
  appt.tipAmount = tipAmount;
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

exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    customer: req.user._id,
    paymentStatus: { $in: ['paid', 'partially_paid', 'refunded'] },
  })
    .select('totalAmount paymentMethod paymentStatus date invoiceUrl tipAmount discountAmount')
    .sort({ date: -1 });

  success(res, 'Payment history fetched', appointments);
});

exports.addTip = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  const appt = await Appointment.findOne({ _id: req.params.id, salon: salon?._id });
  if (!appt) throw new AppError('Appointment not found', 404);
  appt.tipAmount = req.body.tipAmount || 0;
  await appt.save();
  success(res, 'Tip updated', { tipAmount: appt.tipAmount });
});
