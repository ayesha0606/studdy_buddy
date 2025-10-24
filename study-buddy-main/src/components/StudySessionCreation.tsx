import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, Plus, Calendar, Clock, MapPin, Users, BookOpen, 
  Video, Monitor, Edit, Trash2, Check, X, Search, Filter, RefreshCw
} from 'lucide-react';
import { scheduleAPI } from '../services/api';

interface StudySessionCreationProps {
  onBack: () => void;
  user: any;
}

interface SessionFormData {
  title: string;
  description: string;
  subject: string;
  sessionType: 'in-person' | 'virtual';
  location: string;
  virtualLink: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
}

export function StudySessionCreation({ onBack, user }: StudySessionCreationProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'my-sessions' | 'discover'>('create');
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    description: '',
    subject: '',
    sessionType: 'in-person',
    location: '',
    virtualLink: '',
    startTime: '',
    endTime: '',
    maxParticipants: 5
  });

  // Load user's sessions
  useEffect(() => {
    if (activeTab === 'my-sessions') {
      loadMySessions();
    } else if (activeTab === 'discover') {
      loadDiscoverSessions();
    }
  }, [activeTab]);

  const loadMySessions = async () => {
    setIsLoading(true);
    try {
      const response = await scheduleAPI.getSessions();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiscoverSessions = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (sessionTypeFilter !== 'all') {
        filters.type = sessionTypeFilter;
      }
      const response = await scheduleAPI.getSessions(filters);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading discover sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SessionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-set end time if it's empty and we're setting start time
    if (field === 'startTime' && value && !formData.endTime) {
      const startDate = new Date(value as string);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
      setFormData(prev => ({
        ...prev,
        endTime: endDate.toISOString().slice(0, 16)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Please enter a session title');
        return;
      }
      
      if (!formData.startTime || !formData.endTime) {
        alert('Please select both start and end times');
        return;
      }
      
      if (formData.sessionType === 'in-person' && !formData.location.trim()) {
        alert('Please enter a location for in-person sessions');
        return;
      }
      
      // Check if end time is after start time
      if (formData.startTime && formData.endTime) {
        const startDate = new Date(formData.startTime);
        const endDate = new Date(formData.endTime);
        
        if (endDate <= startDate) {
          alert('End time must be after start time');
          return;
        }
        
        // Check if start time is in the future
        const now = new Date();
        if (startDate <= now) {
          alert('Start time must be in the future');
          return;
        }
      }
      
      // Convert datetime-local values to ISO8601 format and clean up empty fields
      const sessionData: any = {
        title: formData.title.trim(),
        sessionType: formData.sessionType,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : '',
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : '',
        maxParticipants: formData.maxParticipants || 2
      };

      // Only include non-empty optional fields
      if (formData.description?.trim()) {
        sessionData.description = formData.description.trim();
      }
      
      if (formData.subject?.trim()) {
        sessionData.subject = formData.subject.trim();
      }

      // Only include location for in-person sessions
      if (formData.sessionType === 'in-person' && formData.location) {
        sessionData.location = formData.location;
      }

      // Only include virtualLink for virtual sessions and when it has a value
      if (formData.sessionType === 'virtual' && formData.virtualLink) {
        sessionData.virtualLink = formData.virtualLink;
      }
      
      console.log('Sending session data:', sessionData);
      console.log('Session data validation:');
      console.log('- title:', sessionData.title, 'valid:', !!sessionData.title?.trim());
      console.log('- sessionType:', sessionData.sessionType, 'valid:', ['in-person', 'virtual'].includes(sessionData.sessionType));
      console.log('- startTime:', sessionData.startTime, 'valid:', sessionData.startTime && !isNaN(new Date(sessionData.startTime).getTime()));
      console.log('- endTime:', sessionData.endTime, 'valid:', sessionData.endTime && !isNaN(new Date(sessionData.endTime).getTime()));
      console.log('- maxParticipants:', sessionData.maxParticipants, 'valid:', sessionData.maxParticipants >= 2 && sessionData.maxParticipants <= 10);
      
      const response = await scheduleAPI.createSession(sessionData);
      console.log('Session created:', response.session);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        sessionType: 'in-person',
        location: '',
        virtualLink: '',
        startTime: '',
        endTime: '',
        maxParticipants: 5
      });
      
      // Switch to my sessions tab
      setActiveTab('my-sessions');
      await loadMySessions();
    } catch (error: any) {
      console.error('Error creating session:', error);
      
      // Show detailed error information
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status:', error.response.status);
        
        if (error.response.data && error.response.data.error) {
          alert(`Error: ${error.response.data.error}`);
        } else if (error.response.data && error.response.data.details) {
          const details = error.response.data.details;
          const errorMessages = details.map((detail: any) => `${detail.path}: ${detail.msg}`).join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          alert('Failed to create study session. Please check your input and try again.');
        }
      } else {
        alert('Failed to create study session. Please check your input and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      await scheduleAPI.joinSession(sessionId);
      await loadDiscoverSessions(); // Refresh the list
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      await scheduleAPI.leaveSession(sessionId);
      await loadMySessions(); // Refresh the list
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      try {
        await scheduleAPI.cancelSession(sessionId);
        await loadMySessions(); // Refresh the list
      } catch (error) {
        console.error('Error canceling session:', error);
      }
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-lg font-semibold">Study Sessions</h1>
        <div></div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'create'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          Create Session
        </button>
        <button
          onClick={() => setActiveTab('my-sessions')}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my-sessions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2 inline" />
          My Sessions
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'discover'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Search className="w-4 h-4 mr-2 inline" />
          Discover
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Study Session</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Calculus Study Group"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="What will you be studying?"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject *</label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="e.g., Mathematics"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Participants</label>
                      <Input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                        min="2"
                        max="20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Session Type *</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sessionType"
                          value="in-person"
                          checked={formData.sessionType === 'in-person'}
                          onChange={(e) => handleInputChange('sessionType', e.target.value)}
                          className="text-blue-600"
                        />
                        <MapPin className="w-4 h-4" />
                        <span>In-Person</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sessionType"
                          value="virtual"
                          checked={formData.sessionType === 'virtual'}
                          onChange={(e) => handleInputChange('sessionType', e.target.value)}
                          className="text-blue-600"
                        />
                        <Video className="w-4 h-4" />
                        <span>Virtual</span>
                      </label>
                    </div>
                  </div>

                  {formData.sessionType === 'in-person' ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">Location *</label>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Main Library, Room 301"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">Virtual Link</label>
                      <Input
                        value={formData.virtualLink}
                        onChange={(e) => handleInputChange('virtualLink', e.target.value)}
                        placeholder="e.g., https://meet.google.com/..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time *</label>
                      <Input
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time *</label>
                      <Input
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        min={formData.startTime || new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Study Session'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'my-sessions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Study Sessions</h2>
              <Button onClick={loadMySessions} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading sessions...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sessions found. Create your first study session!
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isOwner={session.created_by === user?.id}
                    onJoin={() => handleJoinSession(session.id)}
                    onLeave={() => handleLeaveSession(session.id)}
                    onCancel={() => handleCancelSession(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <select
                value={sessionTypeFilter}
                onChange={(e) => setSessionTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-foreground"
              >
                <option value="all">All Types</option>
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
              </select>
              <Button onClick={loadDiscoverSessions} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading sessions...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sessions found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isOwner={session.created_by === user?.id}
                    onJoin={() => handleJoinSession(session.id)}
                    onLeave={() => handleLeaveSession(session.id)}
                    onCancel={() => handleCancelSession(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Session Card Component
function SessionCard({ session, isOwner, onJoin, onLeave, onCancel }: {
  session: any;
  isOwner: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onCancel: () => void;
}) {
  const isParticipant = session.participants?.some((p: any) => p.user_id === session.currentUserParticipation?.user_id);
  const isPast = new Date(session.start_time) < new Date();
  const isUpcoming = new Date(session.start_time) > new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{session.title}</h3>
              <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                {session.status}
              </Badge>
              {session.session_type === 'virtual' && (
                <Badge variant="outline">
                  <Video className="w-3 h-3 mr-1" />
                  Virtual
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mb-3">{session.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span>{session.subject}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(session.start_time).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{session.participantCount || 0}/{session.max_participants} participants</span>
              </div>
            </div>

            {session.session_type === 'in-person' && session.location && (
              <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{session.location}</span>
              </div>
            )}

            {session.session_type === 'virtual' && session.virtual_link && (
              <div className="mt-2">
                <a 
                  href={session.virtual_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Join Virtual Session →
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            {isOwner ? (
              <>
                <Button size="sm" variant="outline" onClick={() => {}}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={onCancel}
                  disabled={isPast}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {!isPast && (
                  isParticipant ? (
                    <Button size="sm" variant="outline" onClick={onLeave}>
                      <X className="w-4 h-4 mr-1" />
                      Leave
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={onJoin}
                      disabled={session.participantCount >= session.max_participants}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
