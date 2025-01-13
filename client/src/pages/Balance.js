import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Balance = () => {
  const { user, api, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [depositDialog, setDepositDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [formData, setFormData] = useState({
    depositAmount: '',
    depositTransactionId: '',
    withdrawAmount: '',
    withdrawWalletAddress: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleDeposit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/balance/deposit', {
        amount: parseFloat(formData.depositAmount),
        transactionId: formData.depositTransactionId
      });

      await loadUser();
      setSuccess(res.data.message);
      setDepositDialog(false);
      setFormData({
        ...formData,
        depositAmount: '',
        depositTransactionId: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Bakiye yükleme sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/balance/withdraw', {
        amount: parseFloat(formData.withdrawAmount),
        walletAddress: formData.withdrawWalletAddress
      });

      await loadUser();
      setSuccess(res.data.message);
      setWithdrawDialog(false);
      setFormData({
        ...formData,
        withdrawAmount: '',
        withdrawWalletAddress: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Bakiye çekme sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bakiye İşlemleri
          </Typography>

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

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Mevcut Bakiye: {user?.balance} AZN
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setDepositDialog(true)}
                disabled={loading}
              >
                Bakiye Yükle
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => setWithdrawDialog(true)}
                disabled={loading || !user?.balance || user?.balance < 10}
              >
                Bakiye Çek
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Bakiye Yükleme Yöntemleri
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Banka Havalesi"
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textSecondary">
                        Banka: Example Bank<br />
                        IBAN: AZ00 0000 0000 0000 0000 0000 0000<br />
                        Alıcı: Mining Farm Ltd.
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Box>

      {/* Bakiye Yükleme Dialog */}
      <Dialog open={depositDialog} onClose={() => setDepositDialog(false)}>
        <DialogTitle>Bakiye Yükle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Miktar (AZN)"
              name="depositAmount"
              type="number"
              value={formData.depositAmount}
              onChange={handleChange}
              sx={{ mb: 2 }}
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="İşlem/Havale Numarası"
              name="depositTransactionId"
              value={formData.depositTransactionId}
              onChange={handleChange}
              helperText="Banka havalesi yaparken açıklama kısmına yazdığınız numara"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialog(false)}>
            İptal
          </Button>
          <Button
            onClick={handleDeposit}
            variant="contained"
            disabled={loading || !formData.depositAmount || !formData.depositTransactionId}
          >
            {loading ? 'İşleniyor...' : 'Yükle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bakiye Çekme Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)}>
        <DialogTitle>Bakiye Çek</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Miktar (AZN)"
              name="withdrawAmount"
              type="number"
              value={formData.withdrawAmount}
              onChange={handleChange}
              sx={{ mb: 2 }}
              inputProps={{ min: 10, max: user?.balance }}
              helperText={`Minimum çekim miktarı: 10 AZN, Maksimum: ${user?.balance} AZN`}
            />
            <TextField
              fullWidth
              label="Cüzdan Adresi"
              name="withdrawWalletAddress"
              value={formData.withdrawWalletAddress}
              onChange={handleChange}
              helperText="Ödeme alacağınız IBAN veya kripto cüzdan adresi"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>
            İptal
          </Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            disabled={
              loading ||
              !formData.withdrawAmount ||
              !formData.withdrawWalletAddress ||
              parseFloat(formData.withdrawAmount) < 10 ||
              parseFloat(formData.withdrawAmount) > user?.balance
            }
          >
            {loading ? 'İşleniyor...' : 'Çek'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Balance; 