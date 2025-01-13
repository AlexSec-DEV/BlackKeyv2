import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Paper, Typography, Avatar, Button, Box, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  marginBottom: theme.spacing(2),
}));

const Profile = () => {
  const { user, api, loadUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Temizleme fonksiyonu
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      setUploadError(null);
      await api.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await loadUser();
      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Profil resmi yükleme hatası:', error);
      setUploadError('Profil resmi yüklenirken bir hata oluştu');
    }
  };

  const getProfileImageUrl = () => {
    if (previewUrl) {
      console.log('Using preview URL:', previewUrl);
      return previewUrl;
    }
    
    if (user?.profileImage && user.profileImage !== 'default-avatar.png') {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const imageUrl = `${baseUrl}/uploads/profile/${user.profileImage}`;
      console.log('Profile image URL:', imageUrl);
      return imageUrl;
    }
    
    return '/default-avatar.png';
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <ProfileContainer elevation={3}>
        <LargeAvatar
          src={getProfileImageUrl()}
          alt={user.username || 'Profil'}
        />
        <Typography variant="h5" gutterBottom>
          {user.username}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {user.email}
        </Typography>
        
        {uploadError && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {uploadError}
          </Alert>
        )}
        
        {uploadSuccess && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            Profil resmi başarıyla güncellendi
          </Alert>
        )}
        
        <Box mt={2}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="profile-image-upload">
            <Button variant="contained" color="primary" component="span">
              Profil Resmi Seç
            </Button>
          </label>
          
          {selectedFile && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpload}
              style={{ marginLeft: '10px' }}
            >
              Yükle
            </Button>
          )}
        </Box>
      </ProfileContainer>
    </Container>
  );
};

export default Profile; 