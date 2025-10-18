import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 3;

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Directory for storing images
  const imageDir = FileSystem.documentDirectory + 'saved_images/';

  useEffect(() => {
    setupDirectory();
    loadImages();
  }, []);

  // Create directory if it doesn't exist
  const setupDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(imageDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
    }
  };

  // Load all saved images
  const loadImages = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(imageDir);
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(imageDir);
        const imageFiles = files
          .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
          .map(file => imageDir + file);
        setImages(imageFiles);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Request permissions and pick image
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Save image to FileSystem
  const saveImage = async (uri) => {
    try {
      setLoading(true);
      const filename = `image_${Date.now()}.jpg`;
      const destination = imageDir + filename;

      // Copy file to our directory
      await FileSystem.copyAsync({
        from: uri,
        to: destination
      });

      // Update images list
      setImages(prev => [...prev, destination]);
      Alert.alert('Success', 'Image saved successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  // Delete image
  const deleteImage = async (uri) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(uri);
              setImages(prev => prev.filter(img => img !== uri));
              Alert.alert('Success', 'Image deleted');
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Failed to delete image');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Image Gallery</Text>
        <Text style={styles.subtitle}>{images.length} images saved</Text>
      </View>

      <View style={styles.uploadSection}>
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.uploadIcon}>📷</Text>
          <Text style={styles.uploadText}>
            {loading ? 'Saving...' : 'Select Image'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.gallery} contentContainerStyle={styles.galleryContent}>
        <Text style={styles.galleryTitle}>Saved Images</Text>
        
        {images.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyText}>No images yet</Text>
            <Text style={styles.emptySubtext}>Select an image to get started</Text>
          </View>
        ) : (
          <View style={styles.imageGrid}>
            {images.map((uri, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageContainer}
                onLongPress={() => deleteImage(uri)}
              >
                <Image source={{ uri }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {images.length > 0 && (
        <Text style={styles.hint}>Long press to delete an image</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  uploadSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  uploadText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  gallery: {
    flex: 1,
    backgroundColor: '#fff',
  },
  galleryContent: {
    padding: 20,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hint: {
    textAlign: 'center',
    padding: 12,
    color: '#999',
    fontSize: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});