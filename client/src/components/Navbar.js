import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ButtonGroup,
  Container
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
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ bgcolor: '#1e1e1e' }}>
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontWeight: 700,
              color: '#ff0000',
              textDecoration: 'none',
            }}
          >
            Black Key
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {user ? (
              <>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  İDARƏ PANELİ
                </Button>

                <Button
                  component={RouterLink}
                  to="/how-to-earn"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  NECƏ QAZANIRIQ
                </Button>

                <Button
                  component={RouterLink}
                  to="/deposit"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  PUL YÜKLƏ
                </Button>

                <Button
                  component={RouterLink}
                  to="/withdraw"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  PUL ÇƏK
                </Button>

                <Button
                  component={RouterLink}
                  to="/odeme-tarihcesi"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  ÖDƏMƏ TARİXÇƏSİ
                </Button>

                {user.isAdmin && (
                  <Button
                    component={RouterLink}
                    to="/admin"
                    sx={{ color: 'white', textTransform: 'none' }}
                  >
                    ADMİN PANEL
                  </Button>
                )}

                <Button
                  component={RouterLink}
                  to="/profile"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  PROFİL
                </Button>

                <Button
                  onClick={logout}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  ÇIXIŞ
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Giriş
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Qeydiyyat
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 