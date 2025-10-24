import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { MainDashboard } from './components/MainDashboard';
import { ChatInterface } from './components/ChatInterface';
import { ProfileView } from './components/ProfileView';
import { MyProfile } from './components/MyProfile';
import { UserProfile } from './components/UserProfile';
import { ScheduleSystem } from './components/ScheduleSystem';
import { StudySessionCreation } from './components/StudySessionCreation';
import { SettingsScreen } from './components/SettingsScreen';
import { FloatingChatbot } from './components/FloatingChatbot';
import { ThemeProvider } from './components/ThemeProvider';
import { authAPI, User, sessionManager } from './services/api';

type Screen = 
  | 'splash'
  | 'auth'
  | 'profile-setup'
  | 'dashboard'
  | 'chat'
  | 'profile'
  | 'my-profile'
  | 'user-profile'
  | 'schedule'
  | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (sessionManager.isLoggedIn()) {
          console.log('Found existing session, attempting to restore...');
          const storedUser = sessionManager.getCurrentUser();
          
          if (storedUser) {
            // Verify token is still valid by making a request to the backend
            try {
              const response = await authAPI.getProfile();
              console.log('Session restored successfully');
              
              // Update stored user data with latest from server
              sessionManager.updateCurrentUser(response.user);
              setUser(response.user);
              
              // Check if profile is complete and navigate accordingly
              if (isProfileComplete(response.user)) {
                setCurrentScreen('dashboard');
              } else {
                setCurrentScreen('profile-setup');
              }
            } catch (error) {
              console.log('Token validation failed, clearing session:', error);
              // Token is invalid, clear stored data
              sessionManager.clearSession();
              setCurrentScreen('auth');
            }
          } else {
            console.log('Invalid user data in storage');
            sessionManager.clearSession();
            setCurrentScreen('auth');
          }
        } else {
          console.log('No existing session found');
          setCurrentScreen('auth');
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        sessionManager.clearSession();
        setCurrentScreen('auth');
      } finally {
        setIsRestoringSession(false);
      }
    };

    // Small delay to show splash screen briefly even for returning users
    const timer = setTimeout(() => {
      restoreSession();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = (userData: User, isNewUser: boolean = false) => {
    console.log('handleAuth called with userData:', userData, 'isNewUser:', isNewUser);
    setUser(userData);
    
    if (isNewUser) {
      // New user registration - always go to profile setup
      console.log('New user registration, redirecting to profile setup');
      setCurrentScreen('profile-setup');
    } else {
      // Existing user login - check if profile is complete
      console.log('Existing user login, checking profile completion...');
      if (isProfileComplete(userData)) {
        console.log('Profile is complete, redirecting to dashboard');
        setCurrentScreen('dashboard');
      } else {
        console.log('Profile is incomplete, redirecting to profile setup');
        setCurrentScreen('profile-setup');
      }
    }
  };

  // Helper function to check if chatbot should be shown
  const shouldShowChatbot = () => {
    return !isRestoringSession && currentScreen !== 'splash' && currentScreen !== 'auth';
  };

  // Helper function to check if user profile is complete
  const isProfileComplete = (userData: User): boolean => {
    // Check if essential profile fields are filled
    // A profile is considered complete if major, year, and bio are all present and non-empty
    // Handle cases where fields might be null/undefined from database
    const major = userData.major || '';
    const year = userData.year || '';
    const bio = userData.bio || '';
    
    console.log('Profile completion check:', { major, year, bio, userData });
    
    // More flexible check - require at least 2 out of 3 fields to be filled
    const filledFields = [major, year, bio].filter(field => field.trim() !== '').length;
    const isComplete = filledFields >= 2;
    
    console.log('Profile is complete:', isComplete, `(${filledFields}/3 fields filled)`);
    
    return isComplete;
  };

  const handleProfileComplete = () => {
    console.log('handleProfileComplete called');
    // Refresh user data from localStorage to get the updated profile
    const updatedUserData = localStorage.getItem('user');
    if (updatedUserData) {
      const user = JSON.parse(updatedUserData);
      console.log('Updated user data from localStorage:', user);
      setUser(user);
    } else {
      console.log('No user data found in localStorage');
    }
    setCurrentScreen('dashboard');
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const viewUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentScreen('user-profile');
  };

  const handleSignOut = async () => {
    try {
      // Call backend logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user data and authentication regardless of API call result
      setUser(null);
      sessionManager.clearSession();
      setCurrentScreen('auth');
    }
  };

  const renderScreen = () => {
    // Show splash screen with loading state while restoring session
    if (isRestoringSession) {
      return <SplashScreen />;
    }
    
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'auth':
        return <AuthScreen onAuth={handleAuth} />;
      case 'profile-setup':
        return <ProfileSetup onComplete={handleProfileComplete} />;
      case 'dashboard':
        return <MainDashboard onNavigate={navigateTo} onSignOut={handleSignOut} user={user} onViewUserProfile={viewUserProfile} />;
      case 'chat':
        return <ChatInterface onBack={() => navigateTo('dashboard')} currentUser={user} />;
      case 'profile':
        return <ProfileView onBack={() => navigateTo('dashboard')} onNavigate={(screen: string) => navigateTo(screen as Screen)} />;
      case 'my-profile':
        return <MyProfile onBack={() => navigateTo('dashboard')} user={user} onSignOut={handleSignOut} onNavigate={(screen: string) => navigateTo(screen as Screen)} />;
      case 'user-profile':
        return selectedUserId ? (
          <UserProfile onBack={() => navigateTo('dashboard')} userId={selectedUserId} onNavigate={(screen: string) => navigateTo(screen as Screen)} />
        ) : (
          <div>User not found</div>
        );
      case 'schedule':
        return <StudySessionCreation onBack={() => navigateTo('dashboard')} user={user} />;
      case 'settings':
        return <SettingsScreen onBack={() => navigateTo('dashboard')} onSignOut={handleSignOut} />;
      default:
        return <MainDashboard onNavigate={navigateTo} onSignOut={handleSignOut} user={user} onViewUserProfile={viewUserProfile} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-screen"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
        
        {/* Floating Chatbot - Show on all screens except splash and auth */}
        {shouldShowChatbot() && <FloatingChatbot user={user} />}
      </div>
    </ThemeProvider>
  );
}