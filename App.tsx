import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DeliveryDashboardScreen from './src/screens/DeliveryDashboardScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import OperationsDashboardScreen from './src/screens/OperationsDashboardScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';

export type RootStackParamList = {
  Login: undefined;
  DeliveryDashboard: undefined;
  OrderDetail: { orderId: string };
  OperationsDashboard: undefined;
  OrderTracking: { orderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboardScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="OperationsDashboard" component={OperationsDashboardScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
  );
}
