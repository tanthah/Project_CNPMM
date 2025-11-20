import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)

  return (
    <div className="page">
      <div className="card">
        <h2>Dashboard</h2>
        <p>Welcome {user?.name || 'user'}!</p>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </div>
    </div>
  )
}
