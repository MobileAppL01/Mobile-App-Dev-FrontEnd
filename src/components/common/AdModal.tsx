
import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Image, TouchableOpacity, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Import images statically to ensure bundling
const AD_IMAGES = [
    require('../../assets/ads/quangcao1.jpg'),
    require('../../assets/ads/quangcao2.jpg'),
    require('../../assets/ads/quangcao3.jpg'),
    require('../../assets/ads/quangcao4.jpg'),
    require('../../assets/ads/quangcao5.jpg'),
];

interface AdModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ visible, onClose }) => {
    const [currentImage, setCurrentImage] = useState<any>(null);

    useEffect(() => {
        if (visible) {
            // Pick a random image each time the modal opens
            const randomIndex = Math.floor(Math.random() * AD_IMAGES.length);
            setCurrentImage(AD_IMAGES[randomIndex]);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={32} color="white" />
                    </TouchableOpacity>

                    {currentImage && (
                        <Image
                            source={currentImage}
                            style={styles.adImage}
                            resizeMode="contain"
                        />
                    )}


                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: width * 0.9,
        height: height * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    adImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    closeButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        zIndex: 100, // Ensure it's on top
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    }
});
