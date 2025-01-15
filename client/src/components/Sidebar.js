import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Divider,
  LinearProgress
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, api } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [avatarKey, setAvatarKey] = useState(0);
  const [stats, setStats] = useState(null);

  const loadInvestments = useCallback(async () => {
    try {
      const res = await api.get('/investments/my');
      setInvestments(res.data.investments || []);
    } catch (err) {
      console.error('Yatırımlar yüklenirken hata:', err);
    }
  }, [api]);

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
    loadInvestments();
    loadStats();
    
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadInvestments, loadStats]);

  useEffect(() => {
    setAvatarKey(prev => prev + 1);
  }, [user?.profileImage]);

  const totalDailyReturn = Array.isArray(investments) ? investments.reduce((total, inv) => total + inv.dailyReturn, 0) : 0;
  const totalMonthlyReturn = totalDailyReturn * 30;
  const totalInvestments = Array.isArray(investments) ? investments.length : 0;

  const getProfileImageUrl = () => {
    if (!user?.profileImage) {
      return '/default-avatar.png';
    }
    console.log('Sidebar Avatar URL:', user.profileImage);
    return user.profileImage;
  };

  return (
    <Box 
      className="sidebar"
      sx={{ 
        display: { xs: 'none', md: 'block' },
        position: { md: 'sticky' },
        top: 0,
        height: '100vh'
      }}
    >
      <Paper
        sx={{
          width: { xs: '100%', md: 240 },
          height: '100%',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 3,
          bgcolor: '#1e1e1e',
          overflowY: 'auto'
        }}
      >
        <Box
          sx={{
            width: { xs: 80, md: 120 },
            height: { xs: 80, md: 120 },
            position: 'relative',
            mb: 2
          }}
        >
          <Avatar
            key={avatarKey}
            src={getProfileImageUrl()}
            alt={user?.username || 'Profil'}
            sx={{
              width: '100%',
              height: '100%',
              border: '3px solid #2196f3',
              backgroundColor: '#1e1e1e'
            }}
          />
        </Box>

        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}
        >
          Xoş gəlmisiniz, {user?.username}
        </Typography>

        <Box sx={{ width: '100%', p: { xs: 1, md: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccountBalanceWalletIcon sx={{ mr: 1, color: '#4caf50' }} />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              Balans: {Number(user?.balance).toFixed(2)} AZN
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ mr: 1, color: '#ffd700' }} />
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}
              >
                XP: {user?.xp || 0}/{user?.nextLevelXp || 100}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  ml: 'auto', 
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}
              >
                Səviyyə: {user?.level || 1}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((user?.xp || 0) / (user?.nextLevelXp || 100)) * 100}
              sx={{ height: { xs: 6, md: 8 }, borderRadius: 1 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MonetizationOnIcon sx={{ mr: 1, color: '#4caf50' }} />
            <Typography variant="body2">
              Gündəlik Qazanc: {Number(totalDailyReturn).toFixed(2)} AZN
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarMonthIcon sx={{ mr: 1, color: '#f44336' }} />
            <Typography variant="body2">
              Aylıq Qazanc: {Number(totalMonthlyReturn).toFixed(2)} AZN
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Inventory2Icon sx={{ mr: 1, color: '#ff9800' }} />
            <Typography variant="body2">
              Ümumi Kasa: {totalInvestments}
            </Typography>
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1, color: '#2196f3' }} />
              <Typography variant="body2" color="textSecondary">
                Qeydiyyatdan keçənlər: {stats?.totalUsers || 0}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon sx={{ mr: 1, color: '#4caf50' }} />
              <Typography variant="body2" color="textSecondary">
                Aktiv olanlar: {stats?.activeUsers || 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalanceIcon sx={{ mr: 1, color: '#ff9800' }} />
              <Typography variant="body2" color="textSecondary">
                Yatırılan məbləğ: {stats?.totalInvestment || 0} manat
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PaymentsIcon sx={{ mr: 1, color: '#f44336' }} />
              <Typography variant="body2" color="textSecondary">
                Ödənilən məbləğ: {stats?.totalPayout || 0} manat
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Sidebar; 