import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    totalInvestmentAmount: 0
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanicilar yuklenirken bir hata olustu');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/deposits');
      setDeposits(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Para yatirma islemleri yuklenirken bir hata olustu');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/withdrawals');
      setWithdrawals(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Para cekme islemleri yuklenirken bir hata olustu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Istatistikler yuklenirken hata:', err);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      setLoading(true);
      await api.put(`/admin/users/${userId}/block`, { isBlocked });
      setSuccess(`Kullanici ${isBlocked ? 'engellendi' : 'engeli kaldirildi'}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Islem sirasinda bir hata olustu');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositAction = async (depositId, action) => {
    try {
      setLoading(true);
      await api.post(`/admin/deposits/${depositId}/${action}`);
      setSuccess(`Para yatirma islemi ${action === 'approve' ? 'onaylandi' : 'reddedildi'}`);
      fetchDeposits();
    } catch (err) {
      setError(err.response?.data?.message || 'Islem sirasinda bir hata olustu');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (withdrawalId, action) => {
    try {
      setLoading(true);
      await api.post(`/admin/withdrawals/${withdrawalId}/${action}`);
      setSuccess(`Para cekme islemi ${action === 'approve' ? 'onaylandi' : 'reddedildi'}`);
      fetchWithdrawals();
    } catch (err) {
      setError(err.response?.data?.message || 'Islem sirasinda bir hata olustu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDeposits();
    fetchWithdrawals();
    fetchStats();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const renderUsers = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Kullanici Adi</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Bakiye</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Islemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.balance} AZN</TableCell>
              <TableCell>{user.isBlocked ? 'Engelli' : 'Aktif'}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color={user.isBlocked ? 'success' : 'error'}
                  onClick={() => handleBlockUser(user._id, !user.isBlocked)}
                  disabled={loading}
                >
                  {user.isBlocked ? 'Engeli Kaldir' : 'Engelle'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDeposits = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Kullanici</TableCell>
            <TableCell>Miktar</TableCell>
            <TableCell>Tarih</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Islemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deposits.map((deposit) => (
            <TableRow key={deposit._id}>
              <TableCell>{deposit.user?.username}</TableCell>
              <TableCell>{deposit.amount} AZN</TableCell>
              <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
              <TableCell>{deposit.status}</TableCell>
              <TableCell>
                {deposit.status === 'PENDING' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleDepositAction(deposit._id, 'approve')}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDepositAction(deposit._id, 'reject')}
                      disabled={loading}
                    >
                      Reddet
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderWithdrawals = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Kullanici</TableCell>
            <TableCell>Miktar</TableCell>
            <TableCell>Tarih</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Islemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {withdrawals.map((withdrawal) => (
            <TableRow key={withdrawal._id}>
              <TableCell>{withdrawal.user?.username}</TableCell>
              <TableCell>{withdrawal.amount} AZN</TableCell>
              <TableCell>{new Date(withdrawal.createdAt).toLocaleString()}</TableCell>
              <TableCell>{withdrawal.status}</TableCell>
              <TableCell>
                {withdrawal.status === 'PENDING' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleWithdrawalAction(withdrawal._id, 'approve')}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleWithdrawalAction(withdrawal._id, 'reject')}
                      disabled={loading}
                    >
                      Reddet
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Admin Paneli
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{stats.totalUsers}</Typography>
                <Typography color="textSecondary">Toplam Kullanici</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{stats.totalInvestments}</Typography>
                <Typography color="textSecondary">Toplam Yatirim</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{stats.activeInvestments}</Typography>
                <Typography color="textSecondary">Aktif Yatirim</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{stats.totalInvestmentAmount} AZN</Typography>
                <Typography color="textSecondary">Toplam Yatirim Tutari</Typography>
              </Paper>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Kullanicilar" />
              <Tab label="Para Yatirma Islemleri" />
              <Tab label="Para Cekme Islemleri" />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {activeTab === 0 && renderUsers()}
              {activeTab === 1 && renderDeposits()}
              {activeTab === 2 && renderWithdrawals()}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminPanel; 