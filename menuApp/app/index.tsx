import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

// Main screen component for managing a simple menu list
export default function HomeScreen() {
  const router = useRouter();
  // Selected category for adding/listing items (Starter, Main, Desert)
  const [category, setCategory] = useState('Starter');

  // Shared menu items (persisted)
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const STORAGE_KEY = '@menu_items';

  const loadItems = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setMenuItems(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to load menu items', e);
    }
  };

  const saveItems = async (items: any[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save menu items', e);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Remove an item by id and persist
  const removeItem = (id: string) => {
    setMenuItems(prev => {
      const next = prev.filter(item => item.id !== id);
      saveItems(next);
      return next;
    });
  };

  const confirmRemove = (id: string, name?: string) => {
    Alert.alert(
      'Remove item',
      `Remove "${name ?? 'this item'}" from the menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
      ],
      { cancelable: true }
    );
  };

  // Filter items to show only those matching the currently selected category
  const filteredItems = menuItems.filter(item => item.category === category);

  return (
    <View style={styles.container}>
      {/* Navigation: go to Add Menu screen */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/addMenu')}>
        <Text style={styles.navText}>Go to Add Menu</Text>
      </TouchableOpacity>

      {/* List Section: display items for the selected category */}
      <View style={styles.listSection}>
        {/* Category picker for filtering the list */}
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          <Picker.Item label="Starter" value="Starter" />
          <Picker.Item label="Main" value="Main" />
          <Picker.Item label="Desert" value="Desert" />
        </Picker>

        {/* FlatList rendering filtered menu items */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          extraData={menuItems}
          renderItem={({ item }) => {
            if (!item) return null; // safety check
            return (
              <View style={styles.card}>
                <View>
                  <Text style={styles.dishTitle}>{item.dishName}</Text>
                  <Text style={styles.dishDesc}>{item.description}</Text>
                </View>

                <View style={styles.rightSide}>
                  <Text style={styles.price}>R{parseFloat(item.price).toFixed(2)}</Text>
                  <TouchableOpacity style={styles.removeButton} onPress={() => confirmRemove(item.id, item.dishName)}>
                    <Text style={styles.removeText}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

/* Styles for the component */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  inputSection: {
    padding: 20,
    backgroundColor: '#FAF7F2',
  },
  picker: {
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
    borderColor: '#E0D6C2',
    borderWidth: 1,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#E0D6C2',
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#A67C52',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  listSection: {
    flex: 1,
    backgroundColor: '#F2EADF',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  dishTitle: {
    fontWeight: '600',
    fontSize: 17,
    color: '#333',
  },
  dishDesc: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontWeight: '700',
    color: '#A67C52',
    marginBottom: 5,
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  removeText: {
    color: 'white',
    fontSize: 12,
  },
  errorText: {
    color: '#C62828',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  navButton: {
    backgroundColor: '#A67C52',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-end',
    margin: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  navText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
