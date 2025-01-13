import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ButtonGroup
} from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useAuth } from '../context/AuthContext';
import {
  Dashboard as DashboardIcon,
  AccountBalanceWallet as DepositIcon,
  MonetizationOn as WithdrawIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';
import HistoryIcon from '@mui/icons-material/History';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" sx={{ bgcolor: '#1e1e1e' }}>
      <Toolbar sx={{ pl: '0 !important', bgcolor: '#1e1e1e' }}>
        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: '#ff0000',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            pl: 2,
            minWidth: '250px',
            height: '64px',
            bgcolor: '#1e1e1e',
            fontSize: '1.5rem'
          }}
        >
          <VpnKeyIcon sx={{ mr: 1, fontSize: '1.8rem' }} />
          Black Key
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1, pr: 2 }}>
          {user ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/dashboard"
                startIcon={<DashboardIcon />}
              >
                İdarə Paneli
              </Button>
              <ButtonGroup variant="text" color="inherit">
                <Button
                  component={RouterLink}
                  to="/deposit"
                  startIcon={<DepositIcon />}
                >
                  Pul Yüklə
                </Button>
                <Button
                  component={RouterLink}
                  to="/withdraw"
                  startIcon={<WithdrawIcon />}
                >
                  Pul Çək
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/odeme-tarihcesi"
                  startIcon={<HistoryIcon />}
                >
                  ÖDƏMƏ TARİXÇƏSİ
                </Button>
              </ButtonGroup>
              <Button
                color="inherit"
                component={RouterLink}
                to="/profile"
                startIcon={<ProfileIcon />}
              >
                Profil
              </Button>
              {user.isAdmin && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin"
                  startIcon={<AdminIcon />}
                >
                  Admin Panel
                </Button>
              )}
              <Button
                color="inherit"
                onClick={logout}
                startIcon={<LogoutIcon />}
              >
                Çıxış
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
              >
                Daxil Ol
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
                startIcon={<RegisterIcon />}
              >
                Qeydiyyat
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 