// server.js (Backend)
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const sequelize = require("./src/app/models/db"); // Import Sequelize instance
const User = require("./src/app/models/user"); 
const router = express.Router();
const app = express();
const { transporter } = require("./src/app/emailService.js"); // Reuse transporter
const { sendWelcomeEmail } = require("./src/app/emailService.js"); //when a user registers, this imports the service used to send the email.
const { sendEmail } = require("./src/app/emailService.js"); //when a user purchases, this imports the service to send an email to user and Admin that order was received.
const { sendOrderConfirmationEmail } = require("./src/app/emailService.js"); 
const { sendEmailNotification } = require("./src/app/emailService.js"); 

const JWT_SECRET = 'your-secret-key';

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
app.use(cors());
app.use(bodyParser.json());
app.use(router);

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

   
    //  Detect if password is plain text (not hashed)
    if (!user.password.startsWith("$2b$")) { // bcrypt hashes always start with "$2a$"
      if (user.password === password) {
        // Hash the plain-text password and update it in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);
        console.log(`Password for ${email} was hashed and updated.`);
      } else {
        return res.status(401).json({ message: "Invalid password" });
      }
    } else {
      //  Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, role: user.role }, "secret_key");

      res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    // Verify the password old way (not hashed)
    // if (user.password === password) {
    //   const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key');
    //   res.status(200).json({
    //     message: 'Login successful',
    //     token: token,
    //     user: {
    //       id: user.id,
    //       name: user.name,
    //       email: user.email,
    //       role: user.role
    //     },
    //   });
    // } else {
    //   res.status(401).json({ message: 'Invalid password' });
    // }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//forgot password endpoint -------------------------------------------------------

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

  const resetLink = `http://localhost:4200/reset-password/${token}`;

  // Send the reset link via email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com', // Replace with your email
      pass: 'your-email-password'   // Replace with your email password
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email' });
    }
    res.json({ message: 'Password reset link sent to your email' });
  });
});



//reset password send email code ------------------------------------------------------------
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a token (valid for 1 hour)
    const token = jwt.sign({ email }, "your_jwt_secret", { expiresIn: "1h" });

    // Save token to the database
    await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [token, email]);

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "deviieydevendranath@gmail.com",
        pass: "kldu rwun zuyr wylt",
      },
    });

    
    const mailOptions = {
      from: "deviieydevendranath@gmail.com",
      to: email,
      subject: "BMC-Online Password Reset",
      html: `
      <p>Your request for password reset was succesful.</p>
      <p>Click the link to reset your password: <a href="http://localhost:4200/reset-password/${token}" style="color: blue; text-decoration: underline;">Reset Password</a></p>
      <p>Please ignore if you did not request for a reset. <p>
      <p>Regards, <br> BMC Online.</p>
      `,
    };
    console.log("Sending password reset email to:", email);

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent!" });

  } catch (error) {
    console.error("Error resetting password:", error);  // Log the error to console
    res.status(500).json({ message: "Server error", error: error.message });  // Send detailed error in response
  }
});

//reset for new user
router.post("/reset-NewUser", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userNew = userCheck.name;

    // Generate a token (valid for 1 hour)
    const token = jwt.sign({ email }, "your_jwt_secret", { expiresIn: "1h" });

    // Save token to the database
    await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [token, email]);

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "deviieydevendranath@gmail.com",
        pass: "kldu rwun zuyr wylt",
      },
    });

    const mailOptions = {
      from: "deviieydevendranath@gmail.com",
      to: email,
      subject: "New User Alert‼️",
      html: `
    <p>Good News!</p>
    <p>Admin has created an account for you with your email address as the username.</p>
    <p>To access your account, please click the link below to reset your password:</p>
    <p><a href="http://localhost:4200/reset-password/${token}" style="color: blue; text-decoration: underline;">Reset Password</a></p>
    <p>Regards,<br>BMC Online.</p>
  `,
    };
    console.log("Sending password reset email to:", email);

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent!" });

  } catch (error) {
    console.error("Error resetting password:", error);  // Log the error to console
    res.status(500).json({ message: "Server error", error: error.message });  // Send detailed error in response
  }
});

//reset password after receiving email api --------------------------------------------
router.post("/reset-password/confirm", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, "your_jwt_secret");

    // Retrieve the email from the decoded token
    const email = decoded.email;

    // Check if the token matches the one stored in the database
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].reset_token !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

    // Clear the reset token from the database (security measure)
    await pool.query("UPDATE users SET reset_token = NULL WHERE email = $1", [email]);

    res.json({ message: "Password updated successfully" });
    
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});




// update password------------------------------------------------
router.post("/update-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
          return res.status(400).json({ message: "Invalid token or user not found" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password reset successful!" });
  } catch (error) {
      res.status(400).json({ message: "Invalid or expired token" });
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
    const { name, description, price, stock, image_url } = req.body;

    // Insert new order into the database //not working on admin the one tha works is down there
    const insertQuery = `
      INSERT INTO products (name, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;

    const client = await pool.connect();
    const result = await client.query(insertQuery, [name, description, price, stock, image_url]);

    client.release();

    // Send the added order back as the response
    res.status(201).json({
      message: 'Product added successfully',
      order: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// app.put('/api/data/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, description, price, stock, image_url } = req.body;

//   const updateQuery = `
//     UPDATE products 
//     SET name = $1, description = $2, price = $3, stock = $4, image_url = $6
//     WHERE id = $5 
//     RETURNING *`;

//   try {
//     const client = await pool.connect();
//     const result = await client.query(updateQuery, [name, description, price, stock, image_url, id]);

//     await client.release();

//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows[0]); // Return updated item
//     } else {
//       res.status(404).json({ message: 'Order not found' });
//     }
//   } catch (error) {
//     console.error('Error updating order:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

app.put('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image_url } = req.body;

  const updateQuery = `
    UPDATE products 
    SET name = $1, description = $2, price = $3, stock = $4, image_url = $5
    WHERE id = $6 
    RETURNING *;
  `;

  try {
    const client = await pool.connect();
    const result = await client.query(updateQuery, [name, description, price, stock, image_url, id]);

    await client.release(); // Ensure the connection is properly released

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); // Return updated item
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
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

//user data --------------------------------------------------------------------
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

//ADD TO USERS TABLE
app.put('/api/users/:id', (req, res) => { //for user updating
  const userId = req.params.id;
  const { name, email, phone, address, gender, dob, province } = req.body;

  const query = `
    UPDATE users
    SET name = $1, email = $2, phone = $3, address = $4, gender = $5, dob = $6, province = $8
    WHERE id = $7
  `;
  const values = [name, email, phone, address, gender, dob, userId, province];

  pool.query(query, values)
  .then(() => res.json({ message: 'User details updated successfully' }))  // Return a JSON response
  .catch((error) => {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Error updating user details' });
  });
});

app.put('/api/user/:id', async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging
    console.log("User ID:", req.params.id); // Debugging

    const userId = req.params.id;
    // const updated_by = req.user?.id; 
    
    console.log("Changed role's userId:", userId);
    
    
    const { name, email, phone, address, gender, dob, role, created_by, updated_by } = req.body; 
    console.log("Admin's userId:", created_by); //using the id read on the table. wrong!
    console.log("Updated by'S userId:", updated_by);
    
    if (!updated_by) {
      return res.status(403).json({ error: "Missing updated_by (logged-in user ID)"  });
    }
    const client = await pool.connect();

    // Step 1: Get the old role before updating
    const oldRoleQuery = `SELECT role FROM users WHERE id = $1;`;  // Ensure column name is correct
    const oldRoleResult = await client.query(oldRoleQuery, [userId]);

    
    if (oldRoleResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: "User not found" });
    }

    const old_role = oldRoleResult.rows[0].role;

    // Step 2: Update the user details
    const updateQuery = `
    UPDATE users
    SET name = $1, email = $2, phone = $3, address = $4, gender = $5, dob = $6, role = $7, updated_by = $9
    WHERE id = $8 RETURNING *;
  `;
  const values = [name, email, phone, address, gender, dob, role, userId, updated_by];
    const result = await client.query(updateQuery, values);

    // Step 3: Log role changes in users_audit
    if (old_role !== role) {
      const auditQuery = `
        INSERT INTO users_audit (user_id, changed_by, action, old_role, new_role, changed_at)
        VALUES ($1, $2, 'Role Changed', $3, $4, NOW());
      `;
      await client.query(auditQuery, [userId, updated_by, old_role, role]);
    }

    client.release();
    res.status(200).json({ message: "User details updated successfully!", user: result.rows[0] });

  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Error updating user details' });
  }
});


// app.put('/api/user/:id', (req, res) => { //for admin updating
//   const userId = req.params.id;
//   const { name, email, phone, address, gender, dob, role } = req.body;

//   const query = `
//     UPDATE users
//     SET name = $1, email = $2, phone = $3, address = $4, gender = $5, dob = $6, role = $8
//     WHERE id = $7
//   `;
//   const values = [name, email, phone, address, gender, dob, userId, role] ;

//   pool.query(query, values)
//   .then(() => res.json({ message: 'User details updated successfully' }))  // Return a JSON response
//   .catch((error) => {
//     console.error('Error updating user details:', error);
//     res.status(500).json({ error: 'Error updating user details' });
//   });
// });

app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM users order by id asc';
  pool.query(query)
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    });
});


//user data end -----------------------------------------------------------------

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
app.get('/api/orders', async (req, res) => { //used when you click the purchase button
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.order_date desc;');
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
    const { status, updated_by } = req.body;
    const { id } = req.params;

    const client = await pool.connect();

    // Ensure order exists and fetch user email
    const orderQuery = `
      SELECT orders.status, orders.order_number, users.email 
      FROM orders 
      JOIN users ON orders.user_id = users.id 
      WHERE orders.id = $1;
    `;
    const orderResult = await client.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderResult.rows[0];
    const old_status = order.status;
    const userEmail = order.email;
    const orderNumber = order.order_number;

    // Ensure order exists
    const oldStatusQuery = `SELECT status FROM orders WHERE id = $1;`;
    const oldStatusResult = await client.query(oldStatusQuery, [id]);

    if (oldStatusResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status and set updated_by
    const updateQuery = `
      UPDATE orders 
      SET status = $1, updated_by = $2 
      WHERE id = $3 
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [status, updated_by, id]);

    client.release();

    // Send email notification
    await sendEmailNotification(userEmail, orderNumber, status);

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// app.put('/api/orders/:id/status', async (req, res) => {
//   try {
//     const { status } = req.body;
//     const { id } = req.params;

//     const client = await pool.connect();
//     const updateQuery = `
//       UPDATE orders SET status = $1 WHERE id = $2 RETURNING *;
//     `;
//     const result = await client.query(updateQuery, [status, id]);

//     client.release();
//     res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


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
    const query = 'SELECT * FROM orders WHERE user_id = $1 order by order_date desc'; // Fetch orders by user_id
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

app.get('/api/orders/stats', async (req, res) => {
  try {
    const query = `
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status;
    `;
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Table orders end ------------------------------------------------------------------------------------------

//Products table -------------------------------------------------------------------------------------------

// Backend route to fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM products order by name asc';
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
  const { name, description, price, stock, image_url } = req.body;

  if (!name || !description || price == null || stock == null || image_url == null) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO products (name, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(insertQuery, [name, description, price, stock, image_url]);
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

//register.component -----------------------------------------------------------
app.use(bodyParser.json()); 

// const ADMIN_KEY = 'adminKey123';  // Replace with a secure key

// app.post('/api/register', async (req, res) => {
//   try {
//     console.log('Request body:', req.body);
//     const { name, email, password, role, key } = req.body;

//     if (!role) {
//       console.error('Role is missing!');
//     }

//     const client = await pool.connect();

//     let assignedRole = 'user'; // Default role is 'user'

//     // Check if the provided key matches the admin key
//     if (role === 'admin' && key === ADMIN_KEY) {
//       assignedRole = 'admin';
//     }

//     const insertQuery = `
//       INSERT INTO users (name, email, password, role) 
//       VALUES ($1, $2, $3, $4) 
//       RETURNING *`;

//     const result = await client.query(insertQuery, [name, email, password, assignedRole]);

//     client.release();

//      // Send Welcome Email
//     //  await sendWelcomeEmail(email, name);

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error('Error inserting user:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.post('/api/register/:id', async (req, res) => {
//   try {
//     const { name, email, password, role, created_by } = req.body; // Include who created the user
//     console.log("Received userId from frontend:", created_by);
//     const client = await pool.connect();  // Use request body if req.user is missing

//     const existingUser = await client.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (existingUser.rows.length > 0) {
//       client.release();
//       return res.status(400).json({ error: "Email is already registered" });
//     }

//     let assignedRole = 'user'; // Default role is 'user'
//     if (role === 'admin' && key === ADMIN_KEY) {
//       assignedRole = 'admin';
//     }

//     // Insert and return the inserted user
//     const insertQuery = `
//       INSERT INTO users (name, email, password, role, created_by) 
//       VALUES ($1, $2, $3, $4, $5) 
//       RETURNING id
//     `;
//     const result = await client.query(insertQuery, [name, email, password, assignedRole,  created_by]);
//     const userid = result.rows[0].id;

//     console.log("userid:", userid);
//     console.log("insertQuery:", name, email, password, assignedRole,  created_by);

//     // Step 2: Log in users_audit
//     const auditQuery = `
//       INSERT INTO users_audit (user_id, changed_by, action, old_role, new_role, changed_at)
//       VALUES ($1, $2, 'Added', NULL, $3, NOW());
//     `;
//     await client.query(auditQuery, [userid, created_by, assignedRole]);
//     console.log("auditQuery:", userid, created_by, assignedRole);

//     client.release();

//     res.status(201).json({
//       message: 'User registered successfully', 
//       user: result.rows[0]
//       // user: { id, name, email, role: assignedRole, createdBy },
//     });
//   } catch (error) {
//     console.error("Error inserting user:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, key, created_by } = req.body;
    const client = await pool.connect();

    // Check if the email already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    let assignedRole = 'user'; // Default role is 'user'
    if (role === 'admin' && key === ADMIN_KEY) {
      assignedRole = 'admin';
    }

    // Insert user with created_by
    const insertQuery = `
      INSERT INTO users (name, email, password, role, created_by) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`;
    
    const result = await client.query(insertQuery, [name, email, password, assignedRole, created_by]);

    client.release();

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.post('/api/register', async (req, res) => {
//   try {
//     const { name, email, password, role, key } = req.body;
//     const client = await pool.connect();

//      // Check if the email already exists
//      const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

//      if (existingUser.rows.length > 0) {
//        return res.status(400).json({ error: "Email is already registered" });
//      }

//     let assignedRole = 'user'; // Default role is 'user'

//     // Check if the provided key matches the admin key
//     if (role === 'admin' && key === ADMIN_KEY) {
//       assignedRole = 'admin';
//     }
//     // Insert and return the inserted user
//     // Force role to be user
//     const insertQuery = `
//       INSERT INTO users (name, email, password, role) 
//       VALUES ($1, $2, $3, $4) 
//       RETURNING *`;
    
//     const result = await client.query(insertQuery, [name, email, password,assignedRole]);

//     client.release();

//      // Send Welcome Email
//     //  await sendWelcomeEmail(email, name);

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Error inserting user:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

//register component end---------------------------------------------------

//Order-cart.component start-------------------------------------------------
app.post('/api/cart', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
      const existingCartItem = await pool.query(
          "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND status = 'Pending Checkout'",
          [user_id, product_id]
      );

      if (existingCartItem.rows.length > 0) {
          // Update quantity if product already exists in the cart
          await pool.query(
              "UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 AND status = 'Pending Checkout'",
              [quantity, user_id, product_id]
          );
      } else {
          // Insert new product into cart
          await pool.query(
              "INSERT INTO cart (user_id, product_id, quantity, status) VALUES ($1, $2, $3, 'Pending Checkout')",
              [user_id, product_id, quantity]
          );
      }
      res.status(200).json({ message: "Product added to cart" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
      const result = await pool.query(
          "SELECT c.id, p.name, c.quantity, c.status, p.price, p.image_url FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1 AND c.status = 'Pending Checkout'",
          [userId]
      );
      res.json(result.rows);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await pool.query("UPDATE cart SET quantity = $1 WHERE id = $2", [quantity, id]);
    res.json({ message: "Cart item updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM cart WHERE id = $1", [id]);
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/checkout/', async (req, res) => {
  const { user_id } = req.body;
  try {
      // Move cart items to orders table with status 'Processing'
      await pool.query(
          "INSERT INTO orders (user_id, product_name, quantity, price, status) SELECT c.user_id, p.name, c.quantity, p.price, 'Processing' FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1 AND c.status = 'Pending Checkout'",[user_id]
      );

      // Remove checked-out items from cart
      await pool.query(
          "UPDATE cart SET status = 'Checked Out' WHERE user_id = $1 AND status = 'Pending Checkout';",
          [user_id]
      );

      res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.post('/api/checkout/:id', async (req, res) => {
  const { userId, address } = req.body;
  console.log("Received userId:", userId, "Address:", address);

  let orderNumber;
  let isUnique = false;

  try {
    while (!isUnique) {
      // Generate order number
      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const randomTwoDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      orderNumber = `BMC${formattedDate}${randomTwoDigits}`;

      // Check if order number already exists
      const checkResult = await pool.query("SELECT COUNT(*) FROM orders WHERE order_number = $1", [orderNumber]);
      if (parseInt(checkResult.rows[0].count) === 0) {
        isUnique = true; // Order number is unique, proceed
      } else {
        console.log("Duplicate order number detected, regenerating...");
      }
    }

    console.log("Generated Unique Order Number:", orderNumber);

    const result = await pool.query(
      `INSERT INTO orders (user_id, product_name, quantity, price, status, address, order_number) 
      SELECT c.user_id, p.name, c.quantity, p.price, 'Processing', $2, $3  
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = $1 AND c.status = 'Pending Checkout'`,
      [userId, address, orderNumber]
    );

    console.log("Order Inserted:", result.rowCount);

    await pool.query(
      "UPDATE cart SET status = 'Checked Out' WHERE user_id = $1 AND status = 'Pending Checkout';",
      [userId]
    );

    // Fetch user email
    const userResult = await pool.query("SELECT email, name FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      console.error("User email not found.");
      return res.status(400).json({ error: "User email not found." });
    }
    const userEmail = userResult.rows[0].email;
    const userN = userResult.rows[0].name;

    // Send Confirmation Email
    await sendOrderConfirmationEmail(userEmail, orderNumber, address, userN);

    res.status(200).json({ message: "Order placed successfully", orderNumber });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// app.post('/api/checkout/:id', async (req, res) => {
//   const { userId, address } = req.body;
//   console.log("Received userId:", userId, "Address:", address); // Debugging
//   console.log("Checkout request received for user_id:", userId, "Address:", address);
  
//   //generate order number
//   const today = new Date();
//   const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
//   const randomTwoDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
//   const orderNumber = `BMC${formattedDate}${randomTwoDigits}`;

//   console.log("Generated Order Number:", orderNumber);

//   try {
//       const result = await pool.query(
//           `INSERT INTO orders (user_id, product_name, quantity, price, status, address, order_number) 
//           SELECT c.user_id, p.name, c.quantity, p.price, 'Processing', $2, $3  
//           FROM cart c 
//           JOIN products p ON c.product_id = p.id 
//           WHERE c.user_id = $1 AND c.status = 'Pending Checkout'`,
//           [userId, address,orderNumber]
//       );
//       console.log("Order Inserted:", result.rowCount);

//       await pool.query(
//           "UPDATE cart SET status = 'Checked Out' WHERE user_id = $1 AND status = 'Pending Checkout';",
//           [userId]
//       );

//       // Fetch user email
//     const userResult = await pool.query("SELECT email, name FROM users WHERE id = $1", [userId]);
//     if (userResult.rows.length === 0) {
//       console.error("User email not found.");
//       return res.status(400).json({ error: "User email not found." });
//     }
//     const userEmail = userResult.rows[0].email;
//     const userN = userResult.rows[0].name;

//     // Send Confirmation Email
//     await sendOrderConfirmationEmail(userEmail, orderNumber, address, userN);
//     // sendOrderConfirmationEmail(userId, orderNumber);
//     console.log(userEmail, orderNumber, address); // Ensure they are not undefined

//       res.status(200).json({ message: "Order placed successfully", orderNumber });
//   } catch (error) {
//       console.error("Checkout Error:", error);
//       res.status(500).json({ error: error.message });
//   }
// });



//Order-cart.component end----------------------------------------------------
// Start Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
