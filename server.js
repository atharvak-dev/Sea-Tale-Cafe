const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Data files
const dataDir = './data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const loadData = (file) => {
  try {
    return JSON.parse(fs.readFileSync(`${dataDir}/${file}`, 'utf8'));
  } catch {
    return [];
  }
};

const saveData = (file, data) => {
  fs.writeFileSync(`${dataDir}/${file}`, JSON.stringify(data, null, 2));
};

// Routes
app.get('/api/dishes', (req, res) => {
  res.json(loadData('dishes.json'));
});

app.post('/api/dishes', (req, res) => {
  const dishes = loadData('dishes.json');
  const dish = { id: Date.now(), ...req.body };
  dishes.push(dish);
  saveData('dishes.json', dishes);
  res.json(dish);
});

app.put('/api/dishes/:id', (req, res) => {
  const dishes = loadData('dishes.json');
  const index = dishes.findIndex(d => d.id == req.params.id);
  if (index !== -1) {
    dishes[index] = { ...dishes[index], ...req.body };
    saveData('dishes.json', dishes);
    res.json(dishes[index]);
  } else {
    res.status(404).json({ error: 'Dish not found' });
  }
});

app.post('/api/orders', (req, res) => {
  const orders = loadData('orders.json');
  const order = { 
    id: Date.now(), 
    ...req.body, 
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  orders.push(order);
  saveData('orders.json', orders);
  res.json(order);
});

app.get('/api/orders', (req, res) => {
  res.json(loadData('orders.json'));
});

app.put('/api/orders/:id/approve', (req, res) => {
  const orders = loadData('orders.json');
  const index = orders.findIndex(o => o.id == req.params.id);
  if (index !== -1) {
    orders[index].status = 'approved';
    orders[index].billAmount = req.body.billAmount;
    saveData('orders.json', orders);
    res.json(orders[index]);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.post('/api/tables', (req, res) => {
  const tables = loadData('tables.json');
  const table = { id: Date.now(), ...req.body };
  
  // Generate QR code
  const qrData = `${req.headers.host}/customer?table=${table.id}`;
  QRCode.toDataURL(qrData, (err, url) => {
    if (err) return res.status(500).json({ error: 'QR generation failed' });
    table.qrCode = url;
    tables.push(table);
    saveData('tables.json', tables);
    res.json(table);
  });
});

app.get('/api/tables', (req, res) => {
  res.json(loadData('tables.json'));
});

app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/receptionist', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'receptionist.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});