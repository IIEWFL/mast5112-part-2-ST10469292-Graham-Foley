import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

/**
 * Chef-focused Add Menu screen
 * - Allows a chef to add/remove menu items per category
 * - Persists items to AsyncStorage under STORAGE_KEY
 */
export default function AddMenuScreen() {
	const router = useRouter();

	// Selected category for the form and list filter
	const [category, setCategory] = useState('Starter');

	// Form fields for new menu item
	const [dishName, setDishName] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');

	// Local list of all menu items (persisted)
	const [menuItems, setMenuItems] = useState<any[]>([]);

	// UI feedback messages
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// Clear form inputs shortly after category changes to avoid mixing values
	useEffect(() => {
		const timer = setTimeout(() => {
			setDishName('');
			setDescription('');
			setPrice('');
		}, 100);
		return () => clearTimeout(timer);
	}, [category]);

	const STORAGE_KEY = '@menu_items';

	// Load persisted items when component mounts
	useEffect(() => {
		(async function load() {
			try {
				const raw = await AsyncStorage.getItem(STORAGE_KEY);
				if (raw) setMenuItems(JSON.parse(raw));
			} catch (e) {
				console.warn('Failed to load menu items', e);
			}
		})();
	}, []);

	/**
	 * Persist a given items array to AsyncStorage.
	 * Wrapped in try/catch to avoid crashing the app on storage errors.
	 */
	const saveItems = async (items: any[]) => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch (e) {
			console.warn('Failed to save menu items', e);
		}
	};

	/**
	 * Validate input, create a new item, update local state and persist.
	 * Provides basic validation on name/description/price and formats price to 2 decimals.
	 */
	const addItem = () => {
		if (!dishName.trim() || !description.trim() || !price.trim()) {
			setError('Please fill in name, description and price.');
			setSuccess('');
			return;
		}

		const parsed = parseFloat(price);
		if (isNaN(parsed) || parsed < 0) {
			setError('Please enter a valid price.');
			setSuccess('');
			return;
		}

		const newItem = {
			id: Date.now().toString(),
			category,
			dishName: dishName.trim(),
			description: description.trim(),
			// store price as string with two decimals so rendering is consistent
			price: parsed.toFixed(2),
		};

		// Update state and persist immediately
		setMenuItems(prev => {
			const next = [...prev, newItem];
			saveItems(next);
			return next;
		});

		// Reset form and show success feedback briefly
		setDishName('');
		setDescription('');
		setPrice('');
		setError('');
		setSuccess('Item added successfully');
		setTimeout(() => setSuccess(''), 2000);
	};

	/**
	 * Remove an item by id from local state and persist change.
	 */
	const removeItem = (id: string) => {
		setMenuItems(prev => {
			const next = prev.filter(item => item.id !== id);
			saveItems(next);
			return next;
		});
	};

	/**
	 * Ask the user to confirm deletion using a native alert.
	 */
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

	// Only show items that match the current category selection
	const filteredItems = menuItems.filter(item => item.category === category);

	return (
		<View style={styles.container}>
			{/* Using native header from _layout; screen-level header removed */}
			<TouchableOpacity style={styles.navButton} onPress={() => router.push('/') }>
				<Text style={styles.navText}>View Menu</Text>
			</TouchableOpacity>

			{/* Input section: category picker and fields for adding an item */}
			<View style={styles.inputSection}>
				{/* Compact form for chef users; no large title */}

				{/* Category picker */}
				<Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
					<Picker.Item label="Starter" value="Starter" />
					<Picker.Item label="Main" value="Main" />
					<Picker.Item label="Desert" value="Desert" />
				</Picker>

				{/* Dish name input */}
				<TextInput
					style={styles.input}
					placeholder="Dish Name"
					value={dishName}
					onChangeText={setDishName}
				/>

				{/* Description input */}
				<TextInput
					style={styles.input}
					placeholder="Description"
					value={description}
					onChangeText={setDescription}
				/>

				{/* Price input with basic formatting: numeric + max 2 decimal places */}
				<TextInput
					style={styles.input}
					placeholder="Price"
					value={price}
					onChangeText={(text) => {
						let formatted = text.replace(/[^0-9.]/g, '');
						const parts = formatted.split('.');
						if (parts.length > 2) formatted = parts[0] + '.' + parts[1];
						if (parts[1]?.length > 2) formatted = parts[0] + '.' + parts[1].slice(0, 2);
						setPrice(formatted);
					}}
					keyboardType="decimal-pad"
				/>

				{/* Button to add item */}
				<TouchableOpacity style={styles.addButton} onPress={addItem}>
					<Text style={styles.addText}>ADD ITEM</Text>
				</TouchableOpacity>

				{/* Feedback messages for error or success */}
				{error ? <Text style={styles.errorText}>{error}</Text> : null}
				{success ? <Text style={{ color: '#2E7D32', marginTop: 8, textAlign: 'center' }}>{success}</Text> : null}
			</View>

			{/* List section: displays current items for the selected category */}
			<View style={styles.listSection}>
				<Text style={styles.sectionTitle}>Menu - {category}</Text>

				<FlatList
					data={filteredItems}
					keyExtractor={(item) => item.id}
					extraData={menuItems}
					renderItem={({ item }) => {
						if (!item) return null;
						return (
							<View style={styles.card}>
								{/* Left: dish title and description */}
								<View>
									<Text style={styles.dishTitle}>{item.dishName}</Text>
									<Text style={styles.dishDesc}>{item.description}</Text>
								</View>

								{/* Right: price and remove button */}
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
	sectionTitle: {
		fontWeight: '700',
		fontSize: 18,
		color: '#333',
		marginBottom: 10,
	},
});
