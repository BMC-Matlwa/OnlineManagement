// ordering-management-backend/models/order.model.js
module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
      }
    });
    Order.associate = models => {
      Order.belongsTo(models.User, { foreignKey: 'userId' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    };
    return Order;
  };
  