import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS } from '../../lib/colors';
import { invokeMobileApi } from '../../lib/mobile-api';

export default function CheckoutScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await invokeMobileApi<any>('get_payment_order', { orderId });
        setOrder(data);

      } catch (err: any) {
        Alert.alert("Lỗi", err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadOrder();

    const timer = setInterval(async () => {
      try {
        const data = await invokeMobileApi<any>('get_payment_order', { orderId });
        setOrder(data);
      } catch {
        // ignore poll errors
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [orderId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (order?.status === 'paid') {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Thanh toán thành công!</Text>
        <Text style={styles.successDesc}>
          Gói {order.plan} đã được kích hoạt cho tin đăng của bạn.
        </Text>
        <TouchableOpacity style={styles.btnSuccess} onPress={() => router.navigate('/my-listings')}>
          <Text style={styles.btnText}>Quay lại Quản lý tin</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Hardcode for demo, should come from env or config
  const bankName = 'MBBank';
  const bankAcc = '0987654321';
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankAcc}&bank=${bankName}&amount=${order?.amount}&des=${order?.order_code}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Thanh toán qua mã QR</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrCard}>
          <Image source={{ uri: qrUrl }} style={styles.qrImage} contentFit="contain" />
          <Text style={styles.qrInstruction}>Mở ứng dụng ngân hàng và quét mã</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngân hàng:</Text>
            <Text style={styles.detailValue}>{bankName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tài khoản:</Text>
            <Text style={styles.detailValue}>{bankAcc}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền:</Text>
            <Text style={[styles.detailValue, { color: COLORS.error, fontSize: 18 }]}>
              {order?.amount.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nội dung CK:</Text>
            <View style={styles.codeWrap}>
              <Text style={styles.codeText}>{order?.order_code}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.warningText}>
          * Lưu ý: Bắt buộc nhập chính xác nội dung chuyển khoản để hệ thống tự động duyệt đơn (1-3 phút).
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.onSurface },
  content: { padding: 16 },
  qrCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, marginBottom: 24 },
  qrImage: { width: 250, height: 250, marginBottom: 16 },
  qrInstruction: { fontSize: 14, color: COLORS.onSurfaceVariant, fontWeight: '600' },
  detailsCard: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16, padding: 16, gap: 16, marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 14, color: COLORS.onSurfaceVariant },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.onSurface },
  codeWrap: { backgroundColor: COLORS.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  codeText: { fontSize: 16, fontWeight: '900', color: COLORS.primary, letterSpacing: 1 },
  warningText: { fontSize: 13, color: COLORS.error, textAlign: 'center', lineHeight: 20 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '900', color: COLORS.onSurface, marginBottom: 12 },
  successDesc: { fontSize: 15, color: COLORS.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 32, marginBottom: 32, lineHeight: 24 },
  btnSuccess: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
