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
          <Box sx={{ 
            position: 'relative',
            minHeight: '600px',
            display: 'flex',
            justifyContent: 'center',
            pt: 4
          }}>
            {/* Geri ödənilən kutusu - Sol üst */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '200px',
              position: 'absolute',
              left: '10%',
              top: '50px',
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

            {/* İstifadəçi kutusu - Sağ üst */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '150px',
              position: 'absolute',
              right: '20%',
              top: '50px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#4CAF50' }}>
                İstifadəçi
              </Typography>
            </Paper>

            {/* Kasa kutusu - Merkez */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '150px',
              position: 'absolute',
              right: '20%',
              top: '180px',
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

            {/* Mutexessis İnvestorlar kutusu */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '150px',
              position: 'absolute',
              right: '20%',
              top: '310px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#4CAF50' }}>
                Mutexessis İnvestorlar
              </Typography>
            </Paper>

            {/* Kripto Valyutalar kutusu */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '150px',
              position: 'absolute',
              right: '40%',
              top: '450px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#4CAF50' }}>
                Kripto Valyutalar
              </Typography>
            </Paper>

            {/* Səhimlər kutusu */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '200px',
              position: 'absolute',
              right: '0%',
              top: '450px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#4CAF50' }}>
                Səhimlər:
              </Typography>
              <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                Apple, Facebook, SOCAR
              </Typography>
            </Paper>

            {/* Əldə olunan gəlir kutusu */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '150px',
              position: 'absolute',
              right: '20%',
              top: '550px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#4CAF50' }}>
                Əldə olunan gəlir
              </Typography>
              <Typography sx={{ color: '#fff' }}>
                1400 AZN
              </Typography>
            </Paper>

            {/* Açıklama kutusu - Sol alt */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: '#2a2a2a',
              width: '300px',
              position: 'absolute',
              left: '10%',
              top: '400px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#4CAF50', fontSize: '0.9rem' }}>
                İstifadəçiyə verilən qazanc miqdarı yatırım etdiyi miqdara və kasanın faizləri görə hesablanaraq avtomatik şəkildə yatırım etdiyi pul ilə birlikdə geri qaytarılır.
              </Typography>
            </Paper>

            {/* Çizgiler */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            >
              {/* Geri ödənilən -> İstifadəçi */}
              <line
                x1="300"
                y1="75"
                x2="800"
                y2="75"
                stroke="#4CAF50"
                strokeWidth="2"
              />

              {/* İstifadəçi -> Kasa */}
              <line
                x1="800"
                y1="120"
                x2="800"
                y2="180"
                stroke="#4CAF50"
                strokeWidth="2"
              />

              {/* Kasa -> Mutexessis İnvestorlar */}
              <line
                x1="800"
                y1="250"
                x2="800"
                y2="310"
                stroke="#4CAF50"
                strokeWidth="2"
              />

              {/* Mutexessis İnvestorlar -> Alt gruplar */}
              <line
                x1="800"
                y1="360"
                x2="800"
                y2="400"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="600"
                y1="400"
                x2="1000"
                y2="400"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="600"
                y1="400"
                x2="600"
                y2="450"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="1000"
                y1="400"
                x2="1000"
                y2="450"
                stroke="#4CAF50"
                strokeWidth="2"
              />

              {/* Alt gruplar -> Əldə olunan gəlir */}
              <line
                x1="600"
                y1="500"
                x2="600"
                y2="550"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="1000"
                y1="500"
                x2="1000"
                y2="550"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="600"
                y1="550"
                x2="800"
                y2="550"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="800"
                y1="550"
                x2="1000"
                y2="550"
                stroke="#4CAF50"
                strokeWidth="2"
              />

              {/* Açıklama kutusu bağlantıları */}
              <line
                x1="300"
                y1="400"
                x2="300"
                y2="75"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="300"
                y1="400"
                x2="300"
                y2="550"
                stroke="#4CAF50"
                strokeWidth="2"
              />
              <line
                x1="300"
                y1="550"
                x2="600"
                y2="550"
                stroke="#4CAF50"
                strokeWidth="2"
              />
            </svg>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HowToEarn; 