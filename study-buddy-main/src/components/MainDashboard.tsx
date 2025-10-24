import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import { StudyBuddyCarousel } from './StudyBuddyCarousel';
import { 
  Heart, X, MessageSquare, Calendar, Sun, Moon, 
  MapPin, Clock, BookOpen, Star, Zap, LogOut, RefreshCw,
  UserPlus, UserMinus, MessageCircle, User, Search, Filter, ChevronDown
} from 'lucide-react';
import { matchesAPI, usersAPI } from '../services/api';

interface MainDashboardProps {
  onNavigate: (screen: 'dashboard' | 'chat' | 'profile' | 'my-profile' | 'schedule' | 'settings') => void;
  onSignOut: () => void;
  user: any;
  onViewUserProfile: (userId: string) => void;
}

const mockBuddies = [
  {
    id: '1',
    name: 'Emma Thompson',
    age: 20,
    major: 'Computer Science',
    year: 'Junior',
    university: 'UC Berkeley',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
    bio: 'Passionate about algorithms and machine learning. Looking for study buddies for advanced CS courses!',
    subjects: ['Data Structures', 'Machine Learning', 'Algorithms'],
    studyTimes: ['Evening (5-8 PM)', 'Online sessions available'],
    location: '2.1 miles away',
    rating: 4.8,
    studySessions: 24,
    badges: ['Top Rated', 'Quick Responder'],
    status: 'online',
    isOnline: true
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    age: 21,
    major: 'Mathematics',
    year: 'Senior',
    university: 'UC Berkeley',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Math enthusiast who loves helping others understand complex concepts. Great at breaking down difficult problems.',
    subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
    studyTimes: ['Morning (9-12 PM)', 'Afternoon (12-5 PM)'],
    location: 'Nearby campus',
    rating: 4.9,
    studySessions: 31,
    badges: ['Math Expert', 'Patient Teacher'],
    status: 'active',
    isOnline: false
  },
  {
    id: '3',
    name: 'Sofia Rodriguez',
    age: 19,
    major: 'Biology',
    year: 'Sophomore',
    university: 'UC Berkeley',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Pre-med student with a love for life sciences. Always excited to discuss biology and chemistry concepts!',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    studyTimes: ['Morning (9-12 PM)', 'Virtual study sessions'],
    location: '0.8 miles away',
    rating: 4.7,
    studySessions: 18,
    badges: ['Science Star', 'Dedicated'],
    status: 'online',
    isOnline: true
  }
];

export function MainDashboard({ onNavigate, onSignOut, user, onViewUserProfile }: MainDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentBuddyIndex, setCurrentBuddyIndex] = useState(0);
  const [potentialBuddies, setPotentialBuddies] = useState<any[]>([]);
  const [filteredBuddies, setFilteredBuddies] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter options
  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Nearby', value: 'Nearby' },
    { label: 'Same Branch', value: 'SameBranch' },
    { label: 'Same Year', value: 'SameYear' },
    { label: 'Online', value: 'Online' },
  ];

  // Load potential study buddies
  useEffect(() => {
    loadPotentialBuddies();
    loadPendingMatches();
  }, []);

  // Update filtered buddies when potential buddies change
  useEffect(() => {
    applyFilter(selectedFilter);
  }, [potentialBuddies]);

  // Filter function
  const applyFilter = (filterValue: string) => {
    let filtered = [...potentialBuddies];
    
    switch (filterValue) {
      case 'All':
        filtered = potentialBuddies;
        break;
      case 'Nearby':
        filtered = potentialBuddies.filter(buddy => {
          // Check if location indicates nearby (contains "miles" or "km" or "Nearby")
          const location = buddy.location?.toLowerCase() || '';
          return location.includes('nearby') || location.includes('miles') || location.includes('km') || location.includes('close');
        });
        break;
      case 'SameBranch':
        filtered = potentialBuddies.filter(buddy => {
          // Filter by same major/branch as current user
          const userMajor = user?.major?.toLowerCase() || 'computer science'; // Default fallback
          const buddyMajor = buddy.major?.toLowerCase() || '';
          return buddyMajor && (buddyMajor.includes(userMajor.split(' ')[0]) || userMajor.includes(buddyMajor.split(' ')[0]));
        });
        break;
      case 'SameYear':
        filtered = potentialBuddies.filter(buddy => {
          // Filter by same academic year as current user
          const userYear = user?.year?.toLowerCase() || 'junior'; // Default fallback
          const buddyYear = buddy.year?.toLowerCase() || '';
          return buddyYear && userYear === buddyYear;
        });
        break;
      case 'Online':
        filtered = potentialBuddies.filter(buddy => {
          // Check if user is online or has online status
          const status = buddy.status?.toLowerCase() || '';
          const studyTimes = buddy.studyTimes || [];
          const hasOnlineStudy = studyTimes.some((time: any) => {
            const timeStr = typeof time === 'string' ? time : time.time || time.day || '';
            return timeStr.toLowerCase().includes('online') || timeStr.toLowerCase().includes('virtual');
          });
          return status.includes('online') || status.includes('active') || hasOnlineStudy || buddy.isOnline;
        });
        break;
      default:
        filtered = potentialBuddies;
    }
    
    setFilteredBuddies(filtered);
    setCurrentBuddyIndex(0); // Reset to first card when filter changes
    setSelectedFilter(filterValue);
    setIsFilterDropdownOpen(false);
  };

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time search with debouncing
  useEffect(() => {
    if (!showSearch) return;
    
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showSearch]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in input fields
      }
      
      switch (event.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          handleSwipe('left');
          break;
        case 'd':
        case 'arrowright':
          handleSwipe('right');
          break;
        case 'escape':
          if (showMatchNotification) {
            setShowMatchNotification(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMatchNotification]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isFilterDropdownOpen && !target.closest('.filter-dropdown-container')) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  const loadPotentialBuddies = async () => {
    try {
      const response = await matchesAPI.getPotentialBuddies({});
      setPotentialBuddies(response.potentialBuddies || []);
      setCurrentBuddyIndex(0);
    } catch (error: any) {
      console.error('Error loading potential buddies:', error);
      
      // Handle network errors gracefully
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Network error while loading potential buddies. Using mock data as fallback.');
        // Fallback to mock data when network fails
        setPotentialBuddies(mockBuddies);
        setCurrentBuddyIndex(0);
      } else {
        // For other errors, keep existing data if available
        if (potentialBuddies.length === 0) {
          setPotentialBuddies(mockBuddies);
          setCurrentBuddyIndex(0);
        }
      }
    }
  };

  const loadPendingMatches = async () => {
    try {
      const response = await matchesAPI.getPendingMatches();
      setPendingMatchesCount(response.pendingMatches?.length || 0);
    } catch (error: any) {
      console.error('Error loading pending matches:', error);
      
      // Handle network errors gracefully
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Network error while loading pending matches. Setting count to 0.');
        setPendingMatchesCount(0);
      }
      // For other errors, keep existing data
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setSearchError(null); // Clear any previous errors
      
      const searchFilters_combined = {
        limit: 20,
        offset: 0,
        // Add search query to filters if provided
        ...(searchQuery.trim() && { search: searchQuery.trim() })
      };
      
      const response = await usersAPI.searchUsers(searchFilters_combined);
      const users = response.users || [];
      
      setSearchResults(users);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Error searching users:', error);
      
      // Handle different types of errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Network connectivity issue
        setSearchError('Network error: Please check your internet connection and try again.');
        console.warn('Network error detected. Please check your internet connection.');
      } else if (error.response?.status === 500) {
        // Server error
        setSearchError('Server error: Please try again later.');
        console.warn('Server error. Please try again later.');
      } else {
        // Other errors
        setSearchError('An error occurred while searching. Please try again.');
        console.warn('An error occurred while searching. Please try again.');
      }
      
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    onViewUserProfile(userId);
  };

  const currentBuddy = potentialBuddies[currentBuddyIndex] || mockBuddies[currentBuddyIndex] || mockBuddies[0] || {
    id: 'default',
    name: 'Study Buddy',
    age: 20,
    major: 'General Studies',
    year: 'Undergraduate',
    university: 'University',
    avatar: '',
    bio: 'Looking for study partners to collaborate and learn together!',
    subjects: ['General Studies'],
    studyTimes: [{ day: 'Any', time: 'Flexible' }],
    location: 'Nearby',
    rating: 4.5,
    studySessions: 0,
    badges: ['New']
  };

  // Ensure data consistency and provide fallbacks with stronger validation
  const normalizedBuddy = {
    ...currentBuddy,
    subjects: (Array.isArray(currentBuddy.subjects) && currentBuddy.subjects.length > 0) 
      ? currentBuddy.subjects 
      : ['General Studies'],
    studyTimes: (Array.isArray(currentBuddy.studyTimes) && currentBuddy.studyTimes.length > 0) 
      ? currentBuddy.studyTimes 
      : [{ day: 'Any', time: 'Flexible' }],
    badges: (Array.isArray(currentBuddy.badges) && currentBuddy.badges.length > 0) 
      ? currentBuddy.badges 
      : ['New'],
    rating: (typeof currentBuddy.rating === 'number' && currentBuddy.rating > 0) 
      ? currentBuddy.rating 
      : 4.5,
    studySessions: (typeof currentBuddy.studySessions === 'number') 
      ? currentBuddy.studySessions 
      : 0,
    location: currentBuddy.location || 'Nearby',
    bio: currentBuddy.bio || 'Looking for study partners to collaborate and learn together!'
  };

  // Debug: Log the buddy data validation (only log issues)
  if (!Array.isArray(normalizedBuddy.studyTimes) || normalizedBuddy.studyTimes.length === 0) {
    console.warn('StudyTimes validation failed, using fallback:', normalizedBuddy.studyTimes);
  }
  if (!Array.isArray(normalizedBuddy.subjects) || normalizedBuddy.subjects.length === 0) {
    console.warn('Subjects validation failed, using fallback:', normalizedBuddy.subjects);
  }
  if (!Array.isArray(normalizedBuddy.badges) || normalizedBuddy.badges.length === 0) {
    console.warn('Badges validation failed, using fallback:', normalizedBuddy.badges);
  }
  
  // Success log (remove this after testing)
  console.log('✅ Buddy data normalized successfully:', {
    name: normalizedBuddy.name,
    subjects: normalizedBuddy.subjects.length,
    studyTimes: normalizedBuddy.studyTimes.length,
    badges: normalizedBuddy.badges.length
  });

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentBuddy && potentialBuddies.length > 0) {
      try {
        if (direction === 'right') {
          // Like the user
          const response = await matchesAPI.swipe(currentBuddy.id, 'like');
          console.log('Swipe response:', response);
          
          if (response.isMatch) {
            // It's a match! Show notification
            setMatchedUser(currentBuddy);
            setShowMatchNotification(true);
            // Auto-hide after 5 seconds
            setTimeout(() => setShowMatchNotification(false), 5000);
          }
        }
        
        // Move to next buddy
        if (currentBuddyIndex < potentialBuddies.length - 1) {
          setCurrentBuddyIndex(prev => prev + 1);
        } else {
          // No more buddies, reload
          await loadPotentialBuddies();
        }
      } catch (error) {
        console.error('Error processing swipe:', error);
      }
    } else {
      // Fallback to mock data
      if (currentBuddyIndex < mockBuddies.length - 1) {
        setCurrentBuddyIndex(prev => prev + 1);
      } else {
        setCurrentBuddyIndex(0);
      }
    }
  };

  // Remove drag functionality - no longer needed
  // const handleDrag = (event: any, info: PanInfo) => {
  //   if (info.offset.x > 100) {
  //     handleSwipe('right');
  //   } else if (info.offset.x < -100) {
  //     handleSwipe('left');
  //   }
  // };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Professional Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-8 py-12 max-w-7xl mx-auto h-24">
          {/* Left Section - Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">StudyBuddy</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredBuddies.length > 0 ? `${filteredBuddies.length} potential matches` : 'No matches found'}
                </p>
              </div>
            </div>
            
            {/* Network Status */}
            {!isOnline && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Offline</span>
              </div>
            )}
          </div>

          {/* Center Section - Navigation Tabs */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-3 px-6 py-3 font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">Discover</span>
            </button>
            
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center space-x-3 px-6 py-3 font-medium text-gray-600 dark:text-gray-400"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Chats</span>
            </button>
            
            <button
              onClick={() => onNavigate('schedule')}
              className="flex items-center space-x-3 px-6 py-3 font-medium text-gray-600 dark:text-gray-400"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Schedule</span>
            </button>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-4">
            {/* Filter Button */}
            <div className="relative filter-dropdown-container">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">{selectedFilter}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                  isFilterDropdownOpen ? 'rotate-180' : ''
                }`} />
              </Button>
              
              {/* Filter Dropdown */}
              {isFilterDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-64 !bg-white dark:!bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50" 
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="py-2 grid grid-cols-2 gap-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => applyFilter(option.value)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 text-sm rounded-md ${
                          selectedFilter === option.value 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle - Standalone */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 px-3 py-2"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </Button>
            
            {/* Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 px-4 py-2"
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline font-medium">Search</span>
            </Button>

            {/* Pending Matches Indicator */}
            {pendingMatchesCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('chat')}
                className="relative bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 px-4 py-2"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline font-medium">Matches</span>
                <Badge className="ml-2 bg-orange-500 text-white text-xs font-semibold">
                  {pendingMatchesCount}
                </Badge>
              </Button>
            )}
            
            {/* User Profile Section with Dropdown */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.university || 'University'}</p>
              </div>
              
              {/* Profile Avatar with Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => onNavigate('my-profile')}
                  className="group/avatar relative"
                >
                  <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover/avatar:ring-blue-200 dark:group-hover/avatar:ring-blue-800 transition-all duration-200 cursor-pointer">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => onNavigate('my-profile')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-xs">View Profile</span>
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span className="text-xs">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={onSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-xs">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Interface - Full Screen Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
          <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900">
            {/* Search Header with Shadow */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Find Study Buddies</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Search for students to connect and study with</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(false)}
                className="w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search Content - Professional Layout */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
              {/* Network Status Indicator */}
              {!isOnline && (
                <div className="mx-8 mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                      You're currently offline. Some features may not work properly.
                    </p>
                  </div>
                </div>
              )}

              {/* Search Container with Professional Design */}
              <div className="max-w-5xl mx-auto px-4 py-4">
                {/* Search Input Card */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="p-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search students by name, major, or university..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        {isSearching ? (
                          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Results or States */}
                {hasSearched && searchResults.length > 0 ? (
                  // Search Results
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Search Results ({searchResults.length})
                        </h3>
                        <Badge variant="secondary" className="px-2 py-1 text-xs">
                          {searchResults.length} {searchResults.length === 1 ? 'student' : 'students'} found
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {searchResults.map((user) => (
                          <Card key={user.id} className="group cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12 ring-1 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                                    {user.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                                    {user.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    <span className="font-medium">{user.major}</span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>{user.year}</span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>{user.university}</span>
                                  </div>
                                  {user.location && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-2">
                                      <MapPin className="w-3 h-3" />
                                      <span>{user.location}</span>
                                    </div>
                                  )}
                                  {user.subjects && user.subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {user.subjects.slice(0, 3).map((subject: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                                          {subject}
                                        </Badge>
                                      ))}
                                      {user.subjects.length > 3 && (
                                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 text-gray-500 border-gray-300">
                                          +{user.subjects.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewProfile(user.id)}
                                  className="px-3 py-1.5 text-xs border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium"
                                >
                                  <User className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : hasSearched && searchResults.length === 0 && !isSearching ? (
                  // No Results Found
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        No Students Found
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        No students found matching "{searchQuery}". Try a different search term.
                      </p>
                    </div>
                  </div>
                ) : isSearching ? (
                  // Loading State
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Searching...
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Finding the best study buddies for you
                      </p>
                    </div>
                  </div>
                ) : searchError ? (
                  // Error State
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-red-200 dark:border-red-800">
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <X className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                          Search Error
                        </h3>
                        <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                          {searchError}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchError(null);
                            handleSearch();
                          }}
                          className="text-xs text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Initial State
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center py-24">
                      <Search className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-8" />
                      <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">
                        Search for Study Buddies
                      </h3>
                      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md mx-auto">
                        Start typing to discover students with similar interests and study goals
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Horizontal Cards Carousel */}
        <StudyBuddyCarousel 
          buddies={filteredBuddies.length > 0 ? filteredBuddies : (potentialBuddies.length > 0 ? potentialBuddies : mockBuddies)}
          onSwipe={handleSwipe}
          onViewProfile={onViewUserProfile}
          currentUser={user}
        />
      </div>

    </div>
  );
}