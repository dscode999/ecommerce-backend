import User from "../../users/model/user.model.js"
import Product from "../../products/model/product.model.js"

export const getCart = async (req, res) => {
    try {
        const userId = req.user.userId

        const user = await User.findById(userId)
            .populate("cart.product", "name price images stock")

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }
        let totalPrice = 0;

        const items = user.cart.map(item => {
            const subtotal = item.product.price * item.quantity;
            totalPrice += subtotal;

            return {
                product: item.product,
                quantity: item.quantity,
                subtotal
            };
        });


        res.status(200).json({
            status: 200,
            message: 'Fetch Cart',
            data: {
                items,
                totalItems: items.length,
                totalPrice
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId
        const { productId, quantity } = req.body

        const user = await User.findById(userId)

        const existingItem = user.cart.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            user.cart.push({
                product: productId,
                quantity: quantity || 1
            })
        }

        await user.save();

        res.status(200).json({
            status: 200,
            message: "Product added to cart",
            data: user.cart
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Server error",
            data: null
        })
    }
}


export const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.userId
        const { productId } = req.params
        const { quantity } = req.body


        if (!quantity || quantity < 1) {
            return res.status(400).json({
                status: 400,
                message: "Quantity must be greater than 0"
            })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

        const cartItem = user.cart.find(
            item => item.product.toString() === productId
        )

        if (!cartItem) {
            return res.status(404).json({
                status: 404,
                message: "Product not found in cart",
                data: null
            })
        }

        cartItem.quantity = quantity

        await user.save()

        res.status(200).json({
            status: 200,
            message: "Cart item updated successfully",
            data: user.cart
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: 500,
            message: "Server error"
        })
    }
}

export const deleteItemFromCart = async (req, res) => {
    try {
        const userId = req.user.userId
        const { productId } = req.params
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })

        }
        const existingItem = user.cart.find(
            item => item.product.toString() === productId
        )

        if (!existingItem) {
            return res.status(404).json({
                status: 404,
                message: "Product not found in cart",
                data: null

            })
        }

        user.cart = user.cart.filter(
            item => item.product.toString() !== productId
        )
        await user.save()
        res.status(200).json({
            status: 200,
            message: "Product removed from cart",
            data: user.cart
        })



    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Product removed from cart",
            data: null
        })

    }

}

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                data: null
            })
        }

        user.cart = []; // 🔥 ריקון מלא

        await user.save()

        res.status(200).json({
            status: 200,
            message: "Cart cleared successfully",
            data: []
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server error",
            data: null
        })
    }
}

export const syncCart = async (req, res) => {
    try {
  
      const userId = req.user.userId;
      const { items } = req.body;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found"
        })
      }
  
      for (const item of items) {
  
        const product = await Product.findById(item.productId);
        if (!product) continue;
  
        const existingItem = user.cart.find(
          p => p.product.toString() === item.productId
        )
  
        if (existingItem) {
  
          existingItem.quantity += item.quantity;
  
          if (existingItem.quantity > product.stock) {
            existingItem.quantity = product.stock;
          }
  
        } else {
  
          const quantity = Math.min(item.quantity, product.stock);
  
          user.cart.push({
            product: item.productId,
            quantity
          })
  
        }
      }
  
      await user.save()
  
      res.status(200).json({
        status: 200,
        message: "Cart synced successfully",
        data: user.cart
      })
  
    } catch (error) {
  
      res.status(500).json({
        status: 500,
        message: error.message
      })
  
    }
  }
  