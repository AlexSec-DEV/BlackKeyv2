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
      let endpoint;
      if (type === 'USER') {
        endpoint = `/admin/users/${id}/${action.toLowerCase()}`;
      } else if (type === 'DEPOSIT') {
        endpoint = `/admin/deposits/${id}/${action.toLowerCase()}`;
      } else if (type === 'WITHDRAWAL') {
        endpoint = `/admin/withdrawals/${id}/${action.toLowerCase()}`;
      }

      const response = await api.post(endpoint);
      await fetchData();
      alert(response.data?.message || 'Əməliyyat uğurla tamamlandı');
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
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const handleBlockIP = async (ipAddress, reason) => {
    try {
      await api.post('/admin/block-ip', { ipAddress, reason });
      alert('IP ünvanı uğurla bloklandı');
      await loadBlockedIPs();
    } catch (error) {
      console.error('IP bloklama xətası:', error);
      alert('IP bloklanarkən xəta baş verdi');
    }
  };

  const handleUnblockIP = async (ipAddress) => {
    try {
      await api.delete(`/admin/unblock-ip/${ipAddress}`);
      alert('IP bloku uğurla qaldırıldı');
      await loadBlockedIPs();
    } catch (error) {
      console.error('IP bloku qaldırma xətası:', error);
      alert('IP bloku qaldırılarkən xəta baş verdi');
    }
  };

  const renderUserTable = () => (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>İstifadəçi Adı</th>
          <th>Email</th>
          <th>IP Ünvanı</th>
          <th>Son Giriş IP</th>
          <th>Son Giriş Tarixi</th>
          <th>Balans</th>
          <th>Status</th>
          <th>İstifadəçi Əməliyyatları</th>
          <th>IP Əməliyyatları</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user._id}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.ipAddress || 'N/A'}</td>
            <td>{user.lastLoginIp || 'N/A'}</td>
            <td>
              {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'N/A'}
            </td>
            <td>{user.balance}</td>
            <td>
              <span className={`status ${user.isBlocked ? 'rejected' : 'approved'}`}>
                {user.isBlocked ? 'Bloklanıb' : 'Aktiv'}
              </span>
            </td>
            <td>
              {!user.isAdmin && (
                <button
                  className={user.isBlocked ? 'approve-btn' : 'reject-btn'}
                  onClick={() => handleAction('USER', user._id, user.isBlocked ? 'UNBLOCK' : 'BLOCK')}
                >
                  {user.isBlocked ? 'Bloku Aç' : 'Blokla'}
                </button>
              )}
            </td>
            <td>
              {user.ipAddress && (
                <button
                  className="block-ip-btn"
                  onClick={() => {
                    const reason = prompt('IP bloklama səbəbini daxil edin:');
                    if (reason) {
                      handleBlockIP(user.ipAddress, reason);
                    }
                  }}
                >
                  IP Blokla
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
          <th>Ödəniş Üsulu</th>
          <th>Tarix</th>
          <th>Qəbz</th>
          <th>Status</th>
          <th>Əməliyyatlar</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map(deposit => (
          <tr key={deposit._id}>
            <td>{deposit.user?.username}</td>
            <td>{deposit.amount} AZN</td>
            <td>{deposit.paymentMethod}</td>
            <td>{new Date(deposit.createdAt).toLocaleString()}</td>
            <td>
              {deposit.receiptUrl && (
                <button 
                  className="view-receipt-btn"
                  onClick={() => {
                    const cloudinaryUrl = deposit.receiptUrl.includes('https://res.cloudinary.com/') 
                      ? deposit.receiptUrl.substring(deposit.receiptUrl.indexOf('https://res.cloudinary.com/'))
                      : deposit.receiptUrl;
                    console.log('Opening image:', cloudinaryUrl);
                    setSelectedImage(cloudinaryUrl);
                  }}
                >
                  <FaCreditCard /> Göstər
                </button>
              )}
            </td>
            <td>
              <span className={`status ${deposit.status.toLowerCase()}`}>
                {getStatusText(deposit.status)}
              </span>
            </td>
            <td>
              {deposit.status === 'PENDING' && (
                <>
                  <button 
                    className="approve-btn"
                    onClick={() => handleAction('DEPOSIT', deposit._id, 'APPROVE')}
                  >
                    <FaCheckCircle /> Təsdiqlə
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleAction('DEPOSIT', deposit._id, 'REJECT')}
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