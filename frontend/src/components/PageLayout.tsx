import { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

interface PageLayoutProps {
  title: ReactNode
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export default function PageLayout({ title, subtitle, action, children }: PageLayoutProps) {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3.5,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          {typeof title === 'string' ? (
            <Typography variant="h5">{title}</Typography>
          ) : (
            title
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
      {children}
    </Box>
  )
}
