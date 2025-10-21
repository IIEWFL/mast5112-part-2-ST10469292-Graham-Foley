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
  container: { flex: 1, backgroundColor: '#d3d3d3' },
  inputSection: { padding: 20, backgroundColor: '#d3d3d3' },
  picker: { backgroundColor: 'white', marginBottom: 10 },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  addButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  addText: { color: 'white', fontWeight: 'bold' },
  listSection: { flex: 1, backgroundColor: '#555', padding: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dishTitle: { fontWeight: '600', fontSize: 16 },
  dishDesc: { color: '#555' },
  rightSide: { alignItems: 'flex-end' },
  price: { fontWeight: 'bold', marginBottom: 5 },
  removeButton: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  removeText: { color: 'white', fontSize: 12 },

  errorText: {
  color: 'red',
  marginTop: 8,
  fontWeight: '500',
  textAlign: 'center',
},
});
