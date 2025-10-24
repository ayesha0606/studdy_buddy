import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  ArrowLeft, MapPin, Star, Calendar, MessageSquare, Heart, BookOpen, Clock, 
  Award, User, Settings, Activity, Trophy, Search, Users
} from 'lucide-react';
import { usersAPI } from '../services/api';

interface UserProfileProps {
  onBack: () => void;
  userId: string;
  onNavigate?: (screen: string) => void; // Add navigation prop
}

interface UserProfileData {
  id: string;
  name: string;
  university?: string;
  major?: string;
  year?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  created_at: string;
  subjects: Array<{
    subject: string;
    proficiency_level: string;
  }>;
  studyTimes: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
}

export function UserProfile({ onBack, userId, onNavigate }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showConnectionPopup, setShowConnectionPopup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfile();
    loadLikeInfo();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getProfileById(userId);
      setProfile(response.user);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLikeInfo = async () => {
    try {
      const [likeCountResponse, likedResponse] = await Promise.all([
        usersAPI.getLikeCount(userId),
        usersAPI.checkIfLiked(userId)
      ]);
      setLikeCount(likeCountResponse.likeCount);
      setHasLiked(likedResponse.hasLiked);
    } catch (error) {
      console.error('Error loading like info:', error);
    }
  };

  const handleLike = async () => {
    try {
      setIsLiking(true);
      if (hasLiked) {
        await usersAPI.unlikeUser(userId);
        setLikeCount(prev => prev - 1);
        setHasLiked(false);
      } else {
        await usersAPI.likeUser(userId);
        setLikeCount(prev => prev + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleMessage = () => {
    // Navigate to chat interface
    if (onNavigate) {
      onNavigate('chat');
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success popup
      setShowConnectionPopup(true);
      
      // Remove auto-hide - popup will stay until manually closed
      
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between p-6">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between p-6">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Error</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">Failed to load profile</p>
            <Button onClick={loadProfile} className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500 font-bold text-base px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between p-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Study buddy details</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Enhanced Profile Header with Gradient Background */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-800">
            {/* Gradient Background */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-32 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <CardContent className="p-6 -mt-16 relative">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-xl">
                    <AvatarImage src={profile.avatar} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {profile.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 mt-16">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{profile.name}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{profile.university}</p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">{profile.location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* Message Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMessage}
                      className="!flex !items-center !space-x-2 !bg-blue-100 !border-2 !border-blue-500 !text-blue-900 hover:!bg-blue-200 hover:!border-blue-600 dark:!bg-blue-800 dark:!border-blue-400 dark:!text-blue-100 dark:hover:!bg-blue-700 !transition-all !duration-200 !shadow-lg !font-bold !text-base !px-4 !py-2 !min-h-[44px]"
                      style={{ backgroundColor: '#dbeafe !important', borderColor: '#3b82f6 !important', color: '#1e3a8a !important' }}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="!font-bold">Message</span>
                    </Button>
                    
                    {/* Connect Button */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="!flex !items-center !space-x-2 !bg-blue-600 hover:!bg-blue-700 !text-white !shadow-xl hover:!shadow-2xl !transition-all !duration-200 !border-2 !border-blue-500 !font-bold !text-base !px-4 !py-2 !min-h-[44px]"
                      style={{ backgroundColor: '#2563eb !important', borderColor: '#3b82f6 !important', color: 'white !important' }}
                    >
                      <Users className="w-5 h-5" />
                      <span className="!font-bold !text-white">{isConnecting ? 'Connecting...' : 'Connect'}</span>
                    </Button>
                    
                    {/* Like Button */}
                    <Button
                      variant={hasLiked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`!flex !items-center !space-x-2 !transition-all !duration-200 !shadow-lg !font-bold !text-base !px-4 !py-2 !min-h-[44px] ${
                        hasLiked 
                          ? '!bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 !text-white !shadow-xl !border-2 !border-red-500' 
                          : '!bg-red-100 !border-2 !border-red-500 !text-red-900 hover:!bg-red-200 hover:!border-red-600 dark:!bg-red-800 dark:!border-red-400 dark:!text-red-100 dark:hover:!bg-red-700'
                      }`}
                      style={hasLiked 
                        ? { backgroundColor: '#dc2626 !important', borderColor: '#ef4444 !important', color: 'white !important' }
                        : { backgroundColor: '#fecaca !important', borderColor: '#ef4444 !important', color: '#7f1d1d !important' }
                      }
                    >
                      <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                      <span className="!font-bold">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Basic Information */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 border-b border-gray-200/50 dark:border-gray-600/50">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <User className="w-5 h-5 mr-3 text-blue-500" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Major</p>
                  </div>
                  <p className="text-base text-gray-900 dark:text-white font-medium ml-4">
                    {profile.major || 'Not specified'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</p>
                  </div>
                  <p className="text-base text-gray-900 dark:text-white font-medium ml-4">
                    {profile.year || 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</p>
                  </div>
                  <div className="ml-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-base text-gray-900 dark:text-white leading-relaxed">
                      {profile.bio || 'No bio yet'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Study Subjects */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200/50 dark:border-emerald-700/50">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <BookOpen className="w-5 h-5 mr-3 text-emerald-500" />
                Study Subjects
                <Badge className="ml-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {profile.subjects?.length || 0} subjects
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {profile.subjects && profile.subjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.subjects.map((subject, index) => {
                    const colors = [
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
                      'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
                      'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
                      'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
                      'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
                      'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                    ];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <div key={index} className={`${colorClass} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                        <div className="font-semibold text-sm mb-1">{subject.subject}</div>
                        <div className="text-xs opacity-90 font-medium">
                          Level: {subject.proficiency_level}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No subjects added yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">This user hasn't specified their study subjects</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Study Schedule */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b border-violet-200/50 dark:border-violet-700/50">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <Clock className="w-5 h-5 mr-3 text-violet-500" />
                Study Schedule
                <Badge className="ml-3 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  {profile.studyTimes?.length || 0} time slots
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {profile.studyTimes && profile.studyTimes.length > 0 ? (
                <div className="space-y-3">
                  {profile.studyTimes.map((time, index) => {
                    const dayColors = {
                      'Monday': 'bg-gradient-to-r from-red-500 to-red-600',
                      'Tuesday': 'bg-gradient-to-r from-orange-500 to-orange-600',
                      'Wednesday': 'bg-gradient-to-r from-yellow-500 to-yellow-600',
                      'Thursday': 'bg-gradient-to-r from-green-500 to-green-600',
                      'Friday': 'bg-gradient-to-r from-blue-500 to-blue-600',
                      'Saturday': 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                      'Sunday': 'bg-gradient-to-r from-purple-500 to-purple-600'
                    };
                    
                    const colorClass = dayColors[time.day_of_week as keyof typeof dayColors] || 'bg-gradient-to-r from-gray-500 to-gray-600';
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className={`${colorClass} text-white px-3 py-2 rounded-lg shadow-md`}>
                            <span className="font-bold text-sm">{time.day_of_week.slice(0, 3).toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">{time.day_of_week}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {time.start_time} - {time.end_time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No study times scheduled yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">This user hasn't set up their study schedule</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Connection Success Popup */}
      {showConnectionPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowConnectionPopup(false)}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-green-500 dark:border-green-400 relative"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: undefined }}
          >
            
            {/* Content */}
            <div className="relative z-10">
              {/* Celebration Icon with Animation */}
              <div className="mb-6">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Successfully Connected!
              </h2>
              
              {/* Description */}
              <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                You are now connected with <span className="font-bold text-green-600 dark:text-green-400">{profile?.name}</span>! 
                You can now start chatting and collaborating on study sessions.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => {
                    setShowConnectionPopup(false);
                    handleMessage();
                  }}
                  className="!bg-blue-600 !hover:bg-blue-700 !text-white !border-2 !border-blue-500 !font-bold !py-3 !px-6 !shadow-xl hover:!shadow-2xl !transition-all !duration-200 !text-base !min-h-[48px] !w-full !rounded-lg"
                  style={{ backgroundColor: '#2563eb !important', color: 'white !important', border: '2px solid #3b82f6 !important' }}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  <span className="!font-bold !text-white">Start Chatting Now</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowConnectionPopup(false)}
                  className="!border-2 !border-gray-600 hover:!border-gray-800 !text-gray-900 dark:!text-gray-100 dark:!border-gray-400 dark:hover:!border-gray-300 !font-bold !py-3 !px-6 !bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-600 dark:hover:!bg-gray-500 !transition-all !duration-200 !shadow-lg !text-base !min-h-[48px] !w-full !rounded-lg"
                >
                  <span className="!font-bold">Continue Browsing</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
