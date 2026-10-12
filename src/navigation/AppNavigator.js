import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import SubjectDetailScreen from '../screens/SubjectDetailScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ScheduleDetailScreen from '../screens/ScheduleDetailScreen';
import AssignmentsScreen from '../screens/AssignmentDetailScreen';
import AssignmentDetailScreen from '../screens/AssignmentDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GradeDetailScreen from '../screens/GradeDetailScreen';

// Create Stacks
const HomeStack = createNativeStackNavigator();
const SubjectsStack = createNativeStackNavigator();
const ScheduleStack = createNativeStackNavigator();
const AssignmentsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Common screen options for detail screens
const detailScreenOptions = {
  headerShown: true,
  headerTintColor: '#4A90D9',
  headerBackTitleVisible: false,
  headerTitleStyle: {
    fontWeight: '700',
    color: '#1A202C',
    fontSize: 17,
  },
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerShadowVisible: true,
};

// 1. Home Stack
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen}
        options={{
          ...detailScreenOptions,
          title: 'Chi tiết môn học',
        }}
      />
      <HomeStack.Screen
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{
          ...detailScreenOptions,
          title: 'Chi tiết bài tập',
        }}
      />
    </HomeStack.Navigator>
  );
}

// 2. Subjects Stack
function SubjectsStackNavigator() {
  return (
    <SubjectsStack.Navigator>
      <SubjectsStack.Screen
        name="SubjectsMain"
        component={SubjectsScreen}
        options={{ headerShown: false }}
      />
      <SubjectsStack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen}
        options={{
          ...detailScreenOptions,
          title: 'Chi tiết môn học',
        }}
      />
    </SubjectsStack.Navigator>
  );
}

// 3. Schedule Stack
function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator>
      <ScheduleStack.Screen
        name="ScheduleMain"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
      <ScheduleStack.Screen
        name="ScheduleDetail"
        component={ScheduleDetailScreen}
        options={{
          ...detailScreenOptions,
          title: 'Chi tiết lịch học',
        }}
      />
    </ScheduleStack.Navigator>
  );
}

// 4. Assignments Stack
function AssignmentsStackNavigator() {
  return (
    <AssignmentsStack.Navigator>
      <AssignmentsStack.Screen
        name="AssignmentsMain"
        component={AssignmentsScreen}
        options={{ headerShown: false }}
      />
      <AssignmentsStack.Screen
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{
          ...detailScreenOptions,
          title: 'Chi tiết bài tập',
        }}
      />
    </AssignmentsStack.Navigator>
  );
}

// 5. Profile Stack
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="GradeDetail"
        component={GradeDetailScreen}
        options={{
          ...detailScreenOptions,
          title: 'Chi tiết điểm',
        }}
      />
    </ProfileStack.Navigator>
  );
}

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#4A90D9',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Tổng quan') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Môn học') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Lịch học') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Bài tập') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Cá nhân') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size || 22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Tổng quan" component={HomeStackNavigator} />
        <Tab.Screen name="Môn học" component={SubjectsStackNavigator} />
        <Tab.Screen name="Lịch học" component={ScheduleStackNavigator} />
        <Tab.Screen name="Bài tập" component={AssignmentsStackNavigator} />
        <Tab.Screen name="Cá nhân" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}