# Notes App - Source Code

A feature-rich React Native mobile application for managing personal notes with cloud synchronization.

## What This App Does

This is a mobile notes application that allows users to:

- **Create and manage notes** - Write, edit, and organize your thoughts and ideas
- **Secure authentication** - Sign up and log in using email/password or Google account
- **Cloud synchronization** - All notes are automatically synced to Firebase Cloud Firestore
- **Organize with categories** - Label notes as Work, Personal, Ideas, or None
- **Tag your notes** - Add multiple tags to make notes easier to find
- **Mark favorites** - Star important notes for quick access
- **Pin notes** - Keep important notes at the top of your list
- **Archive old notes** - Hide completed notes without deleting them
- **Search and filter** - Find notes quickly by title, content, tags, or category
- **Sort options** - Arrange notes by date, title, or pinned status
- **Real-time updates** - Changes sync instantly across all your devices

## Folder Structure

```
src/
├── config/
│   └── firebase.ts              # Firebase project configuration
├── context/
│   ├── AuthContext.tsx          # User authentication logic
│   └── NotesContext.tsx         # Notes management logic
└── screens/
    ├── LoginScreen.tsx          # Login page
    ├── SignUpScreen.tsx         # Registration page
    ├── HomeScreen.tsx           # User profile page
    ├── NotesListScreen.tsx      # Main notes browsing page
    └── AddEditNoteScreen.tsx    # Create/edit notes page
```

## Main Features Explained

### User Authentication
- Users can create an account with email and password
- Users can sign in using their Google account
- User profiles are stored in Firebase with display name, email, and timestamps
- Session stays active until user logs out

### Notes Management
- Each note has a title and content
- Notes can be categorized (Work, Personal, Ideas, or None)
- Users can add tags to notes for better organization
- Notes can be marked as favorites (starred)
- Notes can be pinned to stay at the top
- Notes can be archived to hide them from main view
- All notes are private and only visible to the user who created them

### Smart Organization
- Search through all notes by title, content, or tags
- Filter notes by category
- View regular notes, favorites, pinned, or archived notes
- Sort by most recent, alphabetically by title, or by pinned status
- Notes display with color-coded category badges and tag chips

## How to Run This Application

### Prerequisites
1. Node.js and npm installed on your computer
2. React Native development environment set up
3. Firebase project created with Authentication and Firestore enabled
4. Google Sign-In configured in Firebase Console
5. For iOS: Xcode and CocoaPods installed
6. For Android: Android Studio and SDK installed

### Installation Steps

1. **Install dependencies**
   - Open terminal and navigate to the project root directory
   ```bash
   npm install
   ```

2. **Install iOS dependencies** (Mac only)
   - Go to the `ios` folder
   ```bash
   cd ios
   pod install
   cd ..
   ```
   - Return to project root

3. **Configure Firebase**
   - Place `GoogleService-Info.plist` file inside the `ios/AwesomeProject/` folder
   - Place `google-services.json` file inside the `android/app/` folder
   - Update Firebase config in `src/config/firebase.ts` (if needed)

4. **Run the app**

   For iOS:
   ```bash
   npx react-native run-ios
   ```

   For Android:
   ```bash
   npx react-native run-android
   ```

   Or use Metro bundler:
   ```bash
   npm start
   ```

### First Time Usage

1. Launch the app on your device/emulator
2. Click "Sign Up" to create a new account
3. Enter your name, email, and password (or use "Continue with Google")
4. After signing up, you'll be taken to the Home screen
5. Navigate to Notes section to start creating notes
6. Click "+ New" to create your first note

## Technical Stack

- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe JavaScript
- **Firebase Authentication** - User management
- **Firebase Firestore** - Cloud database
- **Google Sign-In** - OAuth authentication
- **React Context API** - State management

## Database Structure

### Users Collection
Each authenticated user has a profile document with their name, email, and account creation date.

### Notes Collection
Each note is stored with:
- User ID (to ensure privacy)
- Title and content
- Category and tags
- Status flags (favorite, pinned, archived)
- Creation and update timestamps

All queries are automatically filtered to show only the logged-in user's notes.
