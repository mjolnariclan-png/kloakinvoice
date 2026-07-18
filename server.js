const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'uploads');
const ordersFile = path.join(__dirname, 'orders.json');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadOrders() {
  if (!fs.existsSync(ordersFile)) {
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  } catch (error) {
    return [];
  }
}

function saveOrder(order) {
  const orders = loadOrders();
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

async function sendOrderEmail(order) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('Email not configured. Order saved locally only.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const mail = {
    from: SMTP_USER,
    to: EMAIL_TO || SMTP_USER,
    subject: `New Viking print order from ${order.name}`,
    html: `
      <h2>New print order received</h2>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
      <p><strong>Service:</strong> ${order.service}</p>
      <p><strong>Deadline:</strong> ${order.deadline || 'Flexible'}</p>
      <p><strong>Notes:</strong> ${order.notes || 'No notes'}</p>
      <p><strong>Venmo:</strong> ${order.venmoHandle || 'Not provided'}</p>
      <p><strong>Files attached:</strong> ${order.files.length > 0 ? order.files.join(', ') : 'None'}</p>
    `
  };

  await transporter.sendMail(mail);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/order', upload.array('files', 10), async (req, res) => {
  const order = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    service: req.body.service,
    deadline: req.body.deadline,
    notes: req.body.notes,
    venmoHandle: req.body.venmoHandle,
    files: (req.files || []).map(file => file.filename),
    createdAt: new Date().toISOString()
  };

  saveOrder(order);

  try {
    await sendOrderEmail(order);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }

  res.json({ success: true, message: 'Your order has been received. Expect a reply with pricing and pickup details soon.' });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kloa invoice site running at http://localhost:${PORT}`);
});
