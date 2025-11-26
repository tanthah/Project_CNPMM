import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/authSlice'
import editUserReducer from './redux/editUserSlice'
import registerReducer from './redux/registerSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    editUser: editUserReducer,
    register: registerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['register/setImageFile'],
        ignoredPaths: ['register.imageFile'],
      },
    }),
})

export default store