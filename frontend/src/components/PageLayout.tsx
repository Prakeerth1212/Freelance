import { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

interface PageLayoutProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export default function PageLayout({ title, subtitle, action, children }: PageLayoutProps) {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: subtitle ? 0.5 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
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
