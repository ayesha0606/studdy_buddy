import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video, Users, Plus } from 'lucide-react';

interface ScheduleSystemProps {
  onBack: () => void;
}

const upcomingSessions = [
  {
    id: '1',
    title: 'Algorithms Study Session',
    partner: {
      name: 'Emma Thompson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face'
    },
    date: '2025-01-02',
    time: '2:00 PM - 4:00 PM',
    location: 'Main Library - 3rd Floor',
    type: 'in-person',
    subject: 'Computer Science',
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Calculus Problem Solving',
    partner: {
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    date: '2025-01-03',
    time: '10:00 AM - 12:00 PM',
    location: 'Virtual (Zoom)',
    type: 'virtual',
    subject: 'Mathematics',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Biology Lab Prep',
    partner: {
      name: 'Sofia Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    date: '2025-01-04',
    time: '1:00 PM - 3:00 PM',
    location: 'Science Building - Room 201',
    type: 'in-person',
    subject: 'Biology',
    status: 'confirmed'
  }
];

const recentSessions = [
  {
    id: '4',
    title: 'Data Structures Review',
    partner: {
      name: 'Emma Thompson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face'
    },
    date: '2024-12-28',
    time: '3:00 PM - 5:00 PM',
    rating: 5,
    feedback: 'Excellent session! Emma explained linked lists really well.',
    subject: 'Computer Science'
  },
  {
    id: '5',
    title: 'Calculus Integration',
    partner: {
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    date: '2024-12-26',
    time: '11:00 AM - 1:00 PM',
    rating: 4,
    feedback: 'Great help with integration by parts.',
    subject: 'Mathematics'
  }
];

export function ScheduleSystem({ onBack }: ScheduleSystemProps) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'calendar' | 'history'>('upcoming');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderUpcoming = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Upcoming Sessions</h2>
        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="w-4 h-4 mr-1" />
          New Session
        </Button>
      </div>

      {upcomingSessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={session.partner.avatar} />
                <AvatarFallback>{session.partner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">with {session.partner.name}</p>
                  </div>
                  <Badge className={getStatusColor(session.status)} variant="outline">
                    {session.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {session.type === 'virtual' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <span>{session.location}</span>
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    {session.subject}
                  </Badge>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm">
                    Message
                  </Button>
                  {session.type === 'virtual' && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      Join Video
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-4">
      <h2 className="font-semibold">Study Calendar</h2>
      
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md"
            modifiers={{
              booked: [new Date(2025, 0, 2), new Date(2025, 0, 3), new Date(2025, 0, 4)]
            }}
            modifiersStyles={{
              booked: { backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px' }
            }}
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <div className="space-y-2">
          <h3 className="font-medium">
            Sessions on {selectedDate.toLocaleDateString()}
          </h3>
          
          {upcomingSessions
            .filter(session => new Date(session.date).toDateString() === selectedDate.toDateString())
            .map(session => (
              <Card key={session.id}>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={session.partner.avatar} />
                      <AvatarFallback className="text-xs">{session.partner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{session.title}</p>
                      <p className="text-xs text-muted-foreground">{session.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          }
          
          {upcomingSessions.filter(session => 
            new Date(session.date).toDateString() === selectedDate.toDateString()
          ).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sessions scheduled for this date
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <h2 className="font-semibold">Session History</h2>
      
      {recentSessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={session.partner.avatar} />
                <AvatarFallback>{session.partner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">with {session.partner.name}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < session.rating ? 'bg-yellow-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{session.time}</span>
                  </div>
                </div>
                
                <Badge variant="secondary" className="text-xs mb-2">
                  {session.subject}
                </Badge>
                
                <p className="text-sm text-muted-foreground italic">
                  "{session.feedback}"
                </p>
                
                <div className="flex space-x-2 mt-3">
                  <Button variant="outline" size="sm">
                    Book Again
                  </Button>
                  <Button variant="outline" size="sm">
                    Leave Review
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Schedule</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{upcomingSessions.length} upcoming</Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { key: 'upcoming', label: 'Upcoming', icon: CalendarIcon },
          { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
          { key: 'history', label: 'History', icon: Clock }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
              selectedTab === key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'upcoming' && renderUpcoming()}
          {selectedTab === 'calendar' && renderCalendar()}
          {selectedTab === 'history' && renderHistory()}
        </motion.div>
      </div>
    </div>
  );
}