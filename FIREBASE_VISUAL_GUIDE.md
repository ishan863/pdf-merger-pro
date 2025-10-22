# 🖼️ Firebase Console Visual Guide

## What You'll See in Firebase Console

This guide shows you exactly what each screen looks like in the Firebase Console.

---

## Step 1: Creating a Project

### Screen 1: Project Name
```
┌────────────────────────────────────────────────┐
│  Create a project                              │
├────────────────────────────────────────────────┤
│                                                 │
│  Step 1 of 3                                   │
│                                                 │
│  Enter your project name                       │
│  ┌──────────────────────────────────────────┐ │
│  │ pdf-merger-app                           │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  Your Firebase project will be called:         │
│  pdf-merger-app                                │
│                                                 │
│              [Cancel]  [Continue]              │
└────────────────────────────────────────────────┘
```

### Screen 2: Google Analytics
```
┌────────────────────────────────────────────────┐
│  Create a project                              │
├────────────────────────────────────────────────┤
│                                                 │
│  Step 2 of 3                                   │
│                                                 │
│  Google Analytics for your Firebase project   │
│                                                 │
│  [ ✓ ] Enable Google Analytics               │
│                                                 │
│  Recommended: Helps you understand app usage   │
│                                                 │
│              [← Back]  [Continue]              │
└────────────────────────────────────────────────┘
```

### Screen 3: Analytics Account
```
┌────────────────────────────────────────────────┐
│  Configure Google Analytics                    │
├────────────────────────────────────────────────┤
│                                                 │
│  Step 3 of 3                                   │
│                                                 │
│  Select or create a Google Analytics account  │
│  ┌──────────────────────────────────────────┐ │
│  │ Default Account for Firebase             │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  [ ✓ ] I accept the terms and conditions      │
│                                                 │
│              [← Back]  [Create project]        │
└────────────────────────────────────────────────┘
```

---

## Step 2: Getting Your Configuration

### Where to Find It

After project creation, you'll see:

```
┌────────────────────────────────────────────────────────┐
│  Project Overview                                      │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Get started by adding Firebase to your app           │
│                                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                  │
│  │ iOS │  │ 📱  │  │ </>  │  │Unity│                  │
│  └─────┘  └─────┘  └─────┘  └─────┘                  │
│           Android    Web                               │
│                                                         │
│  Click the </> (Web) icon ───────────────────>        │
└────────────────────────────────────────────────────────┘
```

### Register Web App

```
┌────────────────────────────────────────────────┐
│  Add Firebase to your web app                  │
├────────────────────────────────────────────────┤
│                                                 │
│  App nickname                                  │
│  ┌──────────────────────────────────────────┐ │
│  │ PDF Merger Web                           │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  [ ✓ ] Also set up Firebase Hosting          │
│                                                 │
│              [Cancel]  [Register app]          │
└────────────────────────────────────────────────┘
```

### Configuration Screen (THIS IS WHAT YOU NEED!)

```
┌────────────────────────────────────────────────────────┐
│  Add Firebase to your web app                          │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Add Firebase SDK                                      │
│                                                         │
│  Use npm:                                              │
│  npm install firebase                                  │
│                                                         │
│  Add Firebase to your app and initialize Firebase:    │
│                                                         │
│  // Import the functions you need                     │
│  import { initializeApp } from "firebase/app";        │
│                                                         │
│  // Your web app's Firebase configuration             │
│  const firebaseConfig = {                             │
│    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",        │ ◄── COPY THIS
│    authDomain: "pdf-merger-app.firebaseapp.com",     │ ◄── AND THIS
│    projectId: "pdf-merger-app",                       │ ◄── AND THIS
│    storageBucket: "pdf-merger-app.appspot.com",      │ ◄── AND THIS
│    messagingSenderId: "123456789012",                 │ ◄── AND THIS
│    appId: "1:123456:web:abc123def456"                │ ◄── AND THIS
│  };                                                    │
│                                                         │
│  // Initialize Firebase                                │
│  const app = initializeApp(firebaseConfig);           │
│                                                         │
│                    [Continue to console]               │
└────────────────────────────────────────────────────────┘
```

**👆 THIS IS THE MOST IMPORTANT SCREEN!**
Copy all 6 values from `firebaseConfig`

---

## Step 3: Enabling Authentication

### Navigation
```
Sidebar → Build → Authentication
```

### Initial Screen
```
┌────────────────────────────────────────────────┐
│  Authentication                                 │
├────────────────────────────────────────────────┤
│                                                 │
│  Add Firebase Authentication to your app      │
│                                                 │
│  [ Get users signing in with a few lines of  ] │
│  [ code. Authentication provides a            ] │
│  [ complete sign-in system.                   ] │
│                                                 │
│                 [Get started]                   │
└────────────────────────────────────────────────┘
```

### Sign-in Methods Tab
```
┌────────────────────────────────────────────────────────┐
│  Authentication                                         │
│  [ Users ]  [ Sign-in method ]  [ Templates ]         │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Sign-in providers                                     │
│                                                         │
│  Native providers                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Google               [Enabled] ────────────>     │ │ ◄── Click to enable
│  │ Email/Password       [Disabled]                  │ │
│  │ Phone                [Disabled]                  │ │
│  │ Anonymous            [Disabled]                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Additional providers                                  │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Microsoft            [Disabled]                  │ │
│  │ Apple                [Disabled]                  │ │
│  │ GitHub               [Disabled] ────────────>    │ │ ◄── Optional
│  │ Twitter              [Disabled]                  │ │
│  │ Facebook             [Disabled] ────────────>    │ │ ◄── Optional
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Enable Google Provider
```
┌────────────────────────────────────────────────┐
│  Google                                         │
├────────────────────────────────────────────────┤
│                                                 │
│  [ ✓ ] Enable                                  │
│                                                 │
│  Project support email                         │
│  ┌──────────────────────────────────────────┐ │
│  │ your-email@gmail.com                     │ │ ◄── Select your email
│  └──────────────────────────────────────────┘ │
│                                                 │
│              [Cancel]  [Save]                   │
└────────────────────────────────────────────────┘
```

---

## Step 4: Creating Firestore Database

### Navigation
```
Sidebar → Build → Firestore Database
```

### Initial Screen
```
┌────────────────────────────────────────────────┐
│  Cloud Firestore                                │
├────────────────────────────────────────────────┤
│                                                 │
│  Store and sync data for client- and          │
│  server-side development                       │
│                                                 │
│                [Create database]                │
└────────────────────────────────────────────────┘
```

### Select Location
```
┌────────────────────────────────────────────────┐
│  Create database                                │
├────────────────────────────────────────────────┤
│                                                 │
│  Choose where your data is stored              │
│                                                 │
│  Location                                      │
│  ┌──────────────────────────────────────────┐ │
│  │ us-central (Iowa)                        │ │ ◄── Choose closest to you
│  │ us-east1 (South Carolina)                │ │
│  │ europe-west (Belgium)                    │ │
│  │ asia-south1 (Mumbai)                     │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  ⚠️ This location cannot be changed later      │
│                                                 │
│              [Cancel]  [Next]                   │
└────────────────────────────────────────────────┘
```

### Security Rules
```
┌────────────────────────────────────────────────┐
│  Secure rules for Cloud Firestore              │
├────────────────────────────────────────────────┤
│                                                 │
│  ( ) Start in production mode                  │
│      Denies all reads and writes from mobile   │
│      and web clients                           │
│                                                 │
│  (●) Start in test mode                        │ ◄── Select this
│      Allows all reads and writes for 30 days   │
│                                                 │
│              [Cancel]  [Enable]                 │
└────────────────────────────────────────────────┘
```

---

## Step 5: Setting Up Cloud Storage

### Navigation
```
Sidebar → Build → Storage
```

### Initial Screen
```
┌────────────────────────────────────────────────┐
│  Cloud Storage                                  │
├────────────────────────────────────────────────┤
│                                                 │
│  Store and serve user-generated content        │
│                                                 │
│                 [Get started]                   │
└────────────────────────────────────────────────┘
```

### Security Rules
```
┌────────────────────────────────────────────────┐
│  Set up Cloud Storage                          │
├────────────────────────────────────────────────┤
│                                                 │
│  ( ) Start in production mode                  │
│      Denies all reads and writes               │
│                                                 │
│  (●) Start in test mode                        │ ◄── Select this
│      Allows all reads and writes for 30 days   │
│                                                 │
│              [Cancel]  [Next]                   │
└────────────────────────────────────────────────┘
```

### Choose Location
```
┌────────────────────────────────────────────────┐
│  Set up Cloud Storage                          │
├────────────────────────────────────────────────┤
│                                                 │
│  Location                                      │
│  ┌──────────────────────────────────────────┐ │
│  │ us-central (Iowa)                        │ │ ◄── Same as Firestore
│  └──────────────────────────────────────────┘ │
│                                                 │
│  ℹ️ This should match your Firestore location  │
│                                                 │
│              [Cancel]  [Done]                   │
└────────────────────────────────────────────────┘
```

---

## Quick Reference: Where to Find Your Config Again

If you lose the config values:

1. Go to Firebase Console
2. Click the **gear icon** (⚙️) next to "Project Overview"
3. Click **"Project settings"**
4. Scroll down to **"Your apps"**
5. Find your web app
6. Click **"Config"** radio button (not "CDN")
7. Copy the values from `firebaseConfig`

```
Project Settings → Your apps → Web app → Config
```

---

## Summary

The 3 most important screens:

1. **Firebase Config Screen** → Copy 6 values
2. **Authentication Sign-in Methods** → Enable Google
3. **Firestore & Storage** → Start in test mode

That's it! Follow these screens and you'll have everything I need. 🚀
