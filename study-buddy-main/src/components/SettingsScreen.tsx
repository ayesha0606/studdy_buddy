import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useTheme } from './ThemeProvider';
import { 
  ArrowLeft, User, Bell, Shield, HelpCircle, 
  LogOut, Edit, Camera, Sun, Moon, MessageSquare,
  Calendar, Globe, Info, Star, Heart
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  onSignOut: () => void;
}

const settingsCategories = [
  {
    title: 'Account',
    icon: User,
    items: [
      { key: 'profile', label: 'Edit Profile', icon: Edit, hasArrow: true },
      { key: 'photo', label: 'Change Photo', icon: Camera, hasArrow: true },
      { key: 'preferences', label: 'Study Preferences', icon: Star, hasArrow: true }
    ]
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { key: 'push', label: 'Push Notifications', icon: Bell, hasSwitch: true, defaultValue: true },
      { key: 'messages', label: 'Message Notifications', icon: MessageSquare, hasSwitch: true, defaultValue: true },
      { key: 'sessions', label: 'Session Reminders', icon: Calendar, hasSwitch: true, defaultValue: true },
      { key: 'matches', label: 'New Match Alerts', icon: Heart, hasSwitch: true, defaultValue: false }
    ]
  },
  {
    title: 'Privacy & Safety',
    icon: Shield,
    items: [
      { key: 'location', label: 'Share Location', icon: Globe, hasSwitch: true, defaultValue: true },
      { key: 'online', label: 'Show Online Status', icon: Info, hasSwitch: true, defaultValue: true },
      { key: 'privacy', label: 'Privacy Settings', icon: Shield, hasArrow: true },
      { key: 'safety', label: 'Safety Center', icon: Shield, hasArrow: true }
    ]
  },
  {
    title: 'Support',
    icon: HelpCircle,
    items: [
      { key: 'help', label: 'Help Center', icon: HelpCircle, hasArrow: true },
      { key: 'feedback', label: 'Send Feedback', icon: MessageSquare, hasArrow: true },
      { key: 'about', label: 'About StudyBuddy', icon: Info, hasArrow: true }
    ]
  }
];

export function SettingsScreen({ onBack, onSignOut }: SettingsScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    push: true,
    messages: true,
    sessions: true,
    matches: false,
    location: true,
    online: true
  });

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const userData = {
    name: 'John Doe',
    email: 'john.doe@berkeley.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    university: 'UC Berkeley',
    major: 'Computer Science',
    year: 'Junior'
  };

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
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="p-4">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback className="text-xl">{userData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                  <p className="text-sm text-muted-foreground">{userData.major} • {userData.year}</p>
                  <p className="text-sm text-muted-foreground">{userData.university}</p>
                </div>
                
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Toggle */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-blue-500" />
                  )}
                  <div>
                    <Label className="font-medium">Appearance</Label>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'light' ? 'Light mode' : 'Dark mode'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? 'Dark' : 'Light'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Categories */}
          {settingsCategories.map((category) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <category.icon className="w-5 h-5" />
                    <span>{category.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {category.items.map((item, index) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <Label className="font-normal">{item.label}</Label>
                        </div>
                        
                        {item.hasSwitch && (
                          <Switch
                            checked={settings[item.key as keyof typeof settings]}
                            onCheckedChange={(checked) => handleSwitchChange(item.key, checked)}
                          />
                        )}
                        
                        {item.hasArrow && (
                          <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </Button>
                        )}
                      </div>
                      
                      {index < category.items.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* App Info */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">StudyBuddy</h3>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                <p className="text-xs text-muted-foreground">
                  Connect. Collaborate. Conquer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="mb-8">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 p-4"
                onClick={onSignOut}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}