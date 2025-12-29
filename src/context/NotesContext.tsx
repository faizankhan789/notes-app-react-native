import React, { createContext, useState, useEffect, useContext } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

export type NoteCategory = 'Work' | 'Personal' | 'Ideas' | 'None';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: NoteCategory;
  isFavorite: boolean;
  tags: string[];
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  createNote: (title: string, content: string, category?: NoteCategory, tags?: string[]) => Promise<void>;
  updateNote: (id: string, title: string, content: string, category?: NoteCategory, tags?: string[]) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextType>({
  notes: [],
  loading: true,
  createNote: async () => {},
  updateNote: async () => {},
  deleteNote: async () => {},
  toggleFavorite: async () => {},
  toggleArchive: async () => {},
  togglePin: async () => {},
  getNote: () => undefined,
});

export const useNotes = () => useContext(NotesContext);

export const NotesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Real-time listener for notes
    const unsubscribe = firestore()
      .collection('notes')
      .where('userId', '==', user.uid)
      .onSnapshot(
        (snapshot) => {
          const fetchedNotes: Note[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetchedNotes.push({
              id: doc.id,
              userId: data.userId,
              title: data.title,
              content: data.content,
              category: data.category || 'None',
              isFavorite: data.isFavorite || false,
              tags: data.tags || [],
              isArchived: data.isArchived || false,
              isPinned: data.isPinned || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          });

          // Sort by updatedAt in JavaScript instead of Firestore
          fetchedNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

          setNotes(fetchedNotes);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching notes:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user]);

  const createNote = async (title: string, content: string, category: NoteCategory = 'None', tags: string[] = []) => {
    if (!user) throw new Error('User not logged in');

    try {
      await firestore().collection('notes').add({
        userId: user.uid,
        title,
        content,
        category,
        isFavorite: false,
        tags,
        isArchived: false,
        isPinned: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateNote = async (id: string, title: string, content: string, category: NoteCategory = 'None', tags: string[] = []) => {
    if (!user) throw new Error('User not logged in');

    try {
      await firestore().collection('notes').doc(id).update({
        title,
        content,
        category,
        tags,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!user) throw new Error('User not logged in');

    try {
      const note = notes.find(n => n.id === id);
      if (!note) throw new Error('Note not found');

      await firestore().collection('notes').doc(id).update({
        isFavorite: !note.isFavorite,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const toggleArchive = async (id: string) => {
    if (!user) throw new Error('User not logged in');

    try {
      const note = notes.find(n => n.id === id);
      if (!note) throw new Error('Note not found');

      await firestore().collection('notes').doc(id).update({
        isArchived: !note.isArchived,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const togglePin = async (id: string) => {
    if (!user) throw new Error('User not logged in');

    try {
      const note = notes.find(n => n.id === id);
      if (!note) throw new Error('Note not found');

      await firestore().collection('notes').doc(id).update({
        isPinned: !note.isPinned,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) throw new Error('User not logged in');

    try {
      await firestore().collection('notes').doc(id).delete();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const getNote = (id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  };

  return (
    <NotesContext.Provider value={{ notes, loading, createNote, updateNote, deleteNote, toggleFavorite, toggleArchive, togglePin, getNote }}>
      {children}
    </NotesContext.Provider>
  );
};
