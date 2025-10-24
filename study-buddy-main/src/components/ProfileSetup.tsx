import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Plus, X, Camera, BookOpen, Clock, Target, Upload } from 'lucide-react';
import { authAPI } from '../services/api';

interface ProfileSetupProps {
  onComplete: () => void;
}

const availableSubjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Psychology', 'Economics', 'History', 'Literature', 'Philosophy',
  'Engineering', 'Business', 'Art', 'Music', 'Medicine'
];

const studyTimes = [
  'Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-5 PM)',
  'Evening (5-8 PM)', 'Night (8-11 PM)', 'Late Night (11+ PM)'
];

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    avatar: '',
    bio: '',
    subjects: [] as string[],
    studyTimes: [] as string[],
    goals: '',
    year: '',
    major: ''
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleSubjectToggle = (subject: string) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleTimeToggle = (time: string) => {
    setProfileData(prev => ({
      ...prev,
      studyTimes: prev.studyTimes.includes(time)
        ? prev.studyTimes.filter(t => t !== time)
        : [...prev.studyTimes, time]
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleProfileComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleProfileComplete = async () => {
    setIsSubmitting(true);
    try {
      // Save profile data to backend
      const updateData = {
        major: profileData.major,
        year: profileData.year,
        bio: profileData.bio,
        avatar: profileData.avatar
      };

      console.log('Saving profile data:', updateData);
      const response = await authAPI.updateProfile(updateData);
      console.log('Profile update response:', response);
      
      // Update localStorage with the updated user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.user };
      console.log('Updated user data for localStorage:', updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Call onComplete to proceed to dashboard
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Basic Information</h2>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="text-xl">JD</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  placeholder="e.g., Computer Science"
                  value={profileData.major}
                  onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Input
                  id="year"
                  placeholder="e.g., Sophomore, Junior"
                  value={profileData.year}
                  onChange={(e) => setProfileData(prev => ({ ...prev, year: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your study style and what you're looking for in a study buddy..."
                  className="resize-none"
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Study Subjects</h2>
              <p className="text-muted-foreground">Select the subjects you're interested in studying</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`p-3 rounded-lg border text-sm transition-all ${
                    profileData.subjects.includes(subject)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-background text-foreground border-border hover:border-blue-300'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>

            {profileData.subjects.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Subjects ({profileData.subjects.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {profileData.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                      {subject}
                      <button onClick={() => handleSubjectToggle(subject)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Clock className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Study Schedule</h2>
              <p className="text-muted-foreground">When do you prefer to study?</p>
            </div>

            <div className="space-y-3">
              {studyTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeToggle(time)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    profileData.studyTimes.includes(time)
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-background text-foreground border-border hover:border-purple-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {profileData.studyTimes.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Times ({profileData.studyTimes.length})</Label>
                <div className="space-y-1">
                  {profileData.studyTimes.map((time) => (
                    <Badge key={time} variant="secondary" className="flex items-center justify-between w-full">
                      {time}
                      <button onClick={() => handleTimeToggle(time)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Study Goals</h2>
              <p className="text-muted-foreground">What are you hoping to achieve?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Academic Goals</Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., Improve my GPA in calculus, prepare for finals, understand complex concepts better..."
                  className="resize-none"
                  rows={4}
                  value={profileData.goals}
                  onChange={(e) => setProfileData(prev => ({ ...prev, goals: e.target.value }))}
                />
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">Profile Summary</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium">Major:</span> {profileData.major || 'Not set'}</p>
                  <p><span className="font-medium">Year:</span> {profileData.year || 'Not set'}</p>
                  <p><span className="font-medium">Subjects:</span> {profileData.subjects.length > 0 ? profileData.subjects.join(', ') : 'None selected'}</p>
                  <p><span className="font-medium">Study Times:</span> {profileData.studyTimes.length > 0 ? `${profileData.studyTimes.length} selected` : 'None selected'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Setup Your Profile</h1>
          <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t">
        <div className="flex justify-between max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          <Button
            onClick={nextStep}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (step === totalSteps ? 'Complete Profile' : 'Next')}
          </Button>
        </div>
      </div>
    </div>
  );
}