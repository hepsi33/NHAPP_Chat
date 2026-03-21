# NHAPP - WhatsApp Clone

A modern messaging app built with Expo and Convex, featuring email-based identity instead of phone numbers.

## Features

- **Email Authentication** - Sign up/login with email and OTP verification
- **Real-time Messaging** - Instant messaging with real-time updates
- **Image & Video Sharing** - Share media files in chats
- **Status Updates** - Post and view image/video statuses (like WhatsApp Status)
- **Status Viewers** - See who viewed your status
- **Voice Notes** - Send voice messages
- **Chat Wallpapers** - Customize chat backgrounds
- **Message Reactions** - React to messages with emojis
- **Group Chats** - Create and manage group conversations
- **Delete Account** - Permanently delete your account and data

## Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Convex (real-time database)
- **Email**: Resend (for OTP verification)
- **Authentication**: Email OTP

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Convex account (for backend)

### Installation

1. Clone the repository
```bash
git clone https://github.com/hepsi33/NHAPP_Chat.git
cd NHAPP_Chat
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure Convex
```bash
npx convex dev
```

5. Set up Resend API key for email OTP
```bash
npx convex env set RESEND_API_KEY your_resend_api_key
```

### Running the App

Start the development server:
```bash
npx expo start
```

Run on Android:
```bash
npx expo start --android
```

Run on iOS:
```bash
npx expo start --ios
```

## Project Structure

```
NHAPP/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   └── (main)/            # Main app screens
│       ├── (tabs)/        # Tab navigation
│       └── chat/          # Chat screens
├── components/            # React components
├── convex/                # Backend functions
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Authentication
│   ├── chats.ts          # Chat operations
│   ├── messages.ts       # Message handling
│   └── status.ts         # Status updates
├── hooks/                # Custom React hooks
├── store/                # State management
├── constants/            # App constants
└── services/            # External services
```

## Email Setup

For production email sending:

1. Sign up at [Resend](https://resend.com)
2. Add and verify your domain (e.g., hepsi.com)
3. Add the API key to Convex:
   ```bash
   npx convex env set RESEND_API_KEY re_your_api_key
   ```

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
