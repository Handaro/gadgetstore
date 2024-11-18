const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is Required']
    },
    productsOrdered: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is Required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is Required'],
            min: [1, 'Quantity must be at least 1']
        },
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is Required'],
            min: [0, 'Subtotal cannot be negative']
        }
    }],
    totalPrice: {
        type: Number,
        required: [true, 'Total Price is Required'],
        min: [0, 'Total Price cannot be negative']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        required: [true, 'Order status is Required']
    }
});

module.exports = mongoose.model('Order', orderSchema);
