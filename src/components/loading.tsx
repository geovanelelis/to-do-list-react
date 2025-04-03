import * as React from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#00afc4',
    },
  },
})

export default function Loading() {
  return (
    <ThemeProvider theme={theme}>
      <Box className="height-home flex items-center justify-center">
        <CircularProgress size="6rem" color="primary" />
      </Box>
    </ThemeProvider>
  )
}
