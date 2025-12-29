import React, { createContext, useState, useEffect, useContext } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  getUserProfile: (uid: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
  getUserProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1041767997112-q86fni96i5actcm4m89r7mue3inedqmj.apps.googleusercontent.com',
    });

    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid,
        email,
        displayName: displayName || '',
        phoneNumber: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firestore().collection('users').doc(uid).set(userProfile);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the users ID token
      const { data } = await GoogleSignin.signIn();

      if (!data?.idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      const uid = userCredential.user.uid;

      // Check if user profile exists in Firestore
      const existingProfileDoc = await firestore().collection('users').doc(uid).get();

      // If profile doesn't exist, create one
      if (!existingProfileDoc.exists()) {
        const userProfile: UserProfile = {
          uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || '',
          phoneNumber: userCredential.user.phoneNumber || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await firestore().collection('users').doc(uid).set(userProfile);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updates = {
        ...data,
        updatedAt: new Date(),
      };

      await firestore().collection('users').doc(user.uid).update(updates);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: data?.uid,
          email: data?.email,
          displayName: data?.displayName,
          phoneNumber: data?.phoneNumber,
          createdAt: data?.createdAt?.toDate(),
          updatedAt: data?.updatedAt?.toDate(),
        } as UserProfile;
      }

      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, updateUserProfile, getUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
