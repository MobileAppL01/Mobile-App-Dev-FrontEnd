import { ImageSourcePropType } from "react-native";

// Import local assets
// Note: These paths are relative to this file's location in src/utils
const DEFAULT_AVATAR = require('../assets/images/bottom_image_1.png');
const DEFAULT_COURTS = [
    require('../assets/images/court1.png'),
    require('../assets/images/court2.png'),
    require('../assets/images/court4.jpg')
];

export const getAvatarSource = (uri?: string | null): ImageSourcePropType => {
    if (uri && uri.trim() !== "") {
        return { uri };
    }
    return DEFAULT_AVATAR;
};

export const getCourtImageSource = (uri?: string | null): ImageSourcePropType => {
    if (uri && uri.trim() !== "") {
        return { uri };
    }
    // Return a random default court image
    const randomIndex = Math.floor(Math.random() * DEFAULT_COURTS.length);
    return DEFAULT_COURTS[randomIndex];
};

export const getReviewImageSource = (uri?: string | null): ImageSourcePropType => {
    if (uri && uri.trim() !== "") {
        return { uri };
    }
    return DEFAULT_COURTS[0]; // Fallback to court image or generic
};
