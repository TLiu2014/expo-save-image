# Expo save image demo

A React Native app with expo for Android. The app can select image from phone, and save to FileSystem (expo-file-system), also presents a gallery to list saved images.

## How to Run

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```
## Dev Note

2025-10-17

This app builds with Expo SDK 54. The new [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) is not yet fully stable on Android.

So, this app uses the classic, stable FileSystem SDK, [Expo FileSystem (legacy)](https://docs.expo.dev/versions/latest/sdk/filesystem-legacy/).

Import as below to avoid errors from deprecated methods.

```javascript
import * as FileSystem from 'expo-file-system/legacy';
```

Instead of

```javascript
import * as FileSystem from 'expo-file-system';
```

## License

This project is licensed under the [MIT License](LICENSE).
