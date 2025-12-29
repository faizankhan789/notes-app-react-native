import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNotes, NoteCategory } from '../context/NotesContext';

const CATEGORIES: { name: NoteCategory; color: string }[] = [
  { name: 'None', color: '#999' },
  { name: 'Work', color: '#007AFF' },
  { name: 'Personal', color: '#34C759' },
  { name: 'Ideas', color: '#FF9500' },
];

export const AddEditNoteScreen = ({ navigation, route }: any) => {
  const { noteId } = route.params || {};
  const { getNote, createNote, updateNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('None');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = !!noteId;

  useEffect(() => {
    if (isEditMode) {
      const note = getNote(noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setCategory(note.category);
        setTagsInput(note.tags.join(', '));
      }
    }
  }, [noteId]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please add a title or content');
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (isEditMode) {
        await updateNote(noteId, title.trim(), content.trim(), category, tags);
        Alert.alert('Success', 'Note updated successfully');
      } else {
        await createNote(title.trim(), content.trim(), category, tags);
        Alert.alert('Success', 'Note created successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Note' : 'New Note'}
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <View style={styles.categoryButtons}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryButton,
                  { borderColor: cat.color },
                  category === cat.name && { backgroundColor: cat.color },
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: category === cat.name ? '#fff' : cat.color },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Tags (comma-separated):</Text>
          <TextInput
            style={styles.tagsInput}
            placeholder="work, important, todo"
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholderTextColor="#999"
          />
        </View>

        <TextInput
          style={styles.contentInput}
          placeholder="Start writing..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#999"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    padding: 0,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsInput: {
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 300,
    padding: 0,
  },
});
