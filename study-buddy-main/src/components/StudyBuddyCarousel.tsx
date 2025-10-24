import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Heart, X, MapPin, Clock, BookOpen, Star, Zap, 
  UserPlus, UserMinus, User, ChevronLeft, ChevronRight
} from 'lucide-react';

interface StudyBuddyCarouselProps {
  buddies: any[];
  onSwipe: (direction: 'left' | 'right') => void;
  onViewProfile: (userId: string) => void;
  currentUser?: any;
}

interface BuddyCardProps {
  buddy: any;
  isCenter: boolean;
  index: number;
  onSwipe: (direction: 'left' | 'right') => void;
  onViewProfile: (userId: string) => void;
  onClick: () => void;
  totalCards: number;
  onNextCard: (nextIndex: number) => void;
}

function BuddyCard({ buddy, isCenter, index, onSwipe, onViewProfile, onClick, totalCards, onNextCard }: BuddyCardProps) {
  // Normalize buddy data with fallbacks
  const normalizedBuddy = {
    ...buddy,
    subjects: (Array.isArray(buddy.subjects) && buddy.subjects.length > 0) 
      ? buddy.subjects 
      : ['General Studies'],
    studyTimes: (Array.isArray(buddy.studyTimes) && buddy.studyTimes.length > 0) 
      ? buddy.studyTimes 
      : [{ day: 'Any', time: 'Flexible' }],
    badges: (Array.isArray(buddy.badges) && buddy.badges.length > 0) 
      ? buddy.badges 
      : ['New'],
    rating: (typeof buddy.rating === 'number' && buddy.rating > 0) 
      ? buddy.rating 
      : 4.5,
    studySessions: (typeof buddy.studySessions === 'number') 
      ? buddy.studySessions 
      : 0,
    location: buddy.location || 'Nearby',
    bio: buddy.bio || 'Looking for study partners to collaborate and learn together!'
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.6 }}
      animate={{ 
        scale: isCenter ? 1.05 : 0.85, 
        opacity: isCenter ? 1 : 0.7,
        zIndex: isCenter ? 10 : 1
      }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={`relative cursor-pointer ${isCenter ? 'shadow-2xl' : 'shadow-lg'}`}
      onClick={onClick}
      style={{ 
        minWidth: '300px', 
        maxWidth: '300px',
        margin: '0 5px'
      }}
    >
      <Card className={`overflow-hidden border-0 h-[520px] ${
        isCenter 
          ? 'bg-white dark:bg-gray-800 ring-2 ring-blue-500 dark:ring-blue-400' 
          : 'bg-gray-50 dark:bg-gray-700'
      } transition-all duration-300`}>
        <div className="relative h-64">
          <img
            src={buddy.avatar || "https://images.unsplash.com/photo-1722912010170-704c382ca530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc1NjUzNzUyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
            alt="Study session"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-1">
            {normalizedBuddy.badges.map((badgeItem: any, badgeIndex: number) => {
              const badgeText = typeof badgeItem === 'string' 
                ? badgeItem 
                : badgeItem?.name || badgeItem?.title || 'New';
              return (
                <Badge key={badgeIndex} className="bg-green-500 text-white text-xs shadow-md">
                  <Zap className="w-3 h-3 mr-1" />
                  {badgeText}
                </Badge>
              );
            })}
          </div>

          {/* Center Card Indicator */}
          {isCenter && (
            <div className="absolute top-4 right-4">
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md font-medium">
                Featured
              </div>
            </div>
          )}

          {/* Avatar and basic info */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-3">
            <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
              <AvatarImage src={normalizedBuddy.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {normalizedBuddy.name?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h2 className="text-lg font-bold drop-shadow-md">
                {normalizedBuddy.name || 'Study Buddy'}
                {normalizedBuddy.age ? `, ${normalizedBuddy.age}` : ''}
              </h2>
              <p className="text-sm opacity-90 drop-shadow-md">
                {normalizedBuddy.major || 'Student'} • {normalizedBuddy.year || 'Undergraduate'}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3 flex-1">
          {/* Rating and location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {normalizedBuddy.rating}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({normalizedBuddy.studySessions} sessions)
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{normalizedBuddy.location}</span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
            {normalizedBuddy.bio}
          </p>

          {/* Subjects */}
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Study Subjects</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {normalizedBuddy.subjects.slice(0, 3).map((subjectItem: any, subjectIndex: number) => {
                const subjectText = typeof subjectItem === 'string' 
                  ? subjectItem 
                  : subjectItem?.subject || subjectItem?.name || 'General Studies';
                return (
                  <Badge key={subjectIndex} variant="secondary" className="text-xs">
                    {subjectText}
                  </Badge>
                );
              })}
              {normalizedBuddy.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{normalizedBuddy.subjects.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Study Times */}
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Available Times</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {normalizedBuddy.studyTimes.slice(0, 2).map((timeItem: any, timeIndex: number) => {
                const timeText = typeof timeItem === 'string' 
                  ? timeItem 
                  : timeItem?.time || timeItem?.day || 'Flexible';
                return (
                  <Badge key={timeIndex} variant="outline" className="text-xs">
                    {timeText}
                  </Badge>
                );
              })}
              {normalizedBuddy.studyTimes.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{normalizedBuddy.studyTimes.length - 2}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons - Show on all cards */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="px-4 py-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe('left');
                  // Move to next card after action
                  if (index < totalCards - 1) {
                    setTimeout(() => {
                      onNextCard(index + 1);
                    }, 100);
                  }
                }}
              >
                <UserMinus className="w-4 h-4 mr-1" />
                Pass
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="px-4 py-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe('right');
                  // Move to next card after action
                  if (index < totalCards - 1) {
                    setTimeout(() => {
                      onNextCard(index + 1);
                    }, 100);
                  }
                }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StudyBuddyCarousel({ buddies, onSwipe, onViewProfile, currentUser }: StudyBuddyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to specific card
  const scrollToCard = (index: number) => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const cardWidth = 310; // 300px card + 10px gap
    const targetScroll = index * cardWidth;
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Calculate center card index based on scroll position
  const updateCenterIndex = () => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const scrollPosition = container.scrollLeft;
    const cardWidth = 310; // 300px card + 10px gap
    const newIndex = Math.round(scrollPosition / cardWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < buddies.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Navigation functions
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      scrollToCard(newIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < buddies.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      scrollToCard(newIndex);
    }
  };

  // Handle moving to next card
  const handleNextCard = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    scrollToCard(nextIndex);
  };

  // Initialize carousel to show first card in center
  useEffect(() => {
    if (carouselRef.current && buddies.length > 0) {
      scrollToCard(0);
    }
  }, [buddies]);

  if (!buddies || buddies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
            No Study Buddies Found
          </h3>
          <p className="text-gray-400 dark:text-gray-500">
            We're looking for perfect matches for you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Discover Study Buddies
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Find your perfect study partners • {buddies.length} potential matches
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="rounded-full w-14 h-14 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 hover:shadow-2xl"
        >
          <ChevronLeft className="w-7 h-7" />
        </Button>
      </div>

      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex === buddies.length - 1}
          className="rounded-full w-14 h-14 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 hover:shadow-2xl"
        >
          <ChevronRight className="w-7 h-7" />
        </Button>
      </div>

      {/* Cards Carousel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-hidden scrollbar-hide py-4 px-20 w-full"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          gap: '10px', // Reduced gap between cards
          paddingLeft: 'calc(50% - 150px)', // Center the first card
          paddingRight: 'calc(50% - 150px)', // Center the last card
        }}
      >
        {buddies.map((buddy, index) => (
          <div 
            key={buddy.id || index} 
            style={{ 
              scrollSnapAlign: 'center',
              flex: '0 0 auto' // Prevent flex shrinking
            }}
          >
            <BuddyCard
              buddy={buddy}
              isCenter={index === currentIndex}
              index={index}
              onSwipe={onSwipe}
              onViewProfile={onViewProfile}
              onClick={() => {
                if (index !== currentIndex) {
                  setCurrentIndex(index);
                  scrollToCard(index);
                } else {
                  // If clicking the center card, show profile
                  onViewProfile(buddies[index].id);
                }
              }}
              totalCards={buddies.length}
              onNextCard={handleNextCard}
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-6">
        {buddies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              scrollToCard(index);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-500 scale-125'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Current Card Info */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {currentIndex + 1} of {buddies.length} • Use Pass/Connect buttons to navigate
        </p>
      </div>
    </div>
  );
}