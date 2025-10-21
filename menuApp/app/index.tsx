import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function HomeScreen() {
  const [category, setCategory] = useState('Starter');
  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  const addItem = () => {
  if (!dishName || !description || !price) {
    setError('Please fill in all fields before adding an item.');
    return;
  }

  const newItem = {
    id: Date.now().toString(),
    category,
    dishName,
    description,
    price: parseFloat(price).toFixed(2),
  };

  setMenuItems([...menuItems, newItem]);
  setDishName('');
  setDescription('');
  setPrice('');
  setError(''); // clear error once successfully added
  };

  const removeItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const filteredItems = menuItems.filter(item => item.category === category);

  return (
    <View style={styles.container}>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          <Picker.Item label="Starter" value="Starter" />
          <Picker.Item label="Main" value="Main" />
          <Picker.Item label="Desert" value="Desert" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Dish Name"
          value={dishName}
          onChangeText={setDishName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={price}
          onChangeText={(text) => {
            // Allow only numbers and one decimal point
            let formatted = text.replace(/[^0-9.]/g, ""); // remove anything not a number or dot
            const parts = formatted.split(".");
            if (parts.length > 2) formatted = parts[0] + "." + parts[1]; // prevent more than one dot

              // Limit to 2 decimal places
              if (parts[1]?.length > 2) {
                formatted = parts[0] + "." + parts[1].slice(0, 2);
              }

            setPrice(formatted);
          }}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
     </View>

      {/* List Section */}
      <View style={styles.listSection}>
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          <Picker.Item label="Starter" value="Starter" />
          <Picker.Item label="Main" value="Main" />
          <Picker.Item label="Desert" value="Desert" />
        </Picker>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.dishTitle}>{item.dishName}</Text>
                <Text style={styles.dishDesc}>{item.description}</Text>
              </View>
              <View style={styles.rightSide}>
                <Text style={styles.price}>R{parseFloat(item.price).toFixed(2)}</Text>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

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
});
