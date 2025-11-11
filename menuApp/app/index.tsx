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

  // AsyncStorage key for persisting menu items
  const STORAGE_KEY = '@menu_items';

  // Load persisted items from AsyncStorage on mount
  const loadItems = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setMenuItems(JSON.parse(raw));
    } catch (e) {
      // Log a warning if load fails
      console.warn('Failed to load menu items', e);
    }
  };

  // Persist given items array to AsyncStorage
  const saveItems = async (items: any[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // Log a warning if save fails
      console.warn('Failed to save menu items', e);
    }
  };

  // Load items once when component mounts
  useEffect(() => {
    loadItems();
  }, []);

  // Remove an item by id, update state and persist the change
  const removeItem = (id: string) => {
    setMenuItems(prev => {
      const next = prev.filter(item => item.id !== id);
      saveItems(next); // persist the new list
      return next;
    });
  };

  // Confirm before removing an item (shows native alert)
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

  // Compute average prices per category and return formatted strings
  const computeAverages = () => {
    const categories = ['Starter', 'Main', 'Desert'];
    const result: Record<string, string> = {};
    for (const cat of categories) {
      const items = menuItems.filter(i => i.category === cat);
      if (items.length === 0) {
        result[cat] = '—'; // dash for empty categories
        continue;
      }
      // Sum prices (coerce to number safely) and compute average
      const sum = items.reduce((s, it) => s + (parseFloat(it.price) || 0), 0);
      const avg = sum / items.length;
      result[cat] = `R${avg.toFixed(2)}`; // format with currency and two decimals
    }
    return result;
  };

  // Averages memo computed on every render from current menuItems
  const averages = computeAverages();

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
                  {/* Dish title and description */}
                  <Text style={styles.dishTitle}>{item.dishName}</Text>
                  <Text style={styles.dishDesc}>{item.description}</Text>
                </View>

                {/* Right side: price and remove action */}
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

        {/* Averages summary per course (moved to the bottom) */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Starters avg</Text>
            <Text style={styles.statValue}>{averages['Starter']}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mains avg</Text>
            <Text style={styles.statValue}>{averages['Main']}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Deserts avg</Text>
            <Text style={styles.statValue}>{averages['Desert']}</Text>
          </View>
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  statValue: {
    marginTop: 6,
    fontWeight: '700',
    color: '#A67C52',
    fontSize: 16,
  },
});
