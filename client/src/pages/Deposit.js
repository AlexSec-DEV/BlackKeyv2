import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './Deposit.css';
import { Button } from '@mui/material';
import { FaCreditCard, FaMobile, FaBitcoin } from 'react-icons/fa';

const Deposit = () => {
  const { user, api } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchPaymentInfo = useCallback(async () => {
    if (!isInitialLoad && loading) return;
    
    try {
      setLoading(true);
      const response = await api.get('/payment/info');
      setPaymentInfo(response.data);
      setError(null);
    } catch (err) {
      console.error('Ödəniş məlumatları yüklənərkən xəta:', err);
      setError('Ödəniş məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [api, loading, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) {
      fetchPaymentInfo();
    }
  }, [fetchPaymentInfo, isInitialLoad]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!amount || amount <= 0) {
      setError('Zəhmət olmasa düzgün məbləğ daxil edin');
      return;
    }

    if (!selectedFile) {
      setError('Zəhmət olmasa ödəniş qəbzini yükləyin');
      return;
    }

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('paymentMethod', paymentMethod);
    formData.append('receipt', selectedFile);

    try {
      setLoading(true);
      const response = await api.post('/transactions/deposit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setSuccess(true);
        setAmount('');
        setSelectedFile(null);
        // Dosya input'unu sıfırla
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (err) {
      console.error('Deposit error:', err);
      setError(err.response?.data?.message || 'Balans artırma əməliyyatı uğursuz oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePaymentMethodChange = (newMethod) => {
    setPaymentMethod(newMethod);
    fetchPaymentInfo();
  };

  const renderPaymentDetails = () => {
    if (!paymentInfo) return null;

    const info = paymentInfo.find(item => item.type === paymentMethod);
    if (!info) return null;

    switch (paymentMethod) {
      case 'CREDIT_CARD':
        return (
          <div className="credit-card">
            <div className="card-bank">{info.creditCard?.bank || 'Bank məlumatı gözlənilir'}</div>
            <div className="card-number">{info.creditCard?.number || '****-****-****-****'}</div>
            <div className="card-holder">{info.creditCard?.holderName || 'KART SAHİBİ'}</div>
          </div>
        );
      case 'M10':
        return (
          <div className="m10-info">
            <h3>M10 Hesab Nömrəsi</h3>
            <p>{info.m10?.phoneNumber || 'Telefon nömrəsi gözlənilir'}</p>
          </div>
        );
      case 'CRYPTO':
        return (
          <div className="crypto-info">
            <h3>BTC Ünvanı</h3>
            <p>{info.crypto?.address || 'BTC ünvanı gözlənilir'}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && isInitialLoad) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Yüklənir...
      </div>
    );
  }

  return (
    <div className="deposit-container">
      <h2>Balans Artır</h2>
      <p className="current-balance">Mövcud Balans: {user.balance} AZN</p>

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
          Balans artırma tələbi uğurla göndərildi
        </div>
      )}

      <form onSubmit={handleSubmit} className="deposit-form">
        <div className="payment-methods">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              value="CREDIT_CARD"
              checked={paymentMethod === 'CREDIT_CARD'}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            />
            <FaCreditCard style={{ fontSize: '20px' }} />
            Kredit Kartı
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              value="M10"
              checked={paymentMethod === 'M10'}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            />
            <FaMobile style={{ fontSize: '20px' }} />
            M10
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              value="CRYPTO"
              checked={paymentMethod === 'CRYPTO'}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            />
            <FaBitcoin style={{ fontSize: '20px' }} />
            Kripto
          </label>
        </div>

        <div className="payment-details">
          {renderPaymentDetails()}
        </div>

        <div className="form-group">
          <label>Yüklənəcək Məbləğ (AZN)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Qəbz Yüklə</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          disabled={loading}
          sx={{
            mt: 2,
            py: 1.5,
            fontSize: '1rem',
            backgroundColor: '#2196f3',
            '&:hover': {
              backgroundColor: '#1976d2'
            }
          }}
        >
          {loading ? 'YÜKLƏNIR...' : 'BALANS ARTIR'}
        </Button>
      </form>
    </div>
  );
};

export default Deposit; 