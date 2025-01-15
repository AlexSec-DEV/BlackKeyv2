import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaTimesCircle, FaCog, FaChartBar } from 'react-icons/fa';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Chip, 
  Typography,
  Modal,
  Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentInfoManager from '../components/PaymentInfoManager';
import './AdminPanel.css';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto'
};

const AdminPanel = () => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('USERS');
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fakeStats, setFakeStats] = useState({
    totalUsers: 5698,
    activeUsers: 1756,
    totalInvestment: 96854,
    totalPayout: 25356
  });

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, depositsRes, withdrawalsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/deposits'),
        api.get('/admin/withdrawals')
      ]);

      setUsers(usersRes.data);
      setDeposits(depositsRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (error) {
      console.error('Data fetching error:', error.response?.data || error);
    }
  }, [api]);

  const loadFakeStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/fake-stats');
      if (res.data) {
        setFakeStats(res.data);
      }
    } catch (err) {
      console.error('Fake istatistikler yüklenirken hata:', err);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
    loadFakeStats();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData, loadFakeStats]);

  const handleFakeStatsUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/admin/fake-stats', fakeStats);
      if (response.data) {
        setFakeStats(response.data);
        alert('İstatistikler başarıyla güncellendi');
      }
    } catch (err) {
      console.error('İstatistikler güncellenirken hata:', err);
      alert('İstatistikler güncellenirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAction = async (type, id, action) => {
    try {
      let response;
      if (type === 'DEPOSIT') {
        response = await api.post(`/admin/deposits/${id}/${action.toLowerCase()}`);
      } else if (type === 'WITHDRAWAL') {
        response = await api.post(`/admin/withdrawals/${id}/${action.toLowerCase()}`);
      } else if (type === 'USER') {
        response = await api.post(`/admin/users/${id}/block`, {
          action: action.toLowerCase()
        });
      }
      
      if (response?.data?.message) {
        alert(response.data.message);
      } else if (type === 'USER') {
        alert(action === 'BLOCK' ? 'Kullanıcı engellendi' : 'Kullanıcının engeli kaldırıldı');
      } else {
        alert(action === 'APPROVE' ? 'İşlem onaylandı' : 'İşlem reddedildi');
      }
      
      fetchData();
    } catch (error) {
      console.error('Action error:', error);
      alert('Hata: ' + (error.response?.data?.message || 'İşlem sırasında bir hata oluştu'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Gözləmədə';
      case 'APPROVED':
        return 'Təsdiqləndi';
      case 'REJECTED':
        return 'Rədd edildi';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <PendingIcon />;
      case 'APPROVED':
        return <CheckCircleIcon />;
      case 'REJECTED':
        return <CancelIcon />;
      default:
        return null;
    }
  };

  const renderWithdrawalDetails = (withdrawal) => {
    console.log('Complete withdrawal data:', withdrawal);
    console.log('Transaction details:', withdrawal.transactionDetails);

    const method = withdrawal.paymentMethod;
    const details = withdrawal.transactionDetails || {};

    if (!details || Object.keys(details).length === 0) {
      return 'Detay bulunmuyor';
    }

    if (method === 'CREDIT_CARD') {
      return (
        <>
          <Typography variant="body2">Banka: {details.bankName || withdrawal.bankName || 'Belirtilmemiş'}</Typography>
          <Typography variant="body2">Hesap Sahibi: {details.accountHolder || withdrawal.accountHolder || 'Belirtilmemiş'}</Typography>
          <Typography variant="body2">Kart No: {details.cardNumber || withdrawal.cardNumber || 'Belirtilmemiş'}</Typography>
        </>
      );
    } else if (method === 'M10') {
      return (
        <>
          <Typography variant="body2">M10 Hesab: {details.m10AccountNumber || withdrawal.m10AccountNumber || 'Belirtilmemiş'}</Typography>
        </>
      );
    } else if (method === 'CRYPTO') {
      return (
        <>
          <Typography variant="body2">Adres: {details.cryptoAddress || withdrawal.cryptoAddress || 'Belirtilmemiş'}</Typography>
          <Typography variant="body2">Ağ: {details.cryptoNetwork || withdrawal.cryptoNetwork || 'Belirtilmemiş'}</Typography>
        </>
      );
    }

    return 'Bilinmeyen ödeme yöntemi';
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="stats-container">
        <div className="stat-box">
          <h3>Ümumi İstifadəçi</h3>
          <p>{users.length}</p>
        </div>
        <div className="stat-box">
          <h3>Ümumi Sərmayə</h3>
          <p>{users.reduce((total, user) => total + (user.balance > 0 ? 1 : 0), 0)}</p>
        </div>
        <div className="stat-box">
          <h3>Aktiv Sərmayə</h3>
          <p>{users.reduce((total, user) => total + (user.balance > 0 ? 1 : 0), 0)}</p>
        </div>
        <div className="stat-box">
          <h3>Ümumi Sərmayə Məbləği</h3>
          <p>{users.reduce((total, user) => total + (Number(user.balance) || 0), 0)
            .toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'USERS' ? 'active' : ''}
          onClick={() => setActiveTab('USERS')}
        >
          <FaUsers /> İstifadəçilər
        </button>
        <button
          className={activeTab === 'DEPOSITS' ? 'active' : ''}
          onClick={() => setActiveTab('DEPOSITS')}
        >
          <FaMoneyBillWave /> Balans Artırımı ({deposits.filter(d => d.status === 'PENDING').length})
        </button>
        <button
          className={activeTab === 'WITHDRAWALS' ? 'active' : ''}
          onClick={() => setActiveTab('WITHDRAWALS')}
        >
          <FaMoneyBillWave /> Pul Çəkmə ({withdrawals.filter(w => w.status === 'PENDING').length})
        </button>
        <button
          className={activeTab === 'PAYMENT_INFO' ? 'active' : ''}
          onClick={() => setActiveTab('PAYMENT_INFO')}
        >
          <FaCog /> Ödəniş Məlumatları
        </button>
        <button
          className={activeTab === 'STATS' ? 'active' : ''}
          onClick={() => setActiveTab('STATS')}
        >
          <FaChartBar /> Statistikalar
        </button>
      </div>

      <div className="content">
        {activeTab === 'USERS' && (
          <table>
            <thead>
              <tr>
                <th>İstifadəçi Adı</th>
                <th>Email</th>
                <th>Balans</th>
                <th>Səviyyə</th>
                <th>Admin</th>
                <th>Vəziyyət</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.balance} AZN</td>
                  <td>{user.level}</td>
                  <td>{user.isAdmin ? 'Bəli' : 'Xeyr'}</td>
                  <td>{user.isBlocked ? 'Bloklanıb' : 'Aktiv'}</td>
                  <td>
                    {user.isBlocked ? (
                      <button 
                        onClick={() => handleAction('USER', user._id, 'unblock')} 
                        className="unblock-btn"
                      >
                        <FaCheckCircle /> Bloku Qaldır
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction('USER', user._id, 'block')} 
                        className="block-btn"
                      >
                        <FaTimesCircle /> Blokla
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'DEPOSITS' && (
          <table>
            <thead>
              <tr>
                <th>İstifadəçi</th>
                <th>Məbləğ</th>
                <th>Ödəniş Üsulu</th>
                <th>Tarix</th>
                <th>Qəbz</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(deposit => (
                <tr key={deposit._id}>
                  <td>{deposit.user?.username}</td>
                  <td>{deposit.amount} AZN</td>
                  <td>{deposit.paymentMethod}</td>
                  <td>{formatDate(deposit.createdAt)}</td>
                  <td>
                    {deposit.receiptUrl && (
                      <button 
                        className="view-receipt-btn"
                        onClick={() => {
                          const cloudinaryUrl = deposit.receiptUrl.includes('cloudinary') ? 
                            deposit.receiptUrl : 
                            deposit.receiptUrl.split('/uploads/receipts/')[1];
                          console.log('Opening image:', cloudinaryUrl);
                          setSelectedImage(cloudinaryUrl);
                        }}
                      >
                        <FaCreditCard /> Göstər
                      </button>
                    )}
                  </td>
                  <td>
                    {deposit.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction('DEPOSIT', deposit._id, 'APPROVE')} className="approve-btn">
                          <FaCheckCircle /> Təsdiqlə
                        </button>
                        <button onClick={() => handleAction('DEPOSIT', deposit._id, 'REJECT')} className="reject-btn">
                          <FaTimesCircle /> Rədd Et
                        </button>
                      </>
                    )}
                    {deposit.status === 'APPROVED' && <span className="status approved">Təsdiqləndi</span>}
                    {deposit.status === 'REJECTED' && <span className="status rejected">Rədd edildi</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'WITHDRAWALS' && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarix</TableCell>
                  <TableCell>İstifadəçi</TableCell>
                  <TableCell>Məbləğ</TableCell>
                  <TableCell>Ödəniş Üsulu</TableCell>
                  <TableCell>Detaylar</TableCell>
                  <TableCell>Vəziyyət</TableCell>
                  <TableCell>Əməliyyatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal._id}>
                    <TableCell>{new Date(withdrawal.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{withdrawal.user?.username || 'Bilinmeyen İstifadəçi'}</TableCell>
                    <TableCell>{withdrawal.amount} AZN</TableCell>
                    <TableCell>
                      {(withdrawal.withdrawMethod || withdrawal.paymentMethod) === 'CREDIT_CARD' ? 'Karta Köçürmə' :
                       (withdrawal.withdrawMethod || withdrawal.paymentMethod) === 'm10' ? 'M10' :
                       (withdrawal.withdrawMethod || withdrawal.paymentMethod) === 'CRYPTO' ? 'Kripto Para' :
                       withdrawal.withdrawMethod || withdrawal.paymentMethod}
                    </TableCell>
                    <TableCell>{renderWithdrawalDetails(withdrawal)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(withdrawal.status)}
                        color={getStatusColor(withdrawal.status)}
                        icon={getStatusIcon(withdrawal.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {withdrawal.status === 'PENDING' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAction('WITHDRAWAL', withdrawal._id, 'APPROVE')}
                            sx={{ mr: 1 }}
                          >
                            Təsdiqlə
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleAction('WITHDRAWAL', withdrawal._id, 'REJECT')}
                          >
                            Rədd Et
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 'PAYMENT_INFO' && (
          <PaymentInfoManager onUpdate={fetchData} />
        )}

        {activeTab === 'STATS' && (
          <div className="stats-form">
            <h2>Görünən Statistika Yeniləməsi</h2>
            <p className="info-text">Bu sahədəki dəyişikliklər yalnız Yan paneldə görünən statistikaları təsir edir, real məlumatları dəyişdirmir.</p>
            
            <form onSubmit={handleFakeStatsUpdate}>
              <div className="form-group">
                <label>Görünən Ümumi İstifadəçi:</label>
                <input
                  type="number"
                  value={fakeStats.totalUsers}
                  onChange={(e) => setFakeStats({ ...fakeStats, totalUsers: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Görünən Aktiv İstifadəçi:</label>
                <input
                  type="number"
                  value={fakeStats.activeUsers}
                  onChange={(e) => setFakeStats({ ...fakeStats, activeUsers: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Görünən Ümumi Sərmayə (manat):</label>
                <input
                  type="number"
                  value={fakeStats.totalInvestment}
                  onChange={(e) => setFakeStats({ ...fakeStats, totalInvestment: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Görünən Ümumi Ödəniş (manat):</label>
                <input
                  type="number"
                  value={fakeStats.totalPayout}
                  onChange={(e) => setFakeStats({ ...fakeStats, totalPayout: Number(e.target.value) })}
                />
              </div>

              <button type="submit" className="update-btn">
                <FaChartBar /> Görünən Statistikaları Yenilə
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Modal
        open={!!selectedImage}
        onClose={handleCloseImage}
        aria-labelledby="receipt-modal"
        aria-describedby="receipt-image"
      >
        <Box sx={modalStyle}>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Receipt" 
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AdminPanel;