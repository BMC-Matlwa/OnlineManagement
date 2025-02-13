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

// Login.component -------------------------------------------------------------------------------------------
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
      const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key');
      res.status(200).json({
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
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
// Login.component end -------------------------------------------------------------------------------------------

//admin dashboard.component-------------------------------------------------------------
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products Order by name ASC');
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

app.post('/api/data', async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    // Insert new order into the database
    const insertQuery = `
      INSERT INTO products (name, description, price, stock)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;

    const client = await pool.connect();
    const result = await client.query(insertQuery, [name, description, price, stock]);

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
  const { name, description, price, stock } = req.body;

  const updateQuery = `
    UPDATE products 
    SET name = $1, description = $2, price = $3, stock = $4
    WHERE id = $5 
    RETURNING *`;

  try {
    const client = await pool.connect();
    const result = await client.query(updateQuery, [name, description, price, stock, id]);

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

  const deleteQuery = 'DELETE FROM products WHERE id = $1 RETURNING *';

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

//admin dashboard.component end-------------------------------------------------------------


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

//Orders Table -----------------------------------------------------------------------------------------------------

// Place an order (User)
app.post('/api/place-order', async (req, res) => {
  const { productId, quantity, status, userId } = req.body;
  try {
    const client = await pool.connect();

    // Check stock availability
    const productResult = await client.query('SELECT stock FROM products WHERE id = $1', [productId]);
    const availableStock = productResult.rows[0].stock;

    if (availableStock >= quantity) {
      // Insert order into orders table
      await client.query(
        `INSERT INTO orders (product_id, quantity, status, user_id) VALUES ($1, $2, $3, $4)`,
        [productId, quantity, status, userId]
      );

      // Subtract the quantity from the product stock
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, productId]);

      res.status(200).json({ message: 'Order placed and stock updated successfully' });
    } else {
      res.status(400).json({ message: 'Insufficient stock' });
    }

    client.release();
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch all orders (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.order_date ASC;');
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const client = await pool.connect();
    const updateQuery = `
      UPDATE orders SET status = $1 WHERE id = $2 RETURNING *;
    `;
    const result = await client.query(updateQuery, [status, id]);

    client.release();
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update order status (Admin)
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, productName, quantity, price } = req.body;  // Receive these values from the frontend
    const orderDate = new Date();  // Generate current order date
    const status = 'Processing';   // Default status

    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO orders (user_id, product_name, quantity, price, order_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await client.query(insertQuery, [userId, productName, quantity, price, orderDate, status]);

    client.release();
    res.status(201).json({ message: 'Order placed successfully', order: result.rows[0] });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => { //for viewing orders according to roles
  const { userId } = req.params;

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM orders WHERE user_id = $1'; // Fetch orders by user_id
    const result = await client.query(query, [userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching orders for user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Table orders end ------------------------------------------------------------------------------------------

//Products table -------------------------------------------------------------------------------------------

// Backend route to fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM products';
    const result = await client.query(query);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const client = await pool.connect();
    const updateQuery = `UPDATE products SET stock = $1 WHERE id = $2`;
    await client.query(updateQuery, [stock, id]);
    client.release();
    res.status(200).json({ message: 'Product stock updated successfully' });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/productsData', async (req, res) => {
  const { name, description, price, stock } = req.body;

  if (!name || !description || price == null || stock == null) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO products (name, description, price, stock)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(insertQuery, [name, description, price, stock]);
      res.status(201).json({
        message: 'Product added successfully',
        product: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/api/products/name/:productName', async (req, res) => {
  const { productName } = req.params;

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM products WHERE name = $1';  // Using parameterized query to prevent SQL injection
    const result = await client.query(query, [productName]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(result.rows[0]);  // Return the first matched product (assuming name is unique)
  } catch (error) {
    console.error('Error fetching product by name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//Products table end-------------------------------------------------------------------------------------------

//register.component
app.use(bodyParser.json()); 

const ADMIN_KEY = 'adminKey123';  // Replace with a secure key

app.post('/api/register', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { name, email, password, role, key } = req.body;

    if (!role) {
      console.error('Role is missing!');
    }

    const client = await pool.connect();

    let assignedRole = 'user'; // Default role is 'user'

    // Check if the provided key matches the admin key
    if (role === 'admin' && key === ADMIN_KEY) {
      assignedRole = 'admin';
    }

    const insertQuery = `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;

    const result = await client.query(insertQuery, [name, email, password, assignedRole]);

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

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, key } = req.body;
    const client = await pool.connect();

    let assignedRole = 'user'; // Default role is 'user'

    // Check if the provided key matches the admin key
    if (role === 'admin' && key === ADMIN_KEY) {
      assignedRole = 'admin';
    }
    // Insert and return the inserted user
    // Force role to be user
    const insertQuery = `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
    
    const result = await client.query(insertQuery, [name, email, password,assignedRole]);

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
