/**
 * Demo Data Seeder
 *
 * Usage:
 *   npm run seed          → create demo data
 *   npm run seed:clean    → delete all demo data
 *
 * All demo records are tagged with demoSeed: true (via User.demoSeed) or
 * traced back to the demo owner/customer ObjectIds stored in seed-meta.json.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const META_FILE = path.join(__dirname, 'seed-meta.json');

// ── Models ────────────────────────────────────────────────────────────────────
import User from '../models/User.js';
import Salon from '../models/Salon.js';
import Service from '../models/Service.js';
import Staff from '../models/Staff.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import LoyaltyTransaction from '../models/LoyaltyTransaction.js';
import ChatMessage from '../models/ChatMessage.js';
import Offer from '../models/Offer.js';
import { MembershipPlan } from '../models/Membership.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
// Plain text — User model's pre-save hook will bcrypt it
const DEMO_PASSWORD = 'Demo@1234';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ── Connect ───────────────────────────────────────────────────────────────────
async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ MongoDB connected');
}

// ── SEED ──────────────────────────────────────────────────────────────────────
async function seed() {
  await connect();

  if (fs.existsSync(META_FILE)) {
    console.log('⚠  Demo data already exists. Run `npm run seed:clean` first, or delete seed-meta.json to force re-seed.');
    process.exit(0);
  }

  console.log('\n🌱  Seeding demo data…\n');

  // 1. Users
  const owner = await User.create({
    name: 'Demo Owner',
    email: 'demo.owner@salon.test',
    phone: '9000000001',
    passwordHash: DEMO_PASSWORD,
    role: 'salon_owner',
    isVerified: true,
  });

  const customer = await User.create({
    name: 'Demo Customer',
    email: 'demo.customer@salon.test',
    phone: '9000000002',
    passwordHash: DEMO_PASSWORD,
    role: 'customer',
    isVerified: true,
    loyaltyPoints: 150,
    walletBalance: 200,
  });

  console.log('  ✓ Users created');
  console.log('    Owner    → demo.owner@salon.test     / Demo@1234');
  console.log('    Customer → demo.customer@salon.test  / Demo@1234');

  // 2. Salon
  const salon = await Salon.create({
    owner: owner._id,
    name: 'Demo Luxury Salon',
    description: 'A full-service premium salon offering haircuts, spa, and beauty treatments.',
    category: 'unisex',
    images: [
      { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600', fileId: 'demo1' },
      { url: 'https://images.unsplash.com/photo-1580618864194-0fb637e8b7fd?w=600', fileId: 'demo2' },
    ],
    location: {
      address: '42 MG Road, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { type: 'Point', coordinates: [77.2090, 28.6139] },
    },
    businessHours: [
      { day: 'monday',    open: '09:00', close: '20:00', isClosed: false },
      { day: 'tuesday',   open: '09:00', close: '20:00', isClosed: false },
      { day: 'wednesday', open: '09:00', close: '20:00', isClosed: false },
      { day: 'thursday',  open: '09:00', close: '20:00', isClosed: false },
      { day: 'friday',    open: '09:00', close: '21:00', isClosed: false },
      { day: 'saturday',  open: '10:00', close: '21:00', isClosed: false },
      { day: 'sunday',    open: '11:00', close: '18:00', isClosed: false },
    ],
    slotDuration: 30,
    bufferTime: 10,
    chairs: [{ name: 'Chair 1' }, { name: 'Chair 2' }, { name: 'Chair 3' }],
    averageRating: 4.5,
    totalReviews: 3,
    isApproved: true,
    isActive: true,
  });

  console.log('  ✓ Salon created:', salon.name);

  // 3. Services
  const services = await Service.insertMany([
    { salon: salon._id, name: 'Haircut (Men)',      category: 'Hair',   duration: 30, price: 299,  discountPrice: 249 },
    { salon: salon._id, name: 'Haircut (Women)',    category: 'Hair',   duration: 60, price: 499,  discountPrice: 399 },
    { salon: salon._id, name: 'Beard Trim',         category: 'Hair',   duration: 20, price: 149,  discountPrice: null },
    { salon: salon._id, name: 'Hair Color',         category: 'Color',  duration: 90, price: 1499, discountPrice: 1199 },
    { salon: salon._id, name: 'Facial',             category: 'Skin',   duration: 60, price: 799,  discountPrice: 649 },
    { salon: salon._id, name: 'Head Massage',       category: 'Spa',    duration: 30, price: 399,  discountPrice: null },
    { salon: salon._id, name: 'Manicure',           category: 'Nails',  duration: 45, price: 499,  discountPrice: 399 },
    { salon: salon._id, name: 'Full Body Waxing',   category: 'Waxing', duration: 60, price: 999,  discountPrice: 849 },
  ]);

  console.log('  ✓ Services created:', services.length);

  // 4. Staff
  const staff = await Staff.insertMany([
    {
      salon: salon._id,
      name: 'Ravi Kumar',
      phone: '9111111111',
      services: [services[0]._id, services[2]._id, services[5]._id],
      workingHours: ['monday','tuesday','wednesday','thursday','friday'].map(d => ({ day: d, start: '09:00', end: '18:00', isOff: false })),
      averageRating: 4.7,
    },
    {
      salon: salon._id,
      name: 'Priya Sharma',
      phone: '9222222222',
      services: [services[1]._id, services[3]._id, services[4]._id, services[6]._id, services[7]._id],
      workingHours: ['tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => ({ day: d, start: '10:00', end: '20:00', isOff: false })),
      averageRating: 4.8,
    },
  ]);

  console.log('  ✓ Staff created:', staff.length);

  // 5. Appointments
  const appt1 = await Appointment.create({
    customer: customer._id,
    salon: salon._id,
    staff: staff[0]._id,
    services: [services[0]._id, services[2]._id],
    date: daysAgo(10),
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    totalAmount: 448,
    taxAmount: 0,
  });

  const appt2 = await Appointment.create({
    customer: customer._id,
    salon: salon._id,
    staff: staff[1]._id,
    services: [services[4]._id],
    date: daysAgo(3),
    startTime: '14:00',
    endTime: '15:00',
    status: 'completed',
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    totalAmount: 649,
    taxAmount: 0,
  });

  const appt3 = await Appointment.create({
    customer: customer._id,
    salon: salon._id,
    staff: staff[1]._id,
    services: [services[1]._id, services[6]._id],
    date: daysFromNow(2),
    startTime: '11:00',
    endTime: '13:00',
    status: 'confirmed',
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    totalAmount: 798,
    taxAmount: 0,
  });

  console.log('  ✓ Appointments created: 3 (2 completed, 1 upcoming)');

  // 6. Reviews
  await Review.insertMany([
    {
      customer: customer._id,
      salon: salon._id,
      staff: staff[0]._id,
      appointment: appt1._id,
      salonRating: 5,
      staffRating: 5,
      serviceRating: 4,
      comment: 'Excellent service! Ravi is very skilled. The salon is clean and welcoming.',
    },
    {
      customer: customer._id,
      salon: salon._id,
      staff: staff[1]._id,
      appointment: appt2._id,
      salonRating: 4,
      staffRating: 5,
      serviceRating: 5,
      comment: 'Priya did an amazing facial. My skin feels so refreshed!',
    },
  ]);

  console.log('  ✓ Reviews created: 2');

  // 7. Loyalty Transactions
  await LoyaltyTransaction.insertMany([
    {
      user: customer._id,
      appointment: appt1._id,
      type: 'earned',
      points: 45,
      balance: 45,
      description: 'Points earned on booking #1',
    },
    {
      user: customer._id,
      appointment: appt2._id,
      type: 'earned',
      points: 65,
      balance: 110,
      description: 'Points earned on booking #2',
    },
    {
      user: customer._id,
      type: 'adjusted',
      points: 40,
      balance: 150,
      description: 'Welcome bonus points',
    },
  ]);

  console.log('  ✓ Loyalty transactions created: 3');

  // 8. Chat Messages
  const chatMsgs = [
    { salon: salon._id, customer: customer._id, senderRole: 'customer',    message: 'Hi! Do you have availability this Saturday afternoon?' },
    { salon: salon._id, customer: customer._id, senderRole: 'salon_owner', message: 'Yes, we have slots at 2:00 PM, 3:00 PM and 4:00 PM. Which works for you?' },
    { salon: salon._id, customer: customer._id, senderRole: 'customer',    message: '3 PM would be perfect. Can I book a haircut and manicure?' },
    { salon: salon._id, customer: customer._id, senderRole: 'salon_owner', message: 'Absolutely! Please book via the app and choose Priya as your stylist.' },
    { salon: salon._id, customer: customer._id, senderRole: 'customer',    message: 'Done! Thank you so much.' },
  ];

  for (let i = 0; i < chatMsgs.length; i++) {
    const created = new Date();
    created.setMinutes(created.getMinutes() - (chatMsgs.length - i) * 3);
    await ChatMessage.create({ ...chatMsgs[i], createdAt: created, updatedAt: created });
  }

  console.log('  ✓ Chat messages created: 5');

  // 9. Coupon / Offer
  await Offer.create({
    code: 'DEMO20',
    description: '20% off on all services (demo coupon)',
    type: 'percent',
    value: 20,
    minOrderValue: 300,
    maxDiscount: 500,
    usageLimit: 100,
    perUserLimit: 1,
    validFrom: daysAgo(30),
    validTo: daysFromNow(30),
    applicableTo: 'all',
    isActive: true,
  });

  console.log('  ✓ Coupon created: DEMO20 (20% off, min ₹300, max ₹500)');

  // 10. Membership Plan
  await MembershipPlan.create({
    name: 'Demo Gold Plan',
    description: 'Get 20% off on all services, 2x loyalty points, and priority booking.',
    durationDays: 30,
    price: 999,
    discountPercent: 20,
    loyaltyMultiplier: 2,
    features: ['20% off all services', '2x loyalty points', 'Priority slot booking', 'Free head massage monthly'],
    isActive: true,
  });

  console.log('  ✓ Membership plan created: Demo Gold Plan (₹999/30 days)');

  // 11. Save meta for cleanup
  const meta = {
    createdAt: new Date().toISOString(),
    userIds: [owner._id, customer._id],
    salonId: salon._id,
    serviceIds: services.map(s => s._id),
    staffIds: staff.map(s => s._id),
    appointmentIds: [appt1._id, appt2._id, appt3._id],
  };

  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));

  console.log('\n✅  Demo data seeded successfully!');
  console.log('\n📋  Login credentials:');
  console.log('   Customer  →  demo.customer@salon.test  /  Demo@1234');
  console.log('   Owner     →  demo.owner@salon.test     /  Demo@1234');
  console.log('\n🎟   Coupon code: DEMO20');
  console.log('\n🗑   To remove all demo data: npm run seed:clean\n');

  await mongoose.disconnect();
}

// ── CLEAN ─────────────────────────────────────────────────────────────────────
async function clean() {
  await connect();

  if (!fs.existsSync(META_FILE)) {
    console.log('⚠  No demo data found (seed-meta.json missing). Nothing to clean.');
    process.exit(0);
  }

  const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  const {
    userIds = [],
    salonId,
    serviceIds = [],
    staffIds = [],
    appointmentIds = [],
  } = meta;

  console.log('\n🗑   Cleaning demo data…\n');

  const r = await Promise.all([
    Review.deleteMany({ appointment: { $in: appointmentIds } }),
    LoyaltyTransaction.deleteMany({ user: { $in: userIds } }),
    ChatMessage.deleteMany({ salon: salonId }),
    Offer.deleteOne({ code: 'DEMO20' }),
    Appointment.deleteMany({ _id: { $in: appointmentIds } }),
    Staff.deleteMany({ _id: { $in: staffIds } }),
    Service.deleteMany({ _id: { $in: serviceIds } }),
    Salon.deleteOne({ _id: salonId }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);

  // Membership plan cleanup
  const planDel = await MembershipPlan.deleteOne({ name: 'Demo Gold Plan' });
  console.log('  ✓ Membership plan deleted:', planDel.deletedCount);

  console.log('  ✓ Reviews deleted:', r[0].deletedCount);
  console.log('  ✓ Loyalty transactions deleted:', r[1].deletedCount);
  console.log('  ✓ Chat messages deleted:', r[2].deletedCount);
  console.log('  ✓ Offer deleted:', r[3].deletedCount);
  console.log('  ✓ Appointments deleted:', r[4].deletedCount);
  console.log('  ✓ Staff deleted:', r[5].deletedCount);
  console.log('  ✓ Services deleted:', r[6].deletedCount);
  console.log('  ✓ Salon deleted:', r[7].deletedCount);
  console.log('  ✓ Users deleted:', r[8].deletedCount);

  fs.unlinkSync(META_FILE);

  console.log('\n✅  All demo data removed.\n');

  await mongoose.disconnect();
}

// ── Entry ─────────────────────────────────────────────────────────────────────
const mode = process.argv[2];

if (mode === 'clean') {
  clean().catch(err => { console.error(err); process.exit(1); });
} else {
  seed().catch(err => { console.error(err); process.exit(1); });
}
