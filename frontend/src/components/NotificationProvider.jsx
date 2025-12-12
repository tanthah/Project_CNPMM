import React, { createContext, useContext, useMemo, useRef, useState } from 'react'
import { Toast, Modal, Button } from 'react-bootstrap'

const NotificationContext = createContext(null)

export function useNotification() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const confirmResolveRef = useRef(null)

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const addToast = ({ title, message, variant = 'info', duration = 3000 }) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, title, message, variant, duration }])
    return id
  }

  const success = (message, options = {}) => addToast({ title: 'Thành công', message, variant: 'success', ...options })
  const error = (message, options = {}) => addToast({ title: 'Lỗi', message, variant: 'danger', ...options })
  const info = (message, options = {}) => addToast({ title: 'Thông báo', message, variant: 'info', ...options })
  const warn = (message, options = {}) => addToast({ title: 'Cảnh báo', message, variant: 'warning', ...options })

  const confirm = ({ title = 'Xác nhận', message, confirmText = 'Đồng ý', cancelText = 'Hủy', variant = 'primary' }) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve
      setConfirmState({ title, message, confirmText, cancelText, variant })
    })
  }

  const handleConfirm = (result) => {
    const resolver = confirmResolveRef.current
    setConfirmState(null)
    confirmResolveRef.current = null
    if (resolver) resolver(result)
  }

  const value = useMemo(() => ({ success, error, info, warn, confirm }), [])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant} onClose={() => removeToast(t.id)} delay={t.duration} autohide>
            {t.title && <Toast.Header closeButton>
              <strong className="me-auto">{t.title}</strong>
            </Toast.Header>}
            <Toast.Body style={{ color: t.variant === 'warning' || t.variant === 'info' ? '#0f172a' : '#fff' }}>{t.message}</Toast.Body>
          </Toast>
        ))}
      </div>
      <Modal show={!!confirmState} onHide={() => handleConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{confirmState?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmState?.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleConfirm(false)}>
            {confirmState?.cancelText || 'Hủy'}
          </Button>
          <Button variant={confirmState?.variant || 'primary'} onClick={() => handleConfirm(true)}>
            {confirmState?.confirmText || 'Đồng ý'}
          </Button>
        </Modal.Footer>
      </Modal>
    </NotificationContext.Provider>
  )
}

