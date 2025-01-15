import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import ChestImage from '../components/ChestImage';
import { useAuth } from '../context/AuthContext';
import MobileHeader from '../components/MobileHeader';
import axios from 'axios';

const packages = [
  {
    name: 'SILVER',
    displayName: 'Silver Kasa',
    dailyReturn: 5,
    minAmount: 5,
    maxAmount: 100,
    percentage: '7%',
    color: '#9b59b6',
    buttonColor: 'rgba(155, 89, 182, 0.5)'
  },
  {
    name: 'GOLD',
    displayName: 'Gold Kasa',
    dailyReturn: 15,
    minAmount: 100,
    maxAmount: 500,
    percentage: '10%',
    color: '#f1c40f',
    buttonColor: 'rgba(241, 196, 15, 0.5)'
  },
  {
    name: 'PLATINUM',
    displayName: 'Platinum Kasa',
    dailyReturn: 40,
    minAmount: 500,
    maxAmount: 1000,
    percentage: '16%',
    color: '#bdc3c7',
    buttonColor: 'rgba(189, 195, 199, 0.5)'
  },
  {
    name: 'DIAMOND',
    displayName: 'Diamond Kasa',
    dailyReturn: 80,
    minAmount: 1000,
    maxAmount: 5000,
    percentage: '25%',
    color: '#00bcd4',
    buttonColor: 'rgba(0, 188, 212, 0.5)'
  },
  {
    name: 'MASTER',
    displayName: 'Master Kasa',
    dailyReturn: 150,
    minAmount: 5000,
    maxAmount: 10000,
    percentage: '34%',
    color: '#9c27b0',
    buttonColor: 'rgba(156, 39, 176, 0.5)'
  },
  {
    name: 'ELITE',
    displayName: 'Elite Kasa',
    dailyReturn: 1000,
    minAmount: 10000,
    maxAmount: 20000,
    percentage: '40%',
    color: '#ff6b6b',
    buttonColor: 'rgba(255, 107, 107, 0.5)'
  }
];

const Dashboard = () => {
  const { api, loadUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState(null);
  const [calculatedReturns, setCalculatedReturns] = useState({
    daily: 0,
    monthly: 0,
    total: 0
  });

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/fake-stats');
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('İstatistikler yüklenirken hata:', err);
    }
  }, [api]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const loadInvestments = async () => {
    try {
      const response = await axios.get(`${API_URL}/investments/my`);
      setInvestments(response.data.investments || []);
      // Kullanıcı bakiyesini güncelle
      if (user) {
        setUser(prevUser => ({
          ...prevUser,
          balance: response.data.balance
        }));
      }
    } catch (error) {
      console.error('Yatırımları yükleme hatası:', error);
      setError('Yatırımlar yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    loadInvestments();
    const interval = setInterval(() => {
      loadInvestments();
    }, 1000);
    return () => clearInterval(interval);
  }, [loadInvestments]);

  // Yatırım miktarı değiştiğinde kazanç hesaplama
  useEffect(() => {
    if (selectedPackage && investmentAmount) {
      const amount = parseFloat(investmentAmount);
      if (!isNaN(amount)) {
        // Günlük kazanç = Yatırım × 0.01 (1%)
        const dailyReturn = amount * 0.01;
        
        // Aylık kazanç = Günlük kazanç × 30
        const monthlyReturn = dailyReturn * 30;

        // Toplam kazanç = Aylık kazanç + Yatırım sermayesi
        const totalReturn = monthlyReturn + amount;

        setCalculatedReturns({
          daily: dailyReturn.toFixed(2),
          monthly: monthlyReturn.toFixed(2),
          total: totalReturn.toFixed(2)
        });
      }
    } else {
      setCalculatedReturns({ daily: 0, monthly: 0, total: 0 });
    }
  }, [selectedPackage, investmentAmount]);

  const handleInvestmentSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post('/investments', {
        type: selectedPackage.name,
        amount: Number(investmentAmount)
      });
      await loadInvestments();
      await loadUser();
      setSelectedPackage(null);
      setInvestmentAmount('');
      setCalculatedReturns({ daily: 0, monthly: 0, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Sərmayə edilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Toplam günlük kazanç hesaplama ve gösterme
  const totalDailyReturn = Array.isArray(investments) ? investments.reduce((total, inv) => total + inv.dailyReturn, 0) : 0;
  const totalMonthlyReturn = totalDailyReturn * 30;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      bgcolor: '#889799', 
      minHeight: '100vh'
    }}>
      <MobileHeader 
        totalDailyReturn={totalDailyReturn}
        totalMonthlyReturn={totalMonthlyReturn}
        totalInvestments={investments.length}
        stats={stats}
      />
      <Sidebar 
        totalDailyReturn={totalDailyReturn} 
        totalMonthlyReturn={totalMonthlyReturn} 
      />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: '#889799',
          width: { xs: '100%', md: 'calc(100% - 240px)' }
        }}
      >
        <Container maxWidth={false}>
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            {investments.length > 0 && (
              <>
                <Box
                  sx={{
                    bgcolor: '#2196f3',
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 2,
                    mb: { xs: 2, md: 4 },
                    width: '100%'
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    Mövcud Kasalarım
                  </Typography>
                </Box>

                <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
                  {investments.map((investment) => {
                    const pkg = packages.find(p => p.name === investment.type);
                    const now = new Date();
                    const startDate = new Date(investment.startDate);
                    const endDate = new Date(investment.endDate);
                    
                    // Milisaniye cinsinden geçen ve toplam süreyi hesapla
                    const totalTime = endDate.getTime() - startDate.getTime();
                    const passedTime = now.getTime() - startDate.getTime();
                    
                    // İlerleme yüzdesini hesapla
                    const progress = Math.min(100, Math.max(0, (passedTime / totalTime) * 100));
                    
                    // Kalan süreyi hesapla (milisaniyeyi güne çevir)
                    const remainingTime = endDate.getTime() - now.getTime();
                    const remainingDays = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
                    
                    const monthlyReturn = investment.dailyReturn * 30;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={investment._id}>
                        <Card
                          sx={{
                            bgcolor: pkg?.color || '#1e1e1e',
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'hidden',
                            height: '220px'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: 1,
                              fontWeight: 'bold',
                              zIndex: 2
                            }}
                          >
                            {pkg?.percentage}
                          </Box>
                          <CardContent sx={{ p: 2, height: '100%', position: 'relative' }}>
                            <Box sx={{ mb: 3, position: 'relative', zIndex: 2 }}>
                              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                {pkg?.displayName}
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                Sərmayə: {investment.amount} AZN
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                Gündəlik Qazanc: {Number(investment.dailyReturn).toFixed(2)} AZN
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                Aylıq Qazanc: {Number(monthlyReturn).toFixed(2)} AZN
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                Qalan Müddət: {remainingDays} gün
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                Vəziyyət: {remainingDays > 0 ? 'Kilidli' : 'Tamamlandı'}
                              </Typography>
                            </Box>

                            <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 8,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: '#fff'
                                  }
                                }}
                              />
                              <Typography sx={{ color: '#fff', fontSize: '0.8rem', mt: 1, textAlign: 'center' }}>
                                {Math.round(progress)}% Tamamlandı
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-80%)',
                                zIndex: 1
                              }}
                            >
                              <ChestImage type={investment.type} size={100} />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            )}

            <Box
              sx={{
                bgcolor: '#2196f3',
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                mb: { xs: 2, md: 4 },
                width: '100%'
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}
              >
                Yeni Kasa Aç
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {packages.map((pkg) => (
                <Grid item xs={12} sm={6} md={4} key={pkg.name}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      bgcolor: pkg.color,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s',
                      height: '200px',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 1,
                        fontWeight: 'bold',
                        zIndex: 2
                      }}
                    >
                      {pkg.percentage}
                    </Box>
                    <CardContent sx={{ p: 2, height: '100%', position: 'relative' }}>
                      <Box sx={{ mb: 3, position: 'relative', zIndex: 2 }}>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                          {pkg.displayName}
                        </Typography>
                        <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                          Min Sərmayə: {pkg.minAmount} AZN
                        </Typography>
                        <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                          Max Sərmayə: {pkg.maxAmount} AZN
                        </Typography>
                      </Box>

                      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{
                            bgcolor: '#9c27b0',
                            color: '#fff',
                            '&:hover': {
                              bgcolor: '#7b1fa2'
                            }
                          }}
                        >
                          SATIN AL
                        </Button>
                      </Box>

                      <Box
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-80%)',
                          zIndex: 1
                        }}
                      >
                        <ChestImage type={pkg.name} size={100} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Dialog open={!!selectedPackage} onClose={() => setSelectedPackage(null)}>
        <DialogTitle>
          {selectedPackage?.displayName} Satın Al
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Sərmayə Miqdarı (AZN)"
            type="number"
            fullWidth
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            InputProps={{
              inputProps: {
                min: selectedPackage?.minAmount,
                max: selectedPackage?.maxAmount
              }
            }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Sərmayə aralığı: {selectedPackage?.minAmount}-{selectedPackage?.maxAmount} AZN
          </Typography>
          
          {calculatedReturns.daily > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
              <Typography variant="body1" color="primary" gutterBottom>
                Gözlənilən Qazanc:
              </Typography>
              <Typography variant="body2">
                Gündəlik: {calculatedReturns.daily} AZN
              </Typography>
              <Typography variant="body2">
                Aylıq: {calculatedReturns.monthly} AZN
              </Typography>
              <Typography variant="body2">
                Ümumi Məbləğ: {calculatedReturns.total} AZN
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPackage(null)}>İmtina</Button>
          <Button 
            onClick={handleInvestmentSubmit} 
            disabled={loading || !investmentAmount || 
              Number(investmentAmount) < selectedPackage?.minAmount ||
              Number(investmentAmount) > selectedPackage?.maxAmount}
          >
            {loading ? 'Gözləyin...' : 'Sərmayə Et'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 