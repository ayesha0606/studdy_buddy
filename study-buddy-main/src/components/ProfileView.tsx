import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, MapPin, Star, Calendar, MessageSquare, Heart, BookOpen, Clock, Award, Users } from 'lucide-react';

interface ProfileViewProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void; // Add navigation prop
}

const profileData = {
  id: '1',
  name: 'Emma Thompson',
  age: 20,
  major: 'Computer Science',
  year: 'Junior',
  university: 'UC Berkeley',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=300&h=300&fit=crop&crop=face',
  coverImage: 'https://images.unsplash.com/photo-1722912010170-704c382ca530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc1NjUzNzUyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  bio: 'Passionate about algorithms and machine learning. I love helping fellow students understand complex CS concepts and working on coding projects together. Currently working on my senior thesis about neural networks.',
  location: '2.1 miles away',
  rating: 4.8,
  studySessions: 24,
  responseTime: '15 min',
  subjects: ['Data Structures', 'Machine Learning', 'Algorithms', 'Python', 'JavaScript', 'Database Systems'],
  studyTimes: ['Evening (5-8 PM)', 'Night (8-11 PM)', 'Weekend Mornings'],
  badges: ['Top Rated', 'Quick Responder', 'Coding Expert', 'Helpful Tutor'],
  achievements: [
    { icon: '🏆', title: 'Top 10% Rating', description: 'Consistently highly rated by study partners' },
    { icon: '📚', title: '25+ Study Sessions', description: 'Completed over 25 successful study sessions' },
    { icon: '⚡', title: 'Quick Helper', description: 'Average response time under 20 minutes' },
    { icon: '🎯', title: 'Subject Expert', description: 'Expertise verified in Computer Science' }
  ],
  interests: ['Machine Learning', 'Web Development', 'Competitive Programming', 'Tech Startups'],
  goals: 'Looking to improve my understanding of advanced algorithms and help others with foundational CS concepts. Currently preparing for FAANG interviews and would love study partners for leetcode practice.',
  availability: {
    monday: ['6:00 PM - 10:00 PM'],
    tuesday: ['7:00 PM - 9:00 PM'],
    wednesday: ['6:00 PM - 10:00 PM'],
    thursday: ['7:00 PM - 9:00 PM'],
    friday: ['6:00 PM - 8:00 PM'],
    saturday: ['10:00 AM - 2:00 PM', '7:00 PM - 10:00 PM'],
    sunday: ['10:00 AM - 12:00 PM', '7:00 PM - 9:00 PM']
  }
};

export function ProfileView({ onBack, onNavigate }: ProfileViewProps) {
  const [showConnectionPopup, setShowConnectionPopup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={onBack}
          className="bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover Image and Profile */}
        <div className="relative">
          <div className="h-64 overflow-hidden">
            <img
              src={profileData.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Profile Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end space-x-4">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-2xl">{profileData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-white">
                <h1 className="text-2xl font-bold">{profileData.name}, {profileData.age}</h1>
                <p className="text-lg opacity-90">{profileData.major} • {profileData.year}</p>
                <p className="text-sm opacity-75">{profileData.university}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold">{profileData.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <p className="font-semibold">{profileData.studySessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <p className="font-semibold">{profileData.responseTime}</p>
                <p className="text-xs text-muted-foreground">Response</p>
              </CardContent>
            </Card>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{profileData.location}</span>
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground leading-relaxed">{profileData.bio}</p>
          </div>

          {/* Badges */}
          <div>
            <h3 className="font-semibold mb-3">Badges & Recognition</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.badges.map((badge) => (
                <Badge key={badge} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="font-semibold mb-3">Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {profileData.achievements.map((achievement, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Study Subjects */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Study Subjects</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Study Times */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Preferred Study Times</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.studyTimes.map((time) => (
                <Badge key={time} variant="outline">
                  {time}
                </Badge>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <h3 className="font-semibold mb-2">Study Goals</h3>
            <p className="text-muted-foreground leading-relaxed">{profileData.goals}</p>
          </div>

          {/* Weekly Availability */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Weekly Availability</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(profileData.availability).map(([day, times]) => (
                <div key={day} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="font-medium capitalize">{day}</span>
                  <div className="flex flex-wrap gap-1">
                    {times.map((time, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-background">
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="!flex-1 !bg-blue-100 !border-2 !border-blue-500 !text-blue-900 hover:!bg-blue-200 hover:!border-blue-600 dark:!bg-blue-800 dark:!border-blue-400 dark:!text-blue-100 dark:hover:!bg-blue-700 !transition-all !duration-200 !shadow-lg !font-bold !text-base !py-3 !min-h-[48px]"
            onClick={handleMessage}
            style={{ backgroundColor: '#dbeafe !important', borderColor: '#3b82f6 !important', color: '#1e3a8a !important' }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="!font-bold">Message</span>
          </Button>
          <Button 
            className="!flex-1 !bg-blue-600 hover:!bg-blue-700 !text-white !border-2 !border-blue-500 !shadow-xl hover:!shadow-2xl !transition-all !duration-200 !font-bold !text-base !py-3 !min-h-[48px]"
            onClick={handleConnect}
            disabled={isConnecting}
            style={{ backgroundColor: '#2563eb !important', borderColor: '#3b82f6 !important', color: 'white !important' }}
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="!font-bold !text-white">{isConnecting ? 'Connecting...' : 'Connect'}</span>
          </Button>
        </div>
      </div>

      {/* Connection Success Popup */}
      {showConnectionPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConnectionPopup(false)}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border-2 border-green-500 relative"
          >
            {/* Content */}
            <div className="relative z-10">
              {/* Celebration Icon */}
              <div className="mb-4">
                <div className="text-5xl mb-3">🎉</div>
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Successfully Connected!
              </h2>
              
              {/* Description */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                You are now connected with <span className="font-bold text-green-600">{profileData.name}</span>! 
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
                  <MessageSquare className="w-4 h-4 mr-2" />
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