import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';

const glowAnimation = keyframes`
  0% { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff0080, 0 0 40px #ff0080, 0 0 50px #ff0080; }
  50% { text-shadow: 0 0 20px #fff, 0 0 30px #ff00ff, 0 0 40px #ff00ff, 0 0 50px #ff00ff, 0 0 60px #ff00ff; }
  100% { text-shadow: 0 0 10px #fff, 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00, 0 0 50px #00ff00; }
`;

const cardAnimation = keyframes`
  0% { transform: translateY(0) rotate(0); }
  25% { transform: translateY(-5px) rotate(1deg); }
  75% { transform: translateY(5px) rotate(-1deg); }
  100% { transform: translateY(0) rotate(0); }
`;

const packages = [
  {
    name: 'SILVER',
    dailyReturn: 5,
    minAmount: 5,
    maxAmount: 100,
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #FFFFFF 50%, #C0C0C0 100%)'
  },
  {
    name: 'GOLD',
    dailyReturn: 15,
    minAmount: 50,
    maxAmount: 500,
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFF5D4 50%, #FFD700 100%)'
  },
  {
    name: 'PLATINUM',
    dailyReturn: 40,
    minAmount: 100,
    maxAmount: 1000,
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #FFFFFF 50%, #E5E4E2 100%)'
  },
  {
    name: 'DIAMOND',
    dailyReturn: 80,
    minAmount: 200,
    maxAmount: 2000,
    color: '#B9F2FF',
    gradient: 'linear-gradient(135deg, #B9F2FF 0%, #FFFFFF 50%, #B9F2FF 100%)'
  },
  {
    name: 'MASTER',
    dailyReturn: 150,
    minAmount: 500,
    maxAmount: 5000,
    color: '#9400D3',
    gradient: 'linear-gradient(135deg, #9400D3 0%, #E0B0FF 50%, #9400D3 100%)'
  },
  {
    name: 'LEGENDARY',
    dailyReturn: 1000,
    minAmount: 1000,
    maxAmount: 10000,
    color: '#FF4500',
    gradient: 'linear-gradient(135deg, #FF4500 0%, #FFB347 50%, #FF4500 100%)'
  }
];

const Home = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth={false} sx={{ 
      background: '#889799',
      minHeight: '100vh',
      pt: 4,
      pb: 8,
      width: '100vw',
      margin: 0,
      maxWidth: '100%'
    }}>
      <Box sx={{ my: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography 
            variant="h2" 
            align="center" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#fff',
              animation: `${glowAnimation} 3s ease-in-out infinite`,
              textTransform: 'uppercase',
              letterSpacing: '6px',
              mb: 3,
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            Black Key'ə Xoş Gəlmisiniz
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            paragraph
            sx={{ 
              color: '#fff',
              textShadow: '0 0 10px rgba(255,255,255,0.5)',
              fontFamily: "'Quicksand', sans-serif",
              mb: 5
            }}
          >
            Sərmayənizi yatırın, gündəlik qazancınızı toplayın!
          </Typography>
        </motion.div>

        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3 }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    background: 'linear-gradient(45deg, #FF512F 30%, #F09819 90%)',
                    boxShadow: '0 3px 15px rgba(255, 81, 47, 0.5)',
                    padding: '15px 40px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    borderRadius: '30px'
                  }}
                >
                  İndi Başla
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#fff',
                    borderColor: '#fff',
                    borderWidth: '2px',
                    padding: '15px 40px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    borderRadius: '30px',
                    '&:hover': {
                      borderColor: '#FF512F',
                      color: '#FF512F',
                      borderWidth: '2px',
                      background: 'rgba(255, 81, 47, 0.1)'
                    }
                  }}
                >
                  Daxil Ol
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        )}
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {packages.map((pkg, index) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.name}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: pkg.gradient,
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  position: 'relative',
                  animation: `${cardAnimation} 3s ease-in-out infinite`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                    zIndex: 1
                  },
                  '&:hover': {
                    animation: 'none',
                    transform: 'translateY(-10px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: (theme) => `0 12px 40px ${pkg.color}66`
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 2 }}>
                  <Typography 
                    gutterBottom 
                    variant="h3" 
                    component="h2"
                    sx={{ 
                      color: '#000',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      mb: 3,
                      fontFamily: "'Orbitron', sans-serif",
                      textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {pkg.name}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#000',
                      textAlign: 'center',
                      mb: 2,
                      fontWeight: 'bold'
                    }}
                  >
                    Gündəlik Qazanc: {pkg.dailyReturn} AZN
                  </Typography>
                  <Typography sx={{ color: '#000', textAlign: 'center', mb: 1 }}>
                    Minimum Sərmayə: {pkg.minAmount} AZN
                  </Typography>
                  <Typography sx={{ color: '#000', textAlign: 'center', mb: 1 }}>
                    Maksimum Sərmayə: {pkg.maxAmount} AZN
                  </Typography>
                  <Typography sx={{ color: '#000', textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
                    30 günlük kilidli dövr
                  </Typography>
                  <Typography sx={{ color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                    Hər sərmayədə +18 XP
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, position: 'relative', zIndex: 2 }}>
                  <Button 
                    fullWidth 
                    variant="contained"
                    component={RouterLink}
                    to={user ? "/dashboard" : "/register"}
                    sx={{ 
                      background: 'linear-gradient(45deg, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.6) 90%)',
                      color: '#fff',
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: '10px',
                      '&:hover': {
                        background: 'linear-gradient(45deg, rgba(0,0,0,1) 30%, rgba(0,0,0,0.8) 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    {user ? 'Sərmayə Yatır' : 'Qeydiyyatdan Keç'}
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 