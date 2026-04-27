
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../hooks/useStore';
import { store, OrderStatus } from '../store/AppStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
  route: RouteProp<RootStackParamList, 'OrderDetail'>;
};

const STEPS: OrderStatus[] = ['Open', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'];
const S_COLOR: Record<OrderStatus, string> = {
  Open: '#3b82f6', Accepted: '#f59e0b',
  'Picked Up': '#a78bfa', 'In Transit': '#22d3ee', Delivered: '#4ade80',
};
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  Open: 'Accept Order', Accepted: 'Mark Picked Up',
  'Picked Up': 'Mark In Transit', 'In Transit': 'Mark Delivered',
};
const NEXT_COLOR: Partial<Record<OrderStatus, string>> = {
  Open: '#3b82f6', Accepted: '#a78bfa', 'Picked Up': '#22d3ee', 'In Transit': '#4ade80',
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const order = useOrder(route.params.orderId);

  if (!order) return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
        <Text style={s.backTxt}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.notFound}>Order not found.</Text>
    </SafeAreaView>
  );

  const isMine = order.assignedDriverId === user?.id;
  const canAccept = order.status === 'Open' && !order.assignedDriverId;
  const canAdvance = isMine && !['Open', 'Delivered'].includes(order.status);
  const stepIdx = STEPS.indexOf(order.status);

  const handleAction = () => {
    if (canAccept) {
      Alert.alert('Accept Order', `Accept ${order.id}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => store.acceptOrder(order.id, user!.id) },
      ]);
    } else if (canAdvance) {
      const nextMap: Record<string, OrderStatus> = {
        Accepted: 'Picked Up', 'Picked Up': 'In Transit', 'In Transit': 'Delivered',
      };
      Alert.alert('Update Status', `Move to "${nextMap[order.status]}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => store.advanceStatus(order.id) },
      ]);
    }
  };

  const showAction = canAccept || canAdvance;
  const btnLabel = NEXT_LABEL[order.status];
  const btnColor = NEXT_COLOR[order.status] ?? '#64748b';

  return (
    <SafeAreaView style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Order Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={[s.hero, { borderColor: S_COLOR[order.status] }]}>
          <View style={s.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.heroId}>{order.id}</Text>
              <Text style={s.heroName}>{order.customerName}</Text>
            </View>
            <View style={[s.heroBadge, { backgroundColor: S_COLOR[order.status] + '22' }]}>
              <Text style={[s.heroBadgeTxt, { color: S_COLOR[order.status] }]}>{order.status}</Text>
            </View>
          </View>
          <Text style={s.heroAddr}>📍 {order.address}</Text>
          <Text style={s.heroAmt}>₹{order.totalAmount.toLocaleString()}</Text>
        </View>

        {/* Stepper */}
        <Text style={s.secLbl}>PROGRESS</Text>
        <View style={s.stepCard}>
          {STEPS.map((step, i) => {
            const done = i <= stepIdx;
            const active = i === stepIdx;
            const c = done ? S_COLOR[step] : '#334155';
            return (
              <View key={step} style={s.stepRow}>
                <View style={s.stepLeft}>
                  <View style={[s.stepDot, { borderColor: c, backgroundColor: active ? c : (done ? c + '22' : '#1e293b') }]}>
                    {done && <Text style={[s.stepCheck, { color: active ? '#0f172a' : c }]}>{active ? '●' : '✓'}</Text>}
                  </View>
                  {i < STEPS.length - 1 && <View style={[s.stepLine, done && i < stepIdx && { backgroundColor: c }]} />}
                </View>
                <Text style={[s.stepLbl, active && { color: '#f8fafc', fontWeight: '700' }, !done && { color: '#334155' }]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Items */}
        <Text style={s.secLbl}>ITEMS</Text>
        <View style={s.listCard}>
          {order.items.map((item, i) => (
            <View key={i} style={[s.itemRow, i < order.items.length - 1 && s.itemBorder]}>
              <Text style={s.itemDot}>•</Text>
              <Text style={s.itemTxt}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <Text style={s.secLbl}>TIMELINE</Text>
        <View style={s.listCard}>
          {order.timeline.map((e, i) => (
            <View key={i} style={[s.tlRow, i < order.timeline.length - 1 && s.tlBorder]}>
              <View style={s.tlDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.tlStatus}>{e.status}</Text>
                <Text style={s.tlTime}>{fmt(e.time)}</Text>
                {e.location && (
                  <Text style={s.tlLoc}>📍 {e.location.lat.toFixed(4)}, {e.location.lng.toFixed(4)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Live loc */}
        {order.driverLocation && order.status !== 'Delivered' && (
          <>
            <Text style={s.secLbl}>LIVE LOCATION</Text>
            <View style={[s.listCard, { borderColor: '#22d3ee', flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
              <Text style={{ fontSize: 28 }}>📡</Text>
              <View>
                <Text style={{ fontSize: 13, color: '#22d3ee', fontWeight: '600' }}>
                  {order.driverLocation.latitude.toFixed(5)}, {order.driverLocation.longitude.toFixed(5)}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                  Updated: {fmt(order.driverLocation.updatedAt)}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Action */}
      <View style={s.actionBar}>
        {showAction && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: btnColor }]} onPress={handleAction}>
            <Text style={s.actionTxt}>{btnLabel}</Text>
          </TouchableOpacity>
        )}
        {order.status === 'Delivered' && (
          <View style={[s.actionBtn, { backgroundColor: '#052e16', borderWidth: 1, borderColor: '#4ade80' }]}>
            <Text style={[s.actionTxt, { color: '#4ade80' }]}>✅  Delivered Successfully</Text>
          </View>
        )}
        {!isMine && !canAccept && (
          <View style={[s.actionBtn, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
            <Text style={[s.actionTxt, { color: '#64748b' }]}>⚠️  Assigned to another driver</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  notFound: { color: '#94a3b8', textAlign: 'center', marginTop: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { paddingVertical: 4 },
  backTxt: { fontSize: 15, color: '#f59e0b', fontWeight: '700' },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  scroll: { paddingHorizontal: 20 },

  hero: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1.5 },
  heroRow: { flexDirection: 'row', marginBottom: 10 },
  heroId: { fontSize: 11, color: '#64748b', fontWeight: '600', letterSpacing: 0.5 },
  heroName: { fontSize: 20, fontWeight: '800', color: '#f8fafc', marginTop: 2 },
  heroBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  heroBadgeTxt: { fontSize: 11, fontWeight: '700' },
  heroAddr: { fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 17 },
  heroAmt: { fontSize: 26, fontWeight: '800', color: '#f59e0b' },

  secLbl: { fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' },
  stepCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 38 },
  stepLeft: { alignItems: 'center', width: 26 },
  stepDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  stepCheck: { fontSize: 9, fontWeight: '900' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#334155', marginVertical: 2 },
  stepLbl: { fontSize: 14, color: '#64748b', paddingLeft: 12, paddingTop: 2, flex: 1 },

  listCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  itemRow: { flexDirection: 'row', paddingVertical: 9 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#334155' },
  itemDot: { color: '#f59e0b', marginRight: 10, fontSize: 16 },
  itemTxt: { fontSize: 14, color: '#cbd5e1', flex: 1 },

  tlRow: { flexDirection: 'row', paddingVertical: 10 },
  tlBorder: { borderBottomWidth: 1, borderBottomColor: '#334155' },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b', marginTop: 5, marginRight: 12 },
  tlStatus: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
  tlTime: { fontSize: 11, color: '#64748b', marginTop: 2 },
  tlLoc: { fontSize: 11, color: '#a78bfa', marginTop: 2 },

  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b' },
  actionBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  actionTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});