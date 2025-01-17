import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';

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
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: '#889799',
              color: '#fff',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', color: '#4CAF50' }}>
              Necə qazanırıq?
            </Typography>

            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              position: 'relative'
            }}>
              {/* İlk Kutu - Geri Ödənilən */}
              <Paper sx={{ 
                p: 2, 
                bgcolor: '#2a2a2a',
                width: '100%',
                maxWidth: 300,
                textAlign: 'center'
              }}>
                <Typography sx={{ color: '#4CAF50' }}>
                  Geri ödənilən
                </Typography>
                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                  Yatırılan Pul: 500 AZN
                </Typography>
                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                  Qazanılan Pul: 50 AZN
                </Typography>
                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                  Bonus: 50-100 AZN
                </Typography>
                <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                  CƏMİ: 650 AZN
                </Typography>
              </Paper>

              {/* Dikey çizgi */}
              <Box sx={{ 
                width: '2px', 
                height: '50px', 
                bgcolor: '#4CAF50',
                position: 'relative'
              }} />

              {/* İstifadəçi */}
              <Paper sx={{ 
                p: 2, 
                bgcolor: '#2a2a2a',
                width: '100%',
                maxWidth: 200,
                textAlign: 'center'
              }}>
                <Typography sx={{ color: '#4CAF50' }}>
                  İstifadəçi
                </Typography>
              </Paper>

              {/* Dikey çizgi */}
              <Box sx={{ 
                width: '2px', 
                height: '50px', 
                bgcolor: '#4CAF50',
                position: 'relative'
              }} />

              {/* Kasa */}
              <Paper sx={{ 
                p: 2, 
                bgcolor: '#2a2a2a',
                width: '100%',
                maxWidth: 200,
                textAlign: 'center'
              }}>
                <Typography sx={{ color: '#4CAF50' }}>
                  Kasa
                </Typography>
                <Typography sx={{ color: '#fff' }}>
                  500 AZN
                </Typography>
                <Typography sx={{ color: '#4CAF50' }}>
                  10%
                </Typography>
              </Paper>

              {/* Dikey çizgi */}
              <Box sx={{ 
                width: '2px', 
                height: '50px', 
                bgcolor: '#4CAF50',
                position: 'relative'
              }} />

              {/* Alt Gruplar */}
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-around',
                width: '100%',
                gap: 2,
                flexWrap: 'wrap',
                position: 'relative'
              }}>
                {/* Yatay çizgiler */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '20%',
                  right: '20%',
                  height: '2px',
                  bgcolor: '#4CAF50',
                  zIndex: 0
                }} />

                {/* Mutexessis İnvestorlar */}
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: '#2a2a2a',
                  minWidth: 200,
                  textAlign: 'center',
                  zIndex: 1
                }}>
                  <Typography sx={{ color: '#4CAF50' }}>
                    Mutexessis İnvestorlar
                  </Typography>
                </Paper>

                {/* Kripto Valyutalar */}
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: '#2a2a2a',
                  minWidth: 200,
                  textAlign: 'center',
                  zIndex: 1
                }}>
                  <Typography sx={{ color: '#4CAF50' }}>
                    Kripto Valyutalar
                  </Typography>
                </Paper>

                {/* Səhimlər */}
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: '#2a2a2a',
                  minWidth: 200,
                  textAlign: 'center',
                  zIndex: 1
                }}>
                  <Typography sx={{ color: '#4CAF50' }}>
                    Səhimlər:
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                    Apple, Facebook, SOCAR
                  </Typography>
                </Paper>
              </Box>

              {/* Dikey çizgi */}
              <Box sx={{ 
                width: '2px', 
                height: '50px', 
                bgcolor: '#4CAF50',
                position: 'relative'
              }} />

              {/* Əldə olunan gəlir */}
              <Paper sx={{ 
                p: 2, 
                bgcolor: '#2a2a2a',
                width: '100%',
                maxWidth: 200,
                textAlign: 'center'
              }}>
                <Typography sx={{ color: '#4CAF50' }}>
                  Əldə olunan gəlir
                </Typography>
                <Typography sx={{ color: '#fff' }}>
                  1400 AZN
                </Typography>
              </Paper>

              {/* Dikey çizgi */}
              <Box sx={{ 
                width: '2px', 
                height: '50px', 
                bgcolor: '#4CAF50',
                position: 'relative'
              }} />

              {/* İstifadəçiyə verilən qazanc açıklaması */}
              <Paper sx={{ 
                p: 2, 
                bgcolor: '#2a2a2a',
                width: '100%',
                maxWidth: 400,
                textAlign: 'center'
              }}>
                <Typography sx={{ color: '#4CAF50', fontSize: '0.9rem' }}>
                  İstifadəçiyə verilən qazanc miqdarı yatırım etdiyi miqdara və kasanın faizləri görə hesablanaraq avtomatik şəkildə yatırım etdiyi pul ilə birlikdə geri qaytarılır.
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default HowToEarn; 