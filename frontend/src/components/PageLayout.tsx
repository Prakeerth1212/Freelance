import { ReactNode } from 'react'
import { Box, Typography, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { getCurrency, setCurrency, currencyOptions } from '../utils/currency'

interface PageLayoutProps {
  title: ReactNode
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export default function PageLayout({ title, subtitle, action, children }: PageLayoutProps) {
  const current = getCurrency()

  const handleChange = (e: SelectChangeEvent) => {
    setCurrency(e.target.value as any)
    window.location.reload()
  }

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Select
            value={current}
            onChange={handleChange}
            size="small"
            sx={{
              minWidth: 110,
              borderRadius: 2,
              fontSize: '0.8rem',
              fontWeight: 600,
              '& .MuiSelect-select': { py: 0.6, px: 1.5 },
            }}
          >
            {currencyOptions().map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8rem' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {action}
        </Box>
      </Box>
      {children}
    </Box>
  )
}
