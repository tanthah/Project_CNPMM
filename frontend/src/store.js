// frontend/src/store.js - UPDATED
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/authSlice'
import editUserReducer from './redux/editUserSlice'
import registerReducer from './redux/registerSlice'
import productReducer from './redux/productSlice'
import cartReducer from './redux/cartSlice'
import categoryReducer from "./redux/categorySlice"

// ✅ NEW REDUCERS
import reviewReducer from './redux/reviewSlice'
import wishlistReducer from './redux/wishlistSlice'
import loyaltyReducer from './redux/loyaltySlice'
import couponReducer from './redux/couponSlice'
import commentReducer from './redux/commentSlice'
import notificationReducer from './redux/notificationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    editUser: editUserReducer,
    register: registerReducer,
    products: productReducer,
    cart: cartReducer,
    category: categoryReducer,

    // ✅ NEW REDUCERS
    review: reviewReducer,
    wishlist: wishlistReducer,
    loyalty: loyaltyReducer,
    coupon: couponReducer,
    comments: commentReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['register/setImageFile'],
        ignoredPaths: ['register.imageFile'],
      },
    }),
})

export default store
