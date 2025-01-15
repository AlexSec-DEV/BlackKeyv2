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
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarIcon from '@mui/icons-material/Star';

const MobileHeader = () => {
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
      <AppBar position="fixed" sx={{ bgcolor: '#1e1e1e' }}>
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
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 2, bgcolor: '#1e1e1e', color: 'white' }}>
            <Avatar
              src={user?.profileImage}
              alt={user?.username}
              sx={{ width: 64, height: 64, mb: 1 }}
            />
            <Typography variant="h6">
              {user?.username}
            </Typography>
          </Box>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccountBalanceWalletIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Balans"
                secondary={`${Number(user?.balance).toFixed(2)} AZN`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <StarIcon sx={{ color: '#ffd700' }} />
              </ListItemIcon>
              <ListItemText 
                primary={`Səviyyə ${user?.level || 1}`}
                secondary={`XP: ${user?.xp || 0}/${user?.nextLevelXp || 100}`}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MobileHeader; 