// server.js (Backend)
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'OnlineOrder',
    password: '_Bontle146',
    port: 5433
});

// Debugging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

app.use(express.json());

// Login.component
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await pool.connect();

    // Query the database to find the user by email
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [email]);

    client.release();

    if (result.rows.length === 0) {
      // User not found
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Verify the password (replace this with password hashing if using bcrypt)
    if (user.password === password) {
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//dashboard.component
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Error fetching data from PostgreSQL');
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const { user_id, product_name, quantity, price, order_date } = req.body;

    // Insert new order into the database
    const insertQuery = `
      INSERT INTO orders (user_id, product_name, quantity, price, order_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;

    const client = await pool.connect();
    const result = await client.query(insertQuery, [user_id, product_name, quantity, price, order_date]);

    client.release();

    // Send the added order back as the response
    res.status(201).json({
      message: 'Order added successfully',
      order: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const { product_name, quantity, price, order_date } = req.body;

  const updateQuery = `
    UPDATE orders 
    SET product_name = $1, quantity = $2, price = $3, order_date = $4
    WHERE id = $5 
    RETURNING *`;

  try {
    const client = await pool.connect();
    const result = await client.query(updateQuery, [product_name, quantity, price, order_date, id]);

    client.release();

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); // Return updated item
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/data/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM orders WHERE id = $1 RETURNING *';

  try {
    const client = await pool.connect();
    const result = await client.query(deleteQuery, [id]);

    client.release();

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/data', async (req, res) => {
 
    const { user_id, product_name, quantity, price, order_date } = req.body;

    // Insert new order into the database
    const insertQuery = `
      INSERT INTO orders (user_id, product_name, quantity, price, order_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    try {
    const client = await pool.connect();
    const result = await client.query(insertQuery, [user_id, product_name, quantity, price, order_date]);

    client.release();

    // Send the added order back as the response
    // res.status(201).json({
    //   message: 'Order added successfully',
    //   order: result.rows[0],
    // });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch user info by userId
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();

    // Query the database to find the user by id
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await client.query(query, [id]);

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result.rows[0]);  // Respond with the user data
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.put('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const { product_name, quantity, price, order_date } = req.body;

  const updateQuery = `
    UPDATE orders 
    SET product_name = $1, quantity = $2, price = $3, order_date = $4
    WHERE id = $5 
    RETURNING *`;

  try {
    const client = await pool.connect();
    const result = await client.query(updateQuery, [product_name, quantity, price, order_date, id]);

    client.release();

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); // Return updated item
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/data/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM orders WHERE id = $1 RETURNING *';

  try {
    const client = await pool.connect();
    const result = await client.query(deleteQuery, [id]);

    client.release();

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//register.component
app.use(bodyParser.json()); 

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const client = await pool.connect();

    // Insert and return the inserted user
    const insertQuery = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
    
    const result = await client.query(insertQuery, [name, email, password]);

    client.release();

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Start Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
