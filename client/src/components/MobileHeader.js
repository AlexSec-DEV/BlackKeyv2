import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';

const MobileHeader = ({ totalDailyReturn, totalMonthlyReturn, totalInvestments, stats }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <AppBar position="fixed" sx={{ bgcolor: '#1e1e1e', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Black Key
          </Typography>
          <Avatar
            src={user?.profileImage}
            alt={user?.username}
            sx={{ width: 32, height: 32 }}
          />
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer */}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
        >
          <Box sx={{ p: 2, bgcolor: '#1e1e1e', color: 'white' }}>
            <Avatar
              src={user?.profileImage}
              alt={user?.username}
              sx={{ width: 80, height: 80, mb: 2, border: '3px solid #2196f3' }}
            />
            <Typography variant="h6" gutterBottom>
              {user?.username}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="subtitle1">
                  Balans: {Number(user?.balance).toFixed(2)} AZN
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
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
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <MonetizationOnIcon sx={{ color: '#4caf50' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Gündəlik Qazanc"
                secondary={`${Number(totalDailyReturn).toFixed(2)} AZN`}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CalendarMonthIcon sx={{ color: '#f44336' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Aylıq Qazanc"
                secondary={`${Number(totalMonthlyReturn).toFixed(2)} AZN`}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Inventory2Icon sx={{ color: '#ff9800' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Ümumi Kasa"
                secondary={totalInvestments}
              />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem>
              <ListItemIcon>
                <PeopleIcon sx={{ color: '#2196f3' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Qeydiyyatdan keçənlər"
                secondary={stats?.totalUsers || 0}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <PersonIcon sx={{ color: '#4caf50' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Aktiv olanlar"
                secondary={stats?.activeUsers || 0}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccountBalanceIcon sx={{ color: '#ff9800' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Yatırılan məbləğ"
                secondary={`${stats?.totalInvestment || 0} manat`}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <PaymentsIcon sx={{ color: '#f44336' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Ödənilən məbləğ"
                secondary={`${stats?.totalPayout || 0} manat`}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MobileHeader; 