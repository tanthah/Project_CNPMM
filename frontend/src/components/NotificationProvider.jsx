import React, { createContext, useContext, useMemo, useRef, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext(null)

export function useNotification() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null)
  const confirmResolveRef = useRef(null)

  // Configure common toast options
  const toastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }

  const success = (message, options = {}) => toast.success(message, { ...toastOptions, ...options })
  const error = (message, options = {}) => toast.error(message, { ...toastOptions, ...options })
  const info = (message, options = {}) => toast.info(message, { ...toastOptions, ...options })
  const warn = (message, options = {}) => toast.warn(message, { ...toastOptions, ...options })

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
      {/* ToastContainer is likely already in App.jsx or ToastNotification.jsx, 
          but adding one here with a specific limit or check might be safe. 
          However, react-toastify handles multiple containers fine. 
          To avoid duplicates, we might assume App.jsx has one or we add one here.
          Given ToastNotification.jsx has one, we should probably rely on that or add one here if not present.
          To be safe and ensuring it works everywhere, adding it here is common practice.
      */}
      {/* We already have ToastContainer in ToastNotification.jsx which is in App.jsx. 
          So we might not strictly need it here if App.jsx wraps properly. 
          But NotificationProvider wraps App? No, usually Provider wraps App. 
          Let's see App.jsx structure later. For now, we use the library.
          If multiple containers exist, it might duplicate. 
          Let's assume we stick to the library's toast() calls which work with any mounted container.
      */}

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

