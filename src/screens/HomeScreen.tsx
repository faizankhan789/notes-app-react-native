import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth, UserProfile } from '../context/AuthContext';

export const HomeScreen = () => {
  const { user, signOut, getUserProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);

          if (!profile) {
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              phoneNumber: user.phoneNumber || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            setUserProfile(profile);
          }
        } catch (error: any) {
        
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            phoneNumber: user.phoneNumber || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}!</Text>
        <Text style={styles.subtitle}>You're logged in</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Information</Text>

        {userProfile?.displayName && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{userProfile.displayName}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.uid}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email Verified:</Text>
          <Text style={styles.value}>
            {user?.emailVerified ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Account Created:</Text>
          <Text style={styles.value}>
            {userProfile?.createdAt
              ? userProfile.createdAt.toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Updated:</Text>
          <Text style={styles.value}>
            {userProfile?.updatedAt
              ? userProfile.updatedAt.toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
