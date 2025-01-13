import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';

const PaymentHistory = () => {
  const { api } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const res = await api.get('/transactions/history');
        console.log('Transaction verileri:', res.data);
        setTransactions(res.data);
      } catch (err) {
        console.error('Ödəmə tarixçəsi yüklənərkən xəta:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [api]);

  const getStatusColor = (status, type) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return type === 'WITHDRAWAL' ? 'info' : 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircleIcon sx={{ ml: 1, fontSize: 20 }} />;
      case 'PENDING':
        return <PendingIcon sx={{ ml: 1, fontSize: 20 }} />;
      case 'REJECTED':
        return <CancelIcon sx={{ ml: 1, fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'Təsdiqləndi';
      case 'PENDING':
        return 'Gözləmədə';
      case 'REJECTED':
        return 'Rədd edildi';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOperationType = (transaction) => {
    if (transaction.type === 'WITHDRAWAL') {
      return 'Balansdan Çıxarış';
    }
    return 'Balans artımı';
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Karta Köçürmə';
      case 'm10':
        return 'M10';
      case 'CRYPTO':
        return 'Kripto Para';
      default:
        return method;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, bgcolor: '#1e1e1e', color: 'white' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Ödəmə Tarixçəsi
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tarix</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Əməliyyat növü</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ödəmə üsulu</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Məbləğ</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell sx={{ color: 'white' }}>
                    {formatDate(transaction.createdAt)}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {getOperationType(transaction)}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {getPaymentMethodText(transaction.paymentMethod)}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {transaction.amount} AZN
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(transaction.status)}
                      label={getStatusText(transaction.status)}
                      color={getStatusColor(transaction.status, transaction.type)}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        minWidth: '100px',
                        '& .MuiChip-icon': {
                          order: 1,
                          ml: 0,
                          mr: -0.5
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Typography>Yüklənir...</Typography>
          </Box>
        )}

        {!loading && transactions.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Typography>Əməliyyat tarixçəsi tapılmadı.</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentHistory; 