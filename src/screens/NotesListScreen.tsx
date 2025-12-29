import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNotes, NoteCategory } from '../context/NotesContext';
import { Note } from '../context/NotesContext';

const CATEGORIES: { name: NoteCategory; color: string }[] = [
  { name: 'None', color: '#999' },
  { name: 'Work', color: '#007AFF' },
  { name: 'Personal', color: '#34C759' },
  { name: 'Ideas', color: '#FF9500' },
];

type SortOption = 'date' | 'title' | 'pinned';

export const NotesListScreen = ({ navigation }: any) => {
  const { notes, loading, deleteNote, toggleFavorite, toggleArchive, togglePin } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'All'>('All');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesArchiveStatus = showArchived ? note.isArchived : !note.isArchived;
    return matchesSearch && matchesCategory && matchesArchiveStatus;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'pinned') {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const pinnedNotes = sortedNotes.filter(note => note.isPinned && !note.isFavorite);
  const favoriteNotes = sortedNotes.filter(note => note.isFavorite && !note.isPinned);
  const favoritePinnedNotes = sortedNotes.filter(note => note.isFavorite && note.isPinned);
  const regularNotes = sortedNotes.filter(note => !note.isFavorite && !note.isPinned);

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(id);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleToggleArchive = async (id: string, title: string, isArchived: boolean) => {
    try {
      await toggleArchive(id);
      Alert.alert('Success', `Note ${isArchived ? 'unarchived' : 'archived'} successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePin(id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getCategoryColor = (category: NoteCategory) => {
    return CATEGORIES.find(cat => cat.name === category)?.color || '#999';
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteContainer}>
      <TouchableOpacity
        style={styles.noteContent}
        onPress={() => navigation.navigate('AddEditNote', { noteId: item.id })}
      >
        <View style={styles.noteHeader}>
          <View style={styles.noteTitleRow}>
            <View style={styles.titleAndPin}>
              {item.isPinned && (
                <Text style={styles.pinIcon}>📌</Text>
              )}
              <Text style={styles.noteTitle} numberOfLines={1}>
                {item.title || 'Untitled'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleFavorite(item.id)}
              style={styles.favoriteButton}
            >
              <Text style={styles.favoriteIcon}>
                {item.isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesRow}>
            {item.category !== 'None' && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              >
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            )}
            {item.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>#{tag}</Text>
                  </View>
                ))}
                {item.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
                )}
              </View>
            )}
          </View>
        </View>
        <Text style={styles.notePreview} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.noteDate}>
          {item.updatedAt.toLocaleDateString()} • {item.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTogglePin(item.id)}
        >
          <Text style={styles.actionButtonText}>{item.isPinned ? 'Unpin' : 'Pin'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleArchive(item.id, item.title, item.isArchived)}
        >
          <Text style={styles.actionButtonText}>{item.isArchived ? 'Unarchive' : 'Archive'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{showArchived ? 'Archived' : 'My Notes'}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.archiveToggleButton}
            onPress={() => setShowArchived(!showArchived)}
          >
            <Text style={styles.archiveToggleText}>
              {showArchived ? '📝' : '📦'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEditNote')}
          >
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
            Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'title' && styles.sortButtonActive]}
          onPress={() => setSortBy('title')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'title' && styles.sortButtonTextActive]}>
            Title
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'pinned' && styles.sortButtonActive]}
          onPress={() => setSortBy('pinned')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'pinned' && styles.sortButtonTextActive]}>
            Pinned
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryFilters}>
        <TouchableOpacity
          style={[
            styles.categoryFilterButton,
            selectedCategory === 'All' && styles.categoryFilterButtonActive,
          ]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text
            style={[
              styles.categoryFilterText,
              selectedCategory === 'All' && styles.categoryFilterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.categoryFilterButton,
              selectedCategory === cat.name && styles.categoryFilterButtonActive,
              selectedCategory === cat.name && { borderColor: cat.color, backgroundColor: cat.color },
            ]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <Text
              style={[
                styles.categoryFilterText,
                selectedCategory === cat.name && styles.categoryFilterTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {sortedNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No notes found' : showArchived ? 'No archived notes' : 'No notes yet'}
          </Text>
          {!searchQuery && !showArchived && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddEditNote')}
            >
              <Text style={styles.emptyButtonText}>Create your first note</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={regularNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {favoritePinnedNotes.length > 0 && (
                <View style={styles.favoritesSection}>
                  <Text style={styles.sectionTitle}>⭐ 📌 Favorite & Pinned</Text>
                  {favoritePinnedNotes.map((note) => renderNote({ item: note }))}
                </View>
              )}
              {favoriteNotes.length > 0 && (
                <View style={styles.favoritesSection}>
                  <Text style={styles.sectionTitle}>⭐ Favorites</Text>
                  {favoriteNotes.map((note) => renderNote({ item: note }))}
                </View>
              )}
              {pinnedNotes.length > 0 && (
                <View style={styles.favoritesSection}>
                  <Text style={styles.sectionTitle}>📌 Pinned</Text>
                  {pinnedNotes.map((note) => renderNote({ item: note }))}
                </View>
              )}
              {regularNotes.length > 0 && (favoritePinnedNotes.length > 0 || favoriteNotes.length > 0 || pinnedNotes.length > 0) && (
                <Text style={styles.sectionTitle}>All Notes</Text>
              )}
            </>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  archiveToggleButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  archiveToggleText: {
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  sortButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  categoryFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  categoryFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  categoryFilterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryFilterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  favoritesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  noteContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  noteContent: {
    padding: 16,
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleAndPin: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  pinIcon: {
    fontSize: 14,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
    marginLeft: 8,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#FFD700',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagBadgeText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
    borderRightWidth: 0,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
