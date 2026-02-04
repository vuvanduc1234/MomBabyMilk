const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mom Baby Milk API",
      version: "1.0.0",
      description: "API documentation for Mom Baby Milk e-commerce platform",
      contact: {
        name: "API Support",
        email: "support@mombabymilk.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            fullname: {
              type: "string",
              description: "User full name",
            },
            phone: {
              type: "number",
              description: "User phone number",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              description: "User gender",
            },
            address: {
              type: "string",
              description: "User address",
            },
            dateOfBirth: {
              type: "string",
              format: "date",
              description: "User date of birth",
            },
            role: {
              type: "string",
              enum: ["Admin", "StaffManager", "User"],
              description: "User role",
            },
            vouchers: {
              type: "array",
              items: {
                type: "string",
                description: "Voucher ID ref",
              },
              description: "List of vouchers owned by user",
            },
            isVerified: {
              type: "boolean",
              description: "Email verification status",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Product ID" },
            name: { type: "string", description: "Product name" },
            description: { type: "string", description: "Product description" },
            price: { type: "number", description: "Product price" },
            sale_price: { type: "number", description: "Product sale price" },
            stock: { type: "number", description: "Product stock quantity" },
            category: { type: "string", description: "Category ID" },
            brand: { type: "string", description: "Brand ID" },
            image: { type: "string", description: "Product image URL" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Category ID" },
            name: { type: "string", description: "Category name" },
            description: { type: "string", description: "Category description" },
          },
        },
        Brand: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Brand ID" },
            name: { type: "string", description: "Brand name" },
            description: { type: "string", description: "Brand description" },
          },
        }, 
        CartItem: {
          type: "object",
          properties: {
            productId: { type: "string", description: "Product ID reference" },
            quantity: { type: "number", description: "Quantity", example: 1 },
          },
        },
        Cart: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Cart ID" },
            userId: { type: "string", description: "User ID owner" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
            totalPrice: { type: "number", description: "Calculated total price" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        OrderInput: {
          type: "object",
          required: ["cartItems"],
          properties: {
            cartItems: {
              type: "array",
              description: "Danh sách items từ localStorage client",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string", description: "Product ID" },
                  quantity: { type: "number", example: 1 }
                }
              }
            },
            paymentMethod: { 
              type: "string", 
              enum: ["momo", "vnpay", "cod"], 
              example: "cod" 
            },
            voucherCode: { 
              type: "string", 
              description: "Mã voucher (nếu có)",
              example: "SALE20" 
            },
            shippingAddress: {
              type: "string",
              description: "Địa chỉ giao hàng"
            },
            pointsUsed: {
              type: "number",
              description: "Điểm thưởng sử dụng",
              default: 0
            }
          }
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", description: "Error message" },
            error: { type: "string", description: "Error details" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;