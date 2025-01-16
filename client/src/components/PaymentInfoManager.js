import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaCreditCard, FaMobileAlt, FaBitcoin } from 'react-icons/fa';
import './PaymentInfoManager.css';

const PaymentInfoManager = ({ onUpdate }) => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('CREDIT_CARD');
  const [formData, setFormData] = useState({
    CREDIT_CARD: {
      type: 'CREDIT_CARD',
      creditCard: {
        number: '',
        holderName: '',
        bank: ''
      }
    },
    M10: {
      type: 'M10',
      m10: {
        phoneNumber: ''
      }
    },
    CRYPTO: {
      type: 'CRYPTO',
      crypto: {
        address: '',
        currency: 'BTC'
      }
    }
  });

  const fetchCurrentSettings = useCallback(async () => {
    try {
      const response = await api.get('/payment/info');
      
      const newFormData = { ...formData };
      response.data.forEach(item => {
        if (item.type === 'CREDIT_CARD' && item.creditCard) {
          newFormData.CREDIT_CARD.creditCard = item.creditCard;
        } else if (item.type === 'M10' && item.m10) {
          newFormData.M10.m10 = item.m10;
        } else if (item.type === 'CRYPTO' && item.crypto) {
          newFormData.CRYPTO.crypto = item.crypto;
        }
      });
      setFormData(newFormData);
    } catch (error) {
      console.error('Mövcud parametrləri alma xətası:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchCurrentSettings();
  }, [fetchCurrentSettings]);

  const handleSubmit = async (type) => {
    try {
      console.log('Göndərilən məlumat:', formData[type]);
      await api.post('/payment/info', formData[type]);
      alert('Ödəniş məlumatları uğurla yeniləndi');
      await fetchCurrentSettings();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Yeniləmə xətası:', error.response?.data || error);
      alert('Yeniləmə uğursuz oldu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (type, field, value) => {
    setFormData(prev => {
      if (type === 'CREDIT_CARD') {
        return {
          ...prev,
          CREDIT_CARD: {
            ...prev.CREDIT_CARD,
            creditCard: {
              ...prev.CREDIT_CARD.creditCard,
              [field]: value
            }
          }
        };
      } else if (type === 'M10') {
        return {
          ...prev,
          M10: {
            ...prev.M10,
            m10: {
              ...prev.M10.m10,
              [field]: value
            }
          }
        };
      } else if (type === 'CRYPTO') {
        return {
          ...prev,
          CRYPTO: {
            ...prev.CRYPTO,
            crypto: {
              ...prev.CRYPTO.crypto,
              [field]: value
            }
          }
        };
      }
      return prev;
    });
  };

  return (
    <div className="payment-info-manager">
      <div className="tabs">
        <button
          className={activeTab === 'CREDIT_CARD' ? 'active' : ''}
          onClick={() => setActiveTab('CREDIT_CARD')}
        >
          <FaCreditCard /> Kredit Kartı
        </button>
        <button
          className={activeTab === 'M10' ? 'active' : ''}
          onClick={() => setActiveTab('M10')}
        >
          <FaMobileAlt /> M10
        </button>
        <button
          className={activeTab === 'CRYPTO' ? 'active' : ''}
          onClick={() => setActiveTab('CRYPTO')}
        >
          <FaBitcoin /> Kripto
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'CREDIT_CARD' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit('CREDIT_CARD'); }}>
            <div className="form-group">
              <label>Kart Nömrəsi</label>
              <input
                type="text"
                value={formData.CREDIT_CARD.creditCard.number}
                onChange={(e) => handleChange('CREDIT_CARD', 'number', e.target.value)}
                placeholder="4444-8585-6868-5555"
                required
              />
            </div>
            <div className="form-group">
              <label>Kart Sahibi</label>
              <input
                type="text"
                value={formData.CREDIT_CARD.creditCard.holderName}
                onChange={(e) => handleChange('CREDIT_CARD', 'holderName', e.target.value)}
                placeholder="AN*** ****MEH"
                required
              />
            </div>
            <div className="form-group">
              <label>Bank</label>
              <input
                type="text"
                value={formData.CREDIT_CARD.creditCard.bank}
                onChange={(e) => handleChange('CREDIT_CARD', 'bank', e.target.value)}
                placeholder="Kapital Bank"
                required
              />
            </div>
            <button type="submit">
              <FaSave /> Yenilə
            </button>
          </form>
        )}

        {activeTab === 'M10' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit('M10'); }}>
            <div className="form-group">
              <label>Telefon Nömrəsi</label>
              <input
                type="text"
                value={formData.M10.m10.phoneNumber}
                onChange={(e) => handleChange('M10', 'phoneNumber', e.target.value)}
                placeholder="+994 50 550 42 68"
                required
              />
            </div>
            <button type="submit">
              <FaSave /> Yenilə
            </button>
          </form>
        )}

        {activeTab === 'CRYPTO' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit('CRYPTO'); }}>
            <div className="form-group">
              <label>BTC Ünvanı</label>
              <input
                type="text"
                value={formData.CRYPTO.crypto.address}
                onChange={(e) => handleChange('CRYPTO', 'address', e.target.value)}
                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                required
              />
            </div>
            <button type="submit">
              <FaSave /> Yenilə
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentInfoManager; 