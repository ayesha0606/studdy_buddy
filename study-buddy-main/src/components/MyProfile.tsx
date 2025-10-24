import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, MapPin, Star, Calendar, MessageSquare, Heart, BookOpen, Clock, 
  Award, Edit, Save, X, Plus, Trash2, User, Settings, Activity, Trophy, LogOut
} from 'lucide-react';
import api, { usersAPI, authAPI, scheduleAPI } from '../services/api';

interface MyProfileProps {
  onBack: () => void;
  user: any;
  onSignOut: () => void;
  onNavigate?: (screen: string) => void; // Add navigation prop
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  university?: string;
  major?: string;
  year?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  study_preferences?: string;
  created_at?: string;
  updated_at?: string;
  subjects: Array<{
    id: number;
    subject: string;
    proficiency_level: string;
  }>;
  studyTimes: Array<{
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
  preferences?: Record<string, string>;
}

interface UserStats {
  totalSessions: number;
  averageRating: string;
  totalMatches: number;
  totalConversations: number;
  totalLikes: number;
}

export function MyProfile({ onBack, user, onSignOut, onNavigate }: MyProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfile();
    loadStats();
    loadSessions();
  }, []);

  // Debug: Add some test data if no subjects/study times exist
  useEffect(() => {
    if (profile && (!profile.subjects || profile.subjects.length === 0)) {
      console.log('No subjects found, profile data:', profile);
    }
    if (profile && (!profile.studyTimes || profile.studyTimes.length === 0)) {
      console.log('No study times found, profile data:', profile);
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getProfile();
      console.log('Profile data received:', response.user);
      console.log('User ID from response:', response.user.id);
      
      // Ensure subjects and studyTimes are arrays and handle optional fields safely
      const userData: UserProfile = {
        ...response.user,
        subjects: response.user.subjects || [],
        studyTimes: response.user.studyTimes || [],
        preferences: response.user.preferences || {}
      } as UserProfile;
      
      console.log('Processed user data:', userData);
      setProfile(userData);
      setEditData(userData);

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await usersAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await scheduleAPI.getSessions();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };



  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update basic profile info
      await authAPI.updateProfile({
        name: editData.name,
        university: editData.university,
        major: editData.major,
        year: editData.year,
        bio: editData.bio,
        location: editData.location
      });

      // Update subjects if changed
      if (editData.subjects) {
        await usersAPI.updateSubjects(editData.subjects);
      }



      // Reload profile data
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile || {});
    setIsEditing(false);
  };

  const addSubject = () => {
    const newSubject = {
      id: Date.now(), // Temporary ID
      subject: '',
      proficiency_level: 'beginner'
    };
    setEditData(prev => ({
      ...prev,
      subjects: [...(prev.subjects || []), newSubject]
    }));
  };

  const removeSubject = (index: number) => {
    setEditData(prev => ({
      ...prev,
      subjects: prev.subjects?.filter((_, i) => i !== index)
    }));
  };

  const updateSubject = (index: number, field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      subjects: prev.subjects?.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };



  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">My Profile</h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">My Profile</h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load profile</p>
            <Button onClick={loadProfile} className="mt-2">Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header with Gradient */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your study buddy profile</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="transition-all duration-200"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Content with Better Spacing */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Enhanced Profile Header with Modern Design */}
          <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24"></div>
            <CardContent className="p-6 -mt-12 relative">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={profile.avatar} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {profile.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 mt-12">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        className="font-semibold text-lg"
                      />
                      <Input
                        value={editData.university || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, university: e.target.value }))}
                        placeholder="University"
                        className="text-base"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">{profile.university}</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium">{stats?.totalLikes || 0} {(stats?.totalLikes || 0) === 1 ? 'like' : 'likes'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                          <User className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium">
                            Member since {profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Stats Grid with Better Visual Design */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Average Rating</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Study Sessions</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMatches}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Matches</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Conversations</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Tabs with Modern Design */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 transition-all duration-200">Basic Info</TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 transition-all duration-200">Subjects</TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 transition-all duration-200">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-700/50">
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="major">Major</Label>
                      {isEditing ? (
                        <Input
                          id="major"
                          value={editData.major || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, major: e.target.value }))}
                          placeholder="Your major"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profile.major || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      {isEditing ? (
                        <Select
                          value={editData.year || ''}
                          onValueChange={(value) => setEditData(prev => ({ ...prev, year: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Freshman">Freshman</SelectItem>
                            <SelectItem value="Sophomore">Sophomore</SelectItem>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profile.year || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={editData.location || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Your location"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{profile.location || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={editData.bio || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{profile.bio || 'No bio yet'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4 mt-6">
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                      Study Subjects
                    </CardTitle>
                    {isEditing && (
                      <Button size="sm" onClick={addSubject} className="bg-green-500 hover:bg-green-600 text-white">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Subject
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      {editData.subjects?.map((subject, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={subject.subject}
                            onChange={(e) => updateSubject(index, 'subject', e.target.value)}
                            placeholder="Subject name"
                            className="flex-1"
                          />
                          <Select
                            value={subject.proficiency_level}
                            onValueChange={(value) => updateSubject(index, 'proficiency_level', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSubject(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.subjects?.map((subject) => (
                        <Badge key={subject.id} variant="secondary" className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {subject.subject} ({subject.proficiency_level})
                        </Badge>
                      ))}
                      {(!profile.subjects || profile.subjects.length === 0) && (
                        <div className="text-center py-8 w-full">
                          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">No subjects added yet</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your study subjects to help others find you</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

                         <TabsContent value="schedule" className="space-y-4 mt-6">
               <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
                 <CardHeader className="bg-gray-50 dark:bg-gray-700/50">
                   <div className="flex items-center justify-between">
                     <CardTitle className="flex items-center text-lg">
                       <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                       My Study Sessions
                     </CardTitle>
                     <Button size="sm" onClick={() => onNavigate?.('schedule')} className="bg-purple-500 hover:bg-purple-600 text-white">
                       <Plus className="w-4 h-4 mr-1" />
                       Create Session
                     </Button>
                   </div>
                 </CardHeader>
                 <CardContent className="p-6">
                   <div className="space-y-4">
                     {sessions.length > 0 ? (
                       sessions.map((session) => (
                         <div key={session.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 hover:shadow-sm transition-shadow duration-200">
                           <div className="flex items-start justify-between">
                             <div className="flex-1">
                               <h4 className="font-semibold text-base text-gray-900 dark:text-white">{session.title}</h4>
                               <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                 {session.subject && `${session.subject} • `}
                                 {session.session_type === 'in-person' ? 'In-Person' : 'Virtual'}
                               </p>
                               <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                                 <Calendar className="w-4 h-4 mr-2" />
                                 {new Date(session.start_time).toLocaleDateString()} at{' '}
                                 {new Date(session.start_time).toLocaleTimeString([], { 
                                   hour: '2-digit', 
                                   minute: '2-digit' 
                                 })}
                               </div>
                               {session.location && (
                                 <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                   <MapPin className="w-4 h-4 mr-2" />
                                   {session.location}
                                 </div>
                               )}
                             </div>
                             <Badge 
                               variant={
                                 session.status === 'scheduled' ? 'default' :
                                 session.status === 'in-progress' ? 'secondary' :
                                 session.status === 'completed' ? 'outline' : 'destructive'
                               }
                               className="ml-4"
                             >
                               {session.status}
                             </Badge>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-12">
                         <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                         <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No study sessions yet</p>
                         <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                           Create your first study session to get started
                         </p>
                         <Button 
                           onClick={() => onNavigate?.('schedule')} 
                           className="mt-4 bg-purple-500 hover:bg-purple-600 text-white"
                         >
                           <Plus className="w-4 h-4 mr-2" />
                           Create Your First Session
                         </Button>
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Action Buttons with Better Design */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="flex-1 py-3 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Changes
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
