import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'

interface Toast {
  message: string
  severity: AlertColor
}

const ToastContext = createContext<(message: string, severity?: AlertColor) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)

  const show = useCallback((message: string, severity: AlertColor = 'success') => {
    setToast({ message, severity })
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2.5, fontWeight: 600 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  )
}
