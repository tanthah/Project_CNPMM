import 'dotenv/config'
import mongoose from 'mongoose'
import Product from './src/models/Product.js'
import Category from './src/models/Category.js'

// Debug: Check if .env is loaded
console.log('🔍 MONGODB_URI from .env:', process.env.MONGODB_URI ? 'Found' : 'Not found')

// Fallback URI if .env not loaded - Match existing database name
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/UTE_Shop'
console.log('📌 Using URI:', MONGODB_URI)

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('MongoDB connected')
    } catch (err) {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    }
}

// Sample categories (tạo trước để có ObjectId)
const sampleCategories = [
    { name: 'Điện thoại', slug: 'dien-thoai' },
    { name: 'Laptop', slug: 'laptop' },
    { name: 'Phụ kiện', slug: 'phu-kien' },
    { name: 'Tablet', slug: 'tablet' },
]

// Sample products
const createSampleProducts = (categoryIds) => [
    {
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, titanium design',
        price: 29990000,
        discount: 10,
        finalPrice: 29990000 * (1 - 10 / 100),
        stock: 50,
        images: [
            'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg',
            'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-1-750x500.jpg'
        ],
        categoryId: categoryIds[0], // Điện thoại
        brand: 'Apple',
        views: 120,
        soldCount: 15
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        description: 'Galaxy S24 Ultra với bút S-Pen, camera 200MP',
        price: 26990000,
        discount: 15,
        finalPrice: 26990000 * (1 - 15 / 100),
        stock: 30,
        images: [
            'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-xam-1-750x500.jpg',
            'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-xam-5-750x500.jpg'
        ],
        categoryId: categoryIds[0],
        brand: 'Samsung',
        views: 95,
        soldCount: 22
    },
    {
        name: 'MacBook Pro 14 M3',
        slug: 'macbook-pro-14-m3',
        description: 'MacBook Pro 14 inch với chip M3, 8GB RAM, 512GB SSD',
        price: 39990000,
        discount: 5,
        finalPrice: 39990000 * (1 - 5 / 100),
        stock: 20,
        images: [
            'https://cdn.tgdd.vn/Products/Images/44/318228/macbook-pro-14-inch-m3-2023-acv-1-750x500.jpg'
        ],
        categoryId: categoryIds[1], // Laptop
        brand: 'Apple',
        views: 180,
        soldCount: 8
    },
    {
        name: 'Dell XPS 13 Plus',
        slug: 'dell-xps-13-plus',
        description: 'Laptop Dell XPS 13 Plus, Intel Core i7, 16GB RAM',
        price: 35990000,
        discount: 8,
        finalPrice: 35990000 * (1 - 8 / 100),
        stock: 15,
        images: [
            'https://cdn.tgdd.vn/Products/Images/44/314838/dell-xps-13-plus-9320-i5-71013325-1-750x500.jpg'
        ],
        categoryId: categoryIds[1],
        brand: 'Dell',
        views: 65,
        soldCount: 12
    },
    {
        name: 'AirPods Pro 2',
        slug: 'airpods-pro-2',
        description: 'Tai nghe AirPods Pro thế hệ 2 với chống ồn chủ động',
        price: 5990000,
        discount: 20,
        finalPrice: 5990000 * (1 - 20 / 100),
        stock: 100,
        images: [
            'https://cdn.tgdd.vn/Products/Images/54/315014/tai-nghe-bluetooth-airpods-pro-2nd-gen-usb-c-charge-apple-1-750x500.jpg'
        ],
        categoryId: categoryIds[2], // Phụ kiện
        brand: 'Apple',
        views: 250,
        soldCount: 45
    },
    {
        name: 'iPad Pro 11 M2',
        slug: 'ipad-pro-11-m2',
        description: 'iPad Pro 11 inch với chip M2, màn hình Liquid Retina',
        price: 20990000,
        discount: 12,
        finalPrice: 20990000 * (1 - 12 / 100),
        stock: 25,
        images: [
            'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-pro-2022-11-inch-m2.png'
        ],
        categoryId: categoryIds[3], // Tablet
        brand: 'Apple',
        views: 140,
        soldCount: 18
    },
    {
        name: 'Samsung Galaxy Tab S9',
        slug: 'samsung-galaxy-tab-s9',
        description: 'Tablet Samsung Galaxy Tab S9 với màn hình AMOLED',
        price: 15990000,
        discount: 10,
        finalPrice: 15990000 * (1 - 10 / 100),
        stock: 35,
        images: [
            'https://cdn.tgdd.vn/Products/Images/522/303299/samsung-galaxy-tab-s9-1-750x500.jpg'
        ],
        categoryId: categoryIds[3],
        brand: 'Samsung',
        views: 88,
        soldCount: 14
    },
    {
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        description: 'Tai nghe chụp tai Sony WH-1000XM5 chống ồn cao cấp',
        price: 7990000,
        discount: 15,
        finalPrice: 7990000 * (1 - 15 / 100),
        stock: 60,
        images: [
            'https://cdn.tgdd.vn/Products/Images/54/313692/tai-nghe-bluetooth-chup-tai-sony-wh1000xm5-trang-1-750x500.jpg',
            'https://cdn.tgdd.vn/Products/Images/54/313692/tai-nghe-bluetooth-chup-tai-sony-wh1000xm5-trang-2-750x500.jpg'
        ],
        categoryId: categoryIds[2],
        brand: 'Sony',
        views: 175,
        soldCount: 28
    }
]

// Main seed function
const seedDatabase = async () => {
    try {
        await connectDB()

        // 1. Clear existing data
        console.log('🗑️  Clearing existing data...')
        await Product.deleteMany({})
        await Category.deleteMany({})

        // 2. Create categories
        console.log('📁 Creating categories...')
        const categories = await Category.insertMany(sampleCategories)
        const categoryIds = categories.map(c => c._id)
        console.log(`✅ Created ${categories.length} categories`)

        // 3. Create products
        console.log('📦 Creating products...')
        const products = createSampleProducts(categoryIds)
        await Product.insertMany(products)
        console.log(`✅ Created ${products.length} products`)

        console.log('\n🎉 Database seeded successfully!')
        console.log('\n📊 Summary:')
        console.log(`   - Categories: ${categories.length}`)
        console.log(`   - Products: ${products.length}`)

        process.exit(0)
    } catch (err) {
        console.error('❌ Error seeding database:', err)
        process.exit(1)
    }
}

// Run seed
seedDatabase()
