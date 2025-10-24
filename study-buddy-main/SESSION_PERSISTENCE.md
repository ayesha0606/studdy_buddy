# Session Persistence Implementation

## Overview
The StudyBuddy application now includes robust session persistence that keeps users logged in across browser sessions and page reloads.

## Features

### 🔐 **Automatic Session Restoration**
- User sessions are automatically restored when the app loads
- Authentication tokens are validated with the backend to ensure they're still valid
- Invalid or expired tokens are automatically cleared

### 🚀 **Smart Navigation**
- Returning users are automatically redirected to the appropriate screen:
  - Dashboard (if profile is complete)
  - Profile Setup (if profile needs completion)
  - Auth (if not logged in or session expired)

### 🛡️ **Security Features**
- Tokens are validated with the backend on app load
- Expired sessions are automatically cleared
- API errors (401) automatically trigger session cleanup
- Secure session management utilities

## Technical Implementation

### Session Manager
Located in `src/services/api.ts`, provides utilities for:
- `isLoggedIn()` - Check if user has valid session
- `getCurrentUser()` - Get user data from storage
- `updateCurrentUser(user)` - Update stored user data
- `clearSession()` - Clear all session data

### App-Level Session Handling
In `src/App.tsx`:
- Session restoration on app load
- Automatic navigation based on session state
- Loading states during session validation

### API Integration
- Axios interceptors handle token injection
- Automatic session cleanup on 401 errors
- Protected API endpoints validate tokens

## User Experience

### First-Time Users
1. See splash screen briefly
2. Redirected to authentication
3. After login/registration, session is created

### Returning Users
1. See splash screen briefly
2. Session is automatically restored
3. Redirected to appropriate screen (dashboard/profile-setup)

### Session Expiration
1. Invalid tokens detected automatically
2. Session cleared silently
3. User redirected to authentication

## Security Considerations

- Tokens are stored in localStorage (client-side)
- Tokens are validated on each app load
- Backend validation prevents unauthorized access
- Automatic cleanup on token expiration
- No sensitive data stored beyond session tokens

## Configuration

The session persistence works out of the box with:
- JWT tokens with 7-day expiration (configurable in backend)
- Automatic token validation
- Graceful fallback to authentication screen

## Troubleshooting

### Session Not Persisting
- Check browser localStorage for `authToken` and `user` keys
- Verify backend JWT configuration
- Check console for session restoration logs

### Frequent Logouts
- May indicate token expiration issues
- Check backend token validation
- Verify API endpoint accessibility

### Profile Completion Loop
- Check profile completion logic in `isProfileComplete()`
- Verify required profile fields are being saved
- Check localStorage user data structure