import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/UTE_Shop');
        console.log('MongoDB connected');

        // Define Schema exactly as User App uses (minimal)
        const productSchema = new mongoose.Schema({
            name: String,
            isActive: Boolean,
            categoryId: mongoose.Schema.Types.ObjectId,
            images: [String],
            createdAt: Date
        }, { strict: false }); // Strict false to see all fields

        const Product = mongoose.model('Product', productSchema, 'products');

        const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

        console.log('--- LATEST 5 PRODUCTS ---');
        products.forEach(p => {
            console.log(`ID: ${p._id}`);
            console.log(`Name: ${p.name}`);
            console.log(`Active: ${p.isActive}`);
            console.log(`Category: ${p.categoryId}`);
            console.log(`Images: ${p.images}`);
            console.log(`Created: ${p.createdAt}`);
            console.log('-------------------------');
        });

        // Check Categories
        const catSchema = new mongoose.Schema({ name: String, slug: String }, { strict: false });
        const Category = mongoose.model('Category', catSchema, 'categories');
        const categories = await Category.find({});
        console.log(`Total Categories: ${categories.length}`);
        categories.forEach(c => console.log(`- ${c.name} (${c._id})`));

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
