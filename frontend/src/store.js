import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/authSlice'
import editUserReducer from './redux/editUserSlice'
import registerUserReducer from './redux/registerSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: editUserReducer,
    register: registerUserReducer,
  },
})

export default store
