import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, 'src', '.env') });
// Fallback if .env is in root
if (!process.env.MONGODB_URI) {
    dotenv.config();
}

console.log('Connecting to MongoDB...');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shop_db'; // Fallback URI if env missing

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const result = await mongoose.connection.db.dropCollection('subscribers');
            if (result) {
                console.log('✅ Collection "subscribers" dropped successfully.');
            }
        } catch (error) {
            if (error.code === 26) {
                console.log('ℹ️ Collection "subscribers" does not exist.');
            } else {
                console.error('❌ Error dropping collection:', error.message);
            }
        } finally {
            await mongoose.connection.close();
            console.log('Connection closed.');
            process.exit(0);
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
