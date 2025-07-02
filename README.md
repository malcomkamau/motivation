# 🌟 Motivation App

**Motivation App** is a cross-platform mobile application that delivers daily motivational quotes categorized by user preferences. It supports offline functionality, local storage, user profiles with avatars, quote favoriting, and seamless sharing — all in a beautifully styled interface.

---

## 📱 Features

* ✅ View categorized motivational quotes
* ✅ Offline access with fallback quote storage
* ✅ Favorite/unfavorite quotes and view them later
* ✅ Share quotes with others via native share options
* ✅ Custom splash screen and logo
* ✅ User authentication and profile management (with avatars)
* ✅ Category-based filtering via profile settings
* ✅ Graceful handling of network issues
* ✅ Dynamic theme support (light/dark)
* ✅ Quote of the Day feature when offline
* ✅ EAS build support with custom APK generation

---

## 🛠️ Built With

* **React Native** (via [Expo](https://expo.dev))
* **SQLite** for local quote and user data storage
* **AsyncStorage** for persistence
* **Expo Image Picker** (for avatars)
* **ZenQuotes API** (as quote source)
* **React Navigation** for screen navigation
* **Custom fallback quotes** for offline resilience

---

## 📦 Folder Structure

```
motivation/
├── assets/                # Icons, splash images, fallback data
├── components/            # Reusable UI components
├── context/               # ThemeContext
├── database/              # SQLite setup
├── screens/               # Home, Profile, Favorites, etc.
├── utils/                 # fetchQuotesFromAPI.js, fallback data
├── App.js
├── app.json
├── eas.json
└── README.md              # This file
```

---

## ✨ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/motivation-app.git
cd motivation-app
```

### 2. Install Dependencies

```bash
npm install
```

Or if you're using yarn:

```bash
yarn
```

### 3. Run the App Locally

```bash
npx expo start
```

Scan the QR code with your Expo Go app (Android/iOS).

---

## 🔧 Configuration

### `app.json`

Key fields used:

```json
{
  "name": "motivation",
  "slug": "motivation",
  "splash": {
    "image": "./assets/logo.png",
    "resizeMode": "contain",
    "backgroundColor": "#121212"
  },
  "android": {
    "package": "com.yourname.motivation"
  }
}
```

---

## 🧐 Quote Data Flow

1. App tries to fetch quotes from the **ZenQuotes API**.
2. If the network fails, it loads **fallback quotes**.
3. All quotes are saved to SQLite via `quotesDb.js`.
4. User preferences (categories) filter which quotes are shown.
5. Favorites are stored under user-specific keys.

---

## 🔐 User Features

* **Signup/Login** using a simple AsyncStorage-based mechanism.
* **Profile Settings**: Choose preferred quote categories.
* **Avatar Support**: Upload profile image (stored locally).
* **Logout**: Clears user session.

---

## 🛄🏻 Build with EAS

To generate an APK:

```bash
eas build --platform android --profile preview
```

Ensure `eas.json` has:

```json
"preview": {
  "android": {
    "buildType": "apk"
  }
}
```

---

## 🧩 Testing Offline Mode

* Disable internet connection.
* Relaunch the app.
* It will load:

  * Last cached quotes OR
  * Fallback quotes
  * The "Quote of the Day" still appears.

---

## 📄 License

This project is licensed under the MIT License.
See `LICENSE` file for details.

---

## 💡 Inspiration

Inspired by the idea of delivering meaningful words daily, even in low-connectivity environments. Built with ❤️ using modern cross-platform tools.

---

## 🙌 Contributing

PRs and feedback welcome!
Feel free to fork this project or open issues to suggest improvements.
