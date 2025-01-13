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
      setInvestments(res.data);
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

  const totalDailyReturn = investments.reduce((total, inv) => total + inv.dailyReturn, 0);
  const totalMonthlyReturn = totalDailyReturn * 30;
  const totalInvestments = investments.length;

  const getProfileImageUrl = () => {
    if (!user?.profileImage || user.profileImage === 'default-avatar.png') {
      return '/default-avatar.png';
    }
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/profile/${user.profileImage}`;
    console.log('Sidebar Avatar URL:', imageUrl);
    return imageUrl;
  };

  return (
    <div className="sidebar">
      <Paper
        sx={{
          width: 240,
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
            width: 120,
            height: 120,
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

        <Typography variant="h6" gutterBottom>
          Xoş gəlmisiniz, {user?.username}
        </Typography>

        <Box sx={{ width: '100%', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccountBalanceWalletIcon sx={{ mr: 1, color: '#4caf50' }} />
            <Typography variant="subtitle1">
              Balans: {Number(user?.balance).toFixed(2)} AZN
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ mr: 1, color: '#ffd700' }} />
              <Typography variant="body2" color="textSecondary">
                XP: {user?.xp || 0}/{user?.nextLevelXp || 100}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                Səviyyə: {user?.level || 1}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((user?.xp || 0) / (user?.nextLevelXp || 100)) * 100}
              sx={{ height: 8, borderRadius: 1 }}
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
    </div>
  );
};

export default Sidebar; 