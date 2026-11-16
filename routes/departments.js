const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/departments รายชื่อแผนกทั้งหมด
router.get('/', async (req, res) => {
const [rows] = await db.query('SELECT id, name FROM departments ORDER BY id');

res.json({
status: 'success',
message: 'พบ ' + rows.length + ' แผนก',
data: rows
});
});
// POST /api/departments เพิ่มแผนก body: { "name": "..." }
router.post('/', async (req, res) => {
  const name = req.body.name;
 
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกชื่อแผนก', data: null });
  }
 
  try {
    const [result] = await db.query('INSERT INTO departments (name) VALUES (?)', [name]);
    res.status(201).json({
      status: 'success',
      message: 'เพิ่มแผนกแล้ว',
      data: { id: result.insertId, name: name }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'มีแผนกชื่อ ' + name + ' แล้ว', data: null });
    }
    throw err;
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกชื่อแผนก', data: null });
  }

  try {
    const [result] = await db.query('UPDATE departments SET name = ? WHERE id = ?', [name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'ไม่พบแผนก id ' + id, data: null });
    }

    res.status(200).json({
      status: 'success',
      message: 'แก้ไขแผนกแล้ว',
      data: { id: id, name: name }
    });
  } catch (err) {
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'มีแผนกชื่อ ' + name + ' แล้ว', data: null });
    }
    throw err;
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  const [rows] = await db.query('SELECT COUNT(*) AS total FROM users WHERE department_id = ?', [id]);
  const totalUsers = rows[0].total;

  if (totalUsers > 0) {
    return res.status(409).json({
      status: 'error',
      message: 'ลบไม่ได้ แผนกนี้ยังมีบุคลากร ' + totalUsers + ' คน',
      data: null
    });
  }

  const [result] = await db.query('DELETE FROM departments WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'ไม่พบแผนก id ' + id,
      data: null
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'ลบแผนกแล้ว',
    data: null
  });
});



module.exports = router;