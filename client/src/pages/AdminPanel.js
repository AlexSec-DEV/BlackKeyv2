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
  const [realStats, setRealStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    totalAmount: 0
  });
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

  const fetchRealStats = useCallback(async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      
      // Calculate total balance from all users
      const totalBalance = usersResponse.data.reduce((sum, user) => sum + (parseFloat(user.balance) || 0), 0);
      
      if (statsResponse.data) {
        setRealStats({
          totalUsers: statsResponse.data.totalUsers || 0,
          totalInvestments: statsResponse.data.totalInvestments || 0,
          activeInvestments: statsResponse.data.totalInvestmentAmount || 0,
          totalAmount: totalBalance
        });
      }
    } catch (err) {
      console.error('Real statistikalar yüklənərkən xəta:', err);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
    loadFakeStats();
    fetchRealStats();
    const interval = setInterval(() => {
      fetchData();
      fetchRealStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData, loadFakeStats, fetchRealStats]);

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
      if (type === 'USER') {
        await api.post(`/admin/user/${id}/${action.toLowerCase()}`);
        await loadUsers();
        alert('İşlem başarıyla tamamlandı');
      } else if (type === 'DEPOSIT') {
        await api.post(`/admin/deposits/${id}/${action.toLowerCase()}`);
        await fetchData();
        alert('Depozit işlemi başarıyla tamamlandı');
      }
    } catch (error) {
      console.error('Əməliyyat xətası:', error);
      alert('Əməliyyat zamanı xəta baş verdi: ' + (error.response?.data?.message || error.message));
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
        return 'Rədd Edildi';
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
      return 'Detal yoxdur';
    }

    if (method === 'CREDIT_CARD') {
      return (
        <>
          <Typography variant="body2">Bank: {details.bankName || withdrawal.bankName || 'Göstərilməyib'}</Typography>
          <Typography variant="body2">Hesab Sahibi: {details.accountHolder || withdrawal.accountHolder || 'Göstərilməyib'}</Typography>
          <Typography variant="body2">Kart Nömrəsi: {details.cardNumber || withdrawal.cardNumber || 'Göstərilməyib'}</Typography>
        </>
      );
    } else if (method === 'M10') {
      return (
        <>
          <Typography variant="body2">M10 Hesabı: {details.m10AccountNumber || withdrawal.m10AccountNumber || 'Göstərilməyib'}</Typography>
        </>
      );
    } else if (method === 'CRYPTO') {
      return (
        <>
          <Typography variant="body2">Ünvan: {details.cryptoAddress || withdrawal.cryptoAddress || 'Göstərilməyib'}</Typography>
          <Typography variant="body2">Şəbəkə: {details.cryptoNetwork || withdrawal.cryptoNetwork || 'Göstərilməyib'}</Typography>
        </>
      );
    }

    return 'Naməlum ödəniş üsulu';
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
      const response = await api.get('/admin/user');
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const handleBlockIP = async (ipAddress) => {
    try {
      const reason = prompt('IP bloklama sebebini girin:');
      if (!reason) return;

      await api.post('/admin/block-ip', { ipAddress, reason });
      alert('IP adresi başarıyla bloklandı');
      await loadUsers();
    } catch (error) {
      console.error('IP bloklama hatası:', error);
      alert('IP bloklama işlemi başarısız: ' + error.response?.data?.message);
    }
  };

  const handleUnblockIP = async (ipAddress) => {
    try {
      if (!window.confirm('IP engelini kaldırmak istediğinize emin misiniz?')) return;
      
      await api.post(`/admin/unblock-ip/${ipAddress}`);
      alert('IP engeli başarıyla kaldırıldı');
      await loadUsers();
    } catch (error) {
      console.error('IP engel kaldırma hatası:', error);
      alert('IP engeli kaldırma işlemi başarısız: ' + error.response?.data?.message);
    }
  };

  const renderUserTable = () => (
    <table>
      <thead>
        <tr>
          <th>İstifadəçi Adı</th>
          <th>Email</th>
          <th>Son Giriş Tarixi</th>
          <th>Level</th>
          <th>Balans</th>
          <th>Status</th>
          <th>Əməliyyatlar</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{formatDate(user.lastLoginDate)}</td>
            <td>{user.level}</td>
            <td>{user.balance}</td>
            <td>{getStatusText(user.isBlocked)}</td>
            <td>
              {!user.isAdmin && (
                <button
                  className={user.isBlocked ? 'unblock-btn' : 'block-btn'}
                  onClick={() => handleAction('USER', user._id, user.isBlocked ? 'UNBLOCK' : 'BLOCK')}
                >
                  {user.isBlocked ? 'Bloku Aç' : 'Blokla'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
    <table>
      <thead>
        <tr>
          <th>IP Ünvanı</th>
          <th>Blok Səbəbi</th>
          <th>Blok Tarixi</th>
          <th>Bloklayan Admin</th>
          <th>Əməliyyatlar</th>
        </tr>
      </thead>
      <tbody>
        {blockedIPs.map((blockedIP) => (
          <tr key={blockedIP._id}>
            <td>{blockedIP.ipAddress}</td>
            <td>{blockedIP.reason || 'Səbəb göstərilməyib'}</td>
            <td>{new Date(blockedIP.blockedAt).toLocaleString()}</td>
            <td>{blockedIP.blockedBy?.username || 'N/A'}</td>
            <td>
              <button
                className="approve-btn"
                onClick={() => handleUnblockIP(blockedIP.ipAddress)}
              >
                Bloku Aç
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDepositsTable = () => (
    <table>
      <thead>
        <tr>
          <th>İstifadəçi</th>
          <th>Məbləğ</th>
          <th>Tarix</th>
          <th>Qəbz</th>
          <th>Status</th>
          <th>Əməliyyatlar</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map(deposit => (
          <tr key={deposit._id}>
            <td>{deposit.user?.username || 'N/A'}</td>
            <td>{deposit.amount}</td>
            <td>{formatDate(deposit.createdAt)}</td>
            <td>
              {deposit.receiptUrl && (
                <button 
                  className="view-receipt-btn"
                  onClick={() => {
                    const cloudinaryUrl = deposit.receiptUrl.includes('https://res.cloudinary.com/') 
                      ? deposit.receiptUrl
                      : `https://res.cloudinary.com/your-cloud-name/image/upload/${deposit.receiptUrl}`;
                    setSelectedImage(cloudinaryUrl);
                  }}
                >
                  Göstər
                </button>
              )}
            </td>
            <td>{getStatusText(deposit.status)}</td>
            <td>
              {deposit.status === 'PENDING' && (
                <>
                  <button
                    className="approve-btn"
                    onClick={() => handleAction('DEPOSIT', deposit._id, 'APPROVE')}
                  >
                    Təsdiqlə
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleAction('DEPOSIT', deposit._id, 'REJECT')}
                  >
                    Rədd Et
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const tabs = [
    { id: 'USERS', label: 'İstifadəçilər' },
    { id: 'BLOCKED_IPS', label: 'Bloklanmış IP\'lər' },
    { id: 'DEPOSITS', label: 'Depozitlər' },
    { id: 'WITHDRAWALS', label: 'Çıxarışlar' },
    { id: 'SETTINGS', label: 'Tənzimləmələr' }
  ];

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="stats-container">
        <div className="stat-box">
          <h3>Ümumi İstifadəçi</h3>
          <p>{realStats.totalUsers || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Ümumi Sərmayə</h3>
          <p>{realStats.totalInvestments || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Aktiv Sərmayə</h3>
          <p>{realStats.activeInvestments || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Ümumi Sərmayə Məbləği</h3>
          <p>{realStats.totalAmount ? `${realStats.totalAmount} AZN` : '0 AZN'}</p>
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
        {activeTab === 'DEPOSITS' && renderDepositsTable()}
        {activeTab === 'WITHDRAWALS' && (
          <table>
            <thead>
              <tr>
                <th>Tarix</th>
                <th>İstifadəçi</th>
                <th>Məbləğ</th>
                <th>Ödəniş Üsulu</th>
                <th>Detallar</th>
                <th>Status</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id}>
                  <td>{new Date(withdrawal.createdAt).toLocaleString()}</td>
                  <td>{withdrawal.user?.username || 'Naməlum İstifadəçi'}</td>
                  <td>{withdrawal.amount} AZN</td>
                  <td>
                    {(withdrawal.withdrawMethod || withdrawal.paymentMethod) === 'CREDIT_CARD' ? 'Karta Köçürmə' :
                     (withdrawal.withdrawMethod || withdrawal.paymentMethod) === 'm10' ? 'M10' :
                     (withdrawal.withdrawMethod || withdrawal.paymentMethod) === 'CRYPTO' ? 'Kripto' :
                     withdrawal.withdrawMethod || withdrawal.paymentMethod}
                  </td>
                  <td>{renderWithdrawalDetails(withdrawal)}</td>
                  <td>
                    <span className={`status ${withdrawal.status.toLowerCase()}`}>
                      {getStatusText(withdrawal.status)}
                    </span>
                  </td>
                  <td>
                    {withdrawal.status === 'PENDING' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleAction('WITHDRAWAL', withdrawal._id, 'APPROVE')}
                        >
                          <FaCheckCircle /> Təsdiqlə
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleAction('WITHDRAWAL', withdrawal._id, 'REJECT')}
                        >
                          <FaTimesCircle /> Rədd Et
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'SETTINGS' && (
          <>
            <div className="stats-settings">
              <Typography variant="h6" gutterBottom>
                İstatistik Ayarları (Yan Panel)
              </Typography>
              <div className="stats-form">
                <p className="info-text">Bu bölmədə yan paneldə görünən istatistik dəyərlərini tənzimləyə bilərsiniz. Bu dəyərlər sadəcə görüntü üçündür və real məlumatlarla əlaqəsi yoxdur.</p>
                <form onSubmit={handleFakeStatsUpdate}>
                  <div className="form-group">
                    <label>Ümumi İstifadəçi:</label>
                    <input
                      type="number"
                      value={fakeStats.totalUsers}
                      onChange={(e) => setFakeStats({ ...fakeStats, totalUsers: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Aktiv İstifadəçi:</label>
                    <input
                      type="number"
                      value={fakeStats.activeUsers}
                      onChange={(e) => setFakeStats({ ...fakeStats, activeUsers: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ümumi Sərmayə:</label>
                    <input
                      type="number"
                      value={fakeStats.totalInvestment}
                      onChange={(e) => setFakeStats({ ...fakeStats, totalInvestment: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ümumi Ödəniş:</label>
                    <input
                      type="number"
                      value={fakeStats.totalPayout}
                      onChange={(e) => setFakeStats({ ...fakeStats, totalPayout: parseInt(e.target.value) })}
                    />
                  </div>
                  <button type="submit" className="update-btn">
                    <FaChartBar /> Yenilə
                  </button>
                </form>
              </div>
            </div>

            <div className="package-settings">
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
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
                      <TableCell>Əməliyyatlar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packageSettings.map((pkg) => (
                      <TableRow key={pkg.type}>
                        <TableCell>{pkg.type}</TableCell>
                        <TableCell>
                          {editingPackage === pkg.type ? (
                            <TextField
                              size="small"
                              value={editForm.interestRate}
                              onChange={(e) => setEditForm({ ...editForm, interestRate: e.target.value })}
                            />
                          ) : (
                            pkg.interestRate
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPackage === pkg.type ? (
                            <TextField
                              size="small"
                              value={editForm.minAmount}
                              onChange={(e) => setEditForm({ ...editForm, minAmount: e.target.value })}
                            />
                          ) : (
                            pkg.minAmount
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPackage === pkg.type ? (
                            <TextField
                              size="small"
                              value={editForm.maxAmount}
                              onChange={(e) => setEditForm({ ...editForm, maxAmount: e.target.value })}
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
                                Yadda Saxla
                              </Button>
                              <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={() => setEditingPackage(null)}
                                sx={{ ml: 1 }}
                              >
                                Ləğv Et
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

            <div className="payment-settings">
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Ödəniş Məlumatları
              </Typography>
              <PaymentInfoManager />
            </div>
          </>
        )}
      </div>

      {selectedImage && (
        <Modal
          open={Boolean(selectedImage)}
          onClose={handleCloseImage}
        >
          <Box sx={modalStyle}>
            <img 
              src={selectedImage} 
              alt="Receipt" 
              style={{ maxWidth: '100%', maxHeight: '80vh' }} 
            />
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default AdminPanel;