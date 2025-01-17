import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Withdraw = () => {
  const { user, api, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [withdrawMethod, setWithdrawMethod] = useState('CREDIT_CARD');
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountHolder: '',
    cardNumber: '',
    m10AccountNumber: '',
    cryptoAddress: '',
    cryptoNetwork: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleWithdrawMethodChange = (e) => {
    setWithdrawMethod(e.target.value);
    setFormData({
      ...formData,
      bankName: '',
      accountHolder: '',
      cardNumber: '',
      m10AccountNumber: '',
      cryptoAddress: '',
      cryptoNetwork: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (parseFloat(formData.amount) < 10) {
        setError('Minimum çəkim miqdarı 10 AZN');
        return;
      }

      if (parseFloat(formData.amount) > user.balance) {
        setError('Yetərsiz vəsait');
        return;
      }

      let details = {};
      if (withdrawMethod === 'CREDIT_CARD') {
        details = {
          bankName: formData.bankName,
          accountHolder: formData.accountHolder,
          cardNumber: formData.cardNumber
        };
      } else if (withdrawMethod === 'M10') {
        details = {
          m10AccountNumber: formData.m10AccountNumber
        };
      } else {
        details = {
          cryptoAddress: formData.cryptoAddress,
          cryptoNetwork: formData.cryptoNetwork
        };
      }

      const withdrawData = {
        amount: parseFloat(formData.amount),
        type: 'WITHDRAWAL',
        method: withdrawMethod,
        paymentMethod: withdrawMethod,
        transactionDetails: details
      };

      console.log('Para çekme verisi:', withdrawData);

      const res = await api.post('/transactions/withdraw', withdrawData);
      console.log('Para çekme cevabı:', res.data);
      await loadUser();
      setSuccess('Çıxarma sorğunuz uğurla yaradıldı, əməliyyatınız təsdiqləndikdən sonra tamamlanacaq');
      setFormData({
        amount: '',
        bankName: '',
        accountHolder: '',
        cardNumber: '',
        m10AccountNumber: '',
        cryptoAddress: '',
        cryptoNetwork: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Çıxarma prosesi zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, bgcolor: '#1e1e1e', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Pul Çək
          </Typography>

          <Typography variant="h6" gutterBottom>
            Mevcut Balans: {user?.balance || 0} AZN
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Minimum çəkim : 10 AZN
          </Typography>

          {error && (
            <div className="error-message" style={{
              backgroundColor: '#ff5252',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '500',
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease-in-out'
            }}>
              <span style={{ marginRight: '10px' }}>✓</span>
              Çıxarma sorğunuz uğurla yaradıldı, əməliyyatınız təsdiqlənindən sonra tamamlanacaq
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Çəkiləcək Məbləğ (AZN)"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ style: { color: 'white' } }}
                  sx={{ input: { color: 'white' } }}
                />
                <Typography variant="caption" color="textSecondary">
                  Maksimum: {user?.balance || 0} AZN
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ color: 'white' }}>Çekim Yöntemi</FormLabel>
                  <RadioGroup
                    row
                    name="withdrawMethod"
                    value={withdrawMethod}
                    onChange={handleWithdrawMethodChange}
                  >
                    <FormControlLabel
                      value="CREDIT_CARD"
                      control={<Radio />}
                      label="Karta Köçürmə"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      value="M10"
                      control={<Radio />}
                      label="M10"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      value="CRYPTO"
                      control={<Radio />}
                      label="Kripto Para"
                      sx={{ color: 'white' }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {withdrawMethod === 'CREDIT_CARD' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bank Adı"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                      InputLabelProps={{ style: { color: 'white' } }}
                      sx={{ input: { color: 'white' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hesap Sahibi"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleChange}
                      required
                      InputLabelProps={{ style: { color: 'white' } }}
                      sx={{ input: { color: 'white' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kart Nömrəsi"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                      placeholder="XXXX XXXX XXXX XXXX"
                      InputLabelProps={{ style: { color: 'white' } }}
                      sx={{ input: { color: 'white' } }}
                    />
                  </Grid>
                </>
              )}

              {withdrawMethod === 'M10' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="M10 Hesab Nömrəsi"
                    name="m10AccountNumber"
                    value={formData.m10AccountNumber}
                    onChange={handleChange}
                    required
                    placeholder="+994 XX XXX XX XX"
                    InputLabelProps={{ style: { color: 'white' } }}
                    sx={{ input: { color: 'white' } }}
                  />
                </Grid>
              )}

              {withdrawMethod === 'CRYPTO' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kripto Cüzdan Adresi"
                      name="cryptoAddress"
                      value={formData.cryptoAddress}
                      onChange={handleChange}
                      required
                      InputLabelProps={{ style: { color: 'white' } }}
                      sx={{ input: { color: 'white' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ağ (Network)"
                      name="cryptoNetwork"
                      value={formData.cryptoNetwork}
                      onChange={handleChange}
                      required
                      InputLabelProps={{ style: { color: 'white' } }}
                      sx={{ input: { color: 'white' } }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading || !user?.balance || user?.balance < 10}
                >
                  {loading ? 'İşleniyor...' : 'Pulu Çək'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Withdraw; 