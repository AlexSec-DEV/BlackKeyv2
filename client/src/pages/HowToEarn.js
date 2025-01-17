import React from 'react';
import { Box, Container } from '@mui/material';
import MobileHeader from '../components/MobileHeader';
import Sidebar from '../components/Sidebar';

const HowToEarn = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      bgcolor: '#889799', 
      minHeight: '100vh'
    }}>
      <MobileHeader />
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: '#889799',
          width: { xs: '100%', md: 'calc(100% - 240px)' }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
          }}>
            <img 
              src="https://res.cloudinary.com/blackkey/image/upload/neceqazaniriq/ngnatk0ycsu4fjtjdxaz.png" 
              alt="Necə qazanırıq?"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HowToEarn; 