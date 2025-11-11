import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

// Chef-focused Add Menu screen
export default function AddMenuScreen() {
	const router = useRouter();
	const [category, setCategory] = useState('Starter');

	const [dishName, setDishName] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');

	const [menuItems, setMenuItems] = useState<any[]>([]);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// clear inputs when category changes
	useEffect(() => {
		const timer = setTimeout(() => {
			setDishName('');
			setDescription('');
			setPrice('');
		}, 100);
		return () => clearTimeout(timer);
	}, [category]);

	const STORAGE_KEY = '@menu_items';

	// load persisted items on mount
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

	const saveItems = async (items: any[]) => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch (e) {
			console.warn('Failed to save menu items', e);
		}
	};

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
			price: parsed.toFixed(2),
		};

		setMenuItems(prev => {
			const next = [...prev, newItem];
			saveItems(next);
			return next;
		});
		setDishName('');
		setDescription('');
		setPrice('');
		setError('');
		setSuccess('Item added successfully');

		// clear success after a short delay
		setTimeout(() => setSuccess(''), 2000);
	};

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

	const filteredItems = menuItems.filter(item => item.category === category);

		return (
			<View style={styles.container}>
				{/* Navigation: back to main menu screen */}
				<TouchableOpacity style={styles.navButton} onPress={() => router.push('/')}>
					<Text style={styles.navText}>View Menu</Text>
				</TouchableOpacity>
			<View style={styles.inputSection}>
				{/* title removed to keep the form compact for chef users */}

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
						let formatted = text.replace(/[^0-9.]/g, '');
						const parts = formatted.split('.');
						if (parts.length > 2) formatted = parts[0] + '.' + parts[1];
						if (parts[1]?.length > 2) formatted = parts[0] + '.' + parts[1].slice(0, 2);
						setPrice(formatted);
					}}
					keyboardType="decimal-pad"
				/>



				<TouchableOpacity style={styles.addButton} onPress={addItem}>
					<Text style={styles.addText}>ADD ITEM</Text>
				</TouchableOpacity>

				{error ? <Text style={styles.errorText}>{error}</Text> : null}
				{success ? <Text style={{ color: '#2E7D32', marginTop: 8, textAlign: 'center' }}>{success}</Text> : null}
			</View>

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
