
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Clock, Save, RefreshCw } from "lucide-react";

interface TimerSettings {
  id?: number;
  title: string;
  subtitle: string;
  targetDate: string;
  isActive: boolean;
  discountText: string;
}

export default function AdminTimerSettings() {
  const [settings, setSettings] = useState<TimerSettings>({
    title: "Limited Time Offer",
    subtitle: "Hurry! Sale ends soon",
    targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true,
    discountText: "Up to 50% OFF on Selected Items"
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimerSettings();
  }, []);

  const fetchTimerSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/timer-settings');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSettings({
            ...data,
            targetDate: new Date(data.targetDate).toISOString().slice(0, 16)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching timer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/timer-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: settings.title,
          subtitle: settings.subtitle,
          targetDate: new Date(settings.targetDate).toISOString(),
          isActive: settings.isActive,
          discountText: settings.discountText
        })
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Timer settings have been updated successfully.",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save timer settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof TimerSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-pink-600" />
          <span className="ml-2 text-slate-600">Loading timer settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Timer Settings
          </h2>
          <p className="text-slate-600 mt-1">Configure the countdown timer displayed on your website</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timer Configuration
            </CardTitle>
            <CardDescription>
              Set up your countdown timer details and target date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Timer Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter timer title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Timer Subtitle</Label>
              <Input
                id="subtitle"
                value={settings.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Enter timer subtitle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date & Time</Label>
              <Input
                id="targetDate"
                type="datetime-local"
                value={settings.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountText">Discount Text</Label>
              <Textarea
                id="discountText"
                value={settings.discountText}
                onChange={(e) => handleInputChange('discountText', e.target.value)}
                placeholder="Enter discount offer text"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={settings.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Enable Timer</Label>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Timer Preview</CardTitle>
            <CardDescription>
              Preview how your timer will look on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-gradient-to-r from-red-50 via-pink-50 to-red-50">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{settings.title}</h3>
                <p className="text-gray-600 mb-4">{settings.subtitle}</p>
                
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {['Days', 'Hours', 'Minutes', 'Seconds'].map((unit) => (
                    <div key={unit} className="text-center">
                      <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-sm font-bold">00</span>
                      </div>
                      <p className="text-xs text-gray-600">{unit}</p>
                    </div>
                  ))}
                </div>

                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-full px-4 py-2">
                  <span className="text-red-700 text-sm font-semibold">{settings.discountText}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p><strong>Target Date:</strong> {new Date(settings.targetDate).toLocaleString()}</p>
              <p><strong>Status:</strong> {settings.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
