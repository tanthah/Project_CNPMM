process.env.GOOGLE_CLIENT_ID = 'test';
process.env.GOOGLE_CLIENT_SECRET = 'test';
process.env.JWT_SECRET = 'test';

// import './src/routes/auth.js';
import './src/routes/registerRoutes.js'
import './src/routes/editUserRoutes.js'
import './src/routes/productRoutes.js'
import './src/routes/cartRoutes.js'
import './src/routes/orderRoutes.js'
import './src/routes/addressRoutes.js'
import "./src/routes/categoryRoutes.js"
import './src/routes/reviewRoutes.js'
import './src/routes/wishlistRoutes.js'
import './src/routes/viewedProductRoutes.js'
import './src/routes/loyaltyRoutes.js'
import './src/routes/couponRoutes.js'
import './src/routes/commentRoutes.js'
import './src/routes/notificationRoutes.js'
import './src/routes/faqRoutes.js'
import './src/routes/settingRoutes.js'
import './src/routes/subscribeRoutes.js'
console.log("Imports OK");
