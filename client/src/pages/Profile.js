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
  Avatar,
  IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, api, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || '',
    country: user?.country || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setError('Lütfen sadece resim dosyası yükleyin');
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Resim dosyası 5MB\'dan küçük olmalıdır');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload response:', response.data);
      await loadUser();
      setSuccess('Profil resmi başarıyla güncellendi');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Resim yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Profil resmi URL'sini oluştur
  const getProfileImageUrl = () => {
    if (!user?.profileImage) return undefined;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/profile/${user.profileImage}`;
    console.log('Profile image URL:', imageUrl);
    return imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Şifre kontrolü
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setError('Yeni şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        currentPassword: formData.currentPassword,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        birthDate: formData.birthDate
      };

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      await api.put('/auth/profile', updateData);
      await loadUser();
      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={getProfileImageUrl()}
                alt={user?.username || 'Profile'}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={loading}
              />
              <label htmlFor="profile-image-upload">
                <IconButton
                  color="primary"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper'
                  }}
                  disabled={loading}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            <Typography variant="h5" gutterBottom>
              {user?.username}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {user?.email}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {typeof success === 'string' ? success : 'Profiliniz başarıyla güncellendi!'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Hesap Bilgileri
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı"
                  value={user?.username || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Kişisel Bilgiler
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon Numarası"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+90 555 123 4567"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ülke"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Doğum Tarihi"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Şifre Değiştirme
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mevcut Şifre"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Yeni Şifre (Opsiyonel)"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Yeni Şifre Tekrar"
                  name="confirmNewPassword"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  disabled={!formData.newPassword}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Hesap İstatistikleri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Bakiye
                  </Typography>
                  <Typography variant="h6">
                    {user?.balance} AZN
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Level
                  </Typography>
                  <Typography variant="h6">
                    {user?.level}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    XP
                  </Typography>
                  <Typography variant="h6">
                    {user?.xp}/100
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 