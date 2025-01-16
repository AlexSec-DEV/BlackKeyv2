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
  Box,
  TextField,
  IconButton,
  ButtonGroup
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import PaymentInfoManager from '../components/PaymentInfoManager';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
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
  const [packageSettings, setPackageSettings] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editForm, setEditForm] = useState({
    interestRate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [blockedIPs, setBlockedIPs] = useState([]);

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

  useEffect(() => {
    const loadPackageSettings = async () => {
      try {
        const response = await api.get('/admin/package-settings');
        setPackageSettings(response.data);
      } catch (error) {
        console.error('Kasa ayarları yüklenirken hata:', error);
      }
    };
    loadPackageSettings();
  }, [api]);

  const handleUpdatePackage = async (type) => {
    try {
      await api.put(`/admin/package-settings/${type}`, editForm);
      const response = await api.get('/admin/package-settings');
      setPackageSettings(response.data);
      setEditingPackage(null);
      setEditForm({
        interestRate: '',
        minAmount: '',
        maxAmount: ''
      });
    } catch (error) {
      console.error('Kasa ayarları güncellenirken hata:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const handleBlockIP = async (ipAddress, reason) => {
    try {
      await api.post('/admin/block-ip', { ipAddress, reason });
      alert('IP adresi başarıyla bloklandı');
      await loadUsers();
      await loadBlockedIPs();
    } catch (error) {
      console.error('IP bloklama hatası:', error);
      alert('IP bloklanırken bir hata oluştu');
    }
  };

  const handleUnblockIP = async (ipAddress) => {
    try {
      await api.delete(`/admin/unblock-ip/${ipAddress}`);
      alert('IP bloğu başarıyla kaldırıldı');
      await loadUsers();
      await loadBlockedIPs();
    } catch (error) {
      console.error('IP bloğu kaldırma hatası:', error);
      alert('IP bloğu kaldırılırken bir hata oluştu');
    }
  };

  const renderUserTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Kullanıcı Adı</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>IP Adresi</TableCell>
            <TableCell>Son Giriş IP</TableCell>
            <TableCell>Son Giriş Tarihi</TableCell>
            <TableCell>Bakiye</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user._id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.ipAddress || 'N/A'}</TableCell>
              <TableCell>{user.lastLoginIp || 'N/A'}</TableCell>
              <TableCell>
                {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'N/A'}
              </TableCell>
              <TableCell>{user.balance}</TableCell>
              <TableCell>
                <Chip
                  label={user.isBlocked ? 'Engelli' : 'Aktif'}
                  color={user.isBlocked ? 'error' : 'success'}
                />
              </TableCell>
              <TableCell>
                <ButtonGroup variant="text">
                  {!user.isAdmin && (
                    <Button
                      onClick={() => handleAction('user', user._id, user.isBlocked ? 'unblock' : 'block')}
                      color={user.isBlocked ? 'success' : 'error'}
                      startIcon={user.isBlocked ? <LockOpenIcon /> : <BlockIcon />}
                    >
                      {user.isBlocked ? 'Engeli Kaldır' : 'Engelle'}
                    </Button>
                  )}
                  {user.ipAddress && (
                    <Button
                      onClick={() => {
                        const reason = prompt('IP bloklama sebebini girin:');
                        if (reason) {
                          handleBlockIP(user.ipAddress, reason);
                        }
                      }}
                      color="error"
                      startIcon={<BlockIcon />}
                    >
                      IP Blokla
                    </Button>
                  )}
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const loadBlockedIPs = async () => {
    try {
      const response = await api.get('/admin/blocked-ips');
      setBlockedIPs(response.data);
    } catch (error) {
      console.error('Bloklu IP\'leri yükleme hatası:', error);
    }
  };

  const renderBlockedIPsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>IP Adresi</TableCell>
            <TableCell>Blok Sebebi</TableCell>
            <TableCell>Blok Tarihi</TableCell>
            <TableCell>Blok Yapan Admin</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blockedIPs.map((blockedIP) => (
            <TableRow key={blockedIP._id}>
              <TableCell>{blockedIP.ipAddress}</TableCell>
              <TableCell>{blockedIP.reason || 'Sebep belirtilmemiş'}</TableCell>
              <TableCell>
                {new Date(blockedIP.blockedAt).toLocaleString()}
              </TableCell>
              <TableCell>{blockedIP.blockedBy?.username || 'N/A'}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleUnblockIP(blockedIP.ipAddress)}
                  color="success"
                  startIcon={<LockOpenIcon />}
                >
                  Bloğu Kaldır
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const tabs = [
    { id: 'USERS', label: 'Kullanıcılar' },
    { id: 'BLOCKED_IPS', label: 'Bloklu IP\'ler' },
    { id: 'DEPOSITS', label: 'Para Yatırma' },
    { id: 'WITHDRAWALS', label: 'Para Çekme' },
    { id: 'SETTINGS', label: 'Ayarlar' }
  ];

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
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="content">
        {activeTab === 'USERS' && renderUserTable()}
        {activeTab === 'BLOCKED_IPS' && renderBlockedIPsTable()}
        {activeTab === 'DEPOSITS' && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>İstifadəçi</TableCell>
                  <TableCell>Məbləğ</TableCell>
                  <TableCell>Ödəniş Üsulu</TableCell>
                  <TableCell>Tarix</TableCell>
                  <TableCell>Qəbz</TableCell>
                  <TableCell>Əməliyyatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deposits.map(deposit => (
                  <TableRow key={deposit._id}>
                    <TableCell>{deposit.user?.username}</TableCell>
                    <TableCell>{deposit.amount} AZN</TableCell>
                    <TableCell>{deposit.paymentMethod}</TableCell>
                    <TableCell>{new Date(deposit.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {deposit.receipt && (
                        <Button onClick={() => setSelectedImage(deposit.receipt)}>
                          Qəbzi Göstər
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {deposit.status === 'PENDING' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAction('DEPOSIT', deposit._id, 'APPROVE')}
                            sx={{ mr: 1 }}
                          >
                            Təsdiqlə
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleAction('DEPOSIT', deposit._id, 'REJECT')}
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

        {activeTab === 'SETTINGS' && (
          <div className="package-settings">
            <Typography variant="h6" gutterBottom>
              Kasa Ayarları
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kasa Tipi</TableCell>
                    <TableCell>Faiz Oranı (%)</TableCell>
                    <TableCell>Min. Miktar</TableCell>
                    <TableCell>Max. Miktar</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {packageSettings.map((pkg) => (
                    <TableRow key={pkg.type}>
                      <TableCell>{pkg.type}</TableCell>
                      <TableCell>
                        {editingPackage === pkg.type ? (
                          <TextField
                            type="number"
                            value={editForm.interestRate}
                            onChange={(e) => setEditForm({ ...editForm, interestRate: e.target.value })}
                            size="small"
                          />
                        ) : (
                          `${pkg.interestRate}%`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingPackage === pkg.type ? (
                          <TextField
                            type="number"
                            value={editForm.minAmount}
                            onChange={(e) => setEditForm({ ...editForm, minAmount: e.target.value })}
                            size="small"
                          />
                        ) : (
                          pkg.minAmount
                        )}
                      </TableCell>
                      <TableCell>
                        {editingPackage === pkg.type ? (
                          <TextField
                            type="number"
                            value={editForm.maxAmount}
                            onChange={(e) => setEditForm({ ...editForm, maxAmount: e.target.value })}
                            size="small"
                          />
                        ) : (
                          pkg.maxAmount
                        )}
                      </TableCell>
                      <TableCell>
                        {editingPackage === pkg.type ? (
                          <>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleUpdatePackage(pkg.type)}
                            >
                              Kaydet
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              onClick={() => setEditingPackage(null)}
                              sx={{ ml: 1 }}
                            >
                              İptal
                            </Button>
                          </>
                        ) : (
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setEditingPackage(pkg.type);
                              setEditForm({
                                interestRate: pkg.interestRate,
                                minAmount: pkg.minAmount,
                                maxAmount: pkg.maxAmount
                              });
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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