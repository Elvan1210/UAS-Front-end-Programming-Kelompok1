const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("Koneksi ke MongoDB (Kantin_UAS) berhasil!");
});

const akunRouter = require('./routes/akun');
const menuRouter = require('./routes/menu');

app.get('/', (req, res) => {
  res.json({ message: "Halo! Server Backend Kasir berjalan!" });
});

app.use('/akun', akunRouter);
app.use('/menu', menuRouter);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});