// src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
// If userRoutes not ready, export placeholder to avoid crash
let userRoutes;
try { userRoutes = require('./userRoutes'); } catch (e) { userRoutes = express.Router().get('/', (req,res)=>res.json({msg:'users route placeholder'})); }
let productRoutes;
try { productRoutes = require('./productRoutes'); } catch (e) { productRoutes = express.Router().get('/', (req,res)=>res.json({msg:'products route placeholder'})); }
let orderRoutes;
try { orderRoutes = require('./orderRoutes'); } catch (e) { orderRoutes = express.Router().get('/', (req,res)=>res.json({msg:'orders route placeholder'})); }

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

router.use((req, res) => res.status(404).json({ success: false, message: 'API endpoint not found', path: req.originalUrl }));

module.exports = router;
