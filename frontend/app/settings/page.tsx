'use client';

import React, { useState } from 'react';
import {
  User, Bell, Volume2, Shield, HelpCircle, Info,
  ChevronRight, Check, Globe, Trash2, LogOut
} from 'lucide-react';

type Section = 'account' | 'notifications' | 'sound' | 'privacy' | 'help' | 'about';

interface SettingsSection {
  id: Section;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const SECTIONS: SettingsSection[] = [
  { id: 'account',       label: 'Account',       icon: <User className="h-5 w-5 text-white" />,        color: 'bg-blue-500' },
  { id: 'notifications', label: 'Notifications',  icon: <Bell className="h-5 w-5 text-white" />,        color: 'bg-purple-500' },
  { id: 'sound',         label: 'Sound & Haptics',icon: <Volume2 className="h-5 w-5 text-white" />,     color: 'bg-green-500' },
  { id: 'privacy',       label: 'Privacy',        icon: <Shield className="h-5 w-5 text-white" />,      color: 'bg-red-500' },
  { id: 'help',          label: 'Help & Support', icon: <HelpCircle className="h-5 w-5 text-white" />,  color: 'bg-orange-500' },
  { id: 'about',         label: 'About',          icon: <Info className="h-5 w-5 text-white" />,        color: 'bg-gray-600' },
];

function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-semibold text-[#4b4b4b]">{label}</span>
      <button
        onClick={() => setOn(v => !v)}
        className={`relative h-7 w-12 rounded-full transition-all duration-200 ${on ? 'bg-[#58cc02]' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
      <span>Coming Soon</span>
    </div>
  );
}

function SectionContent({ id }: { id: Section }) {
  switch (id) {
    case 'account':
      return (
        <div className="space-y-1 divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-black text-[#4b4b4b]">Username</p>
              <p className="text-xs text-gray-500 font-semibold">karan</p>
            </div>
            <ComingSoon />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-black text-[#4b4b4b]">Email</p>
              <p className="text-xs text-gray-500 font-semibold">karan@example.com</p>
            </div>
            <ComingSoon />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-black text-[#4b4b4b]">Course Language</p>
              <p className="text-xs text-gray-500 font-semibold">🇪🇸 Spanish</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-gray-400" />
              <ComingSoon />
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-black text-[#4b4b4b]">Daily Goal</p>
              <p className="text-xs text-gray-500 font-semibold">50 XP per day</p>
            </div>
            <ComingSoon />
          </div>
          <div className="py-3">
            <button className="flex w-full items-center gap-2 text-sm font-black text-red-500 hover:text-red-600 transition">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      );

    case 'notifications':
      return (
        <div className="space-y-1 divide-y divide-gray-100">
          <Toggle label="Daily Reminder Notifications" defaultOn={true} />
          <Toggle label="Streak Protection Alerts" defaultOn={true} />
          <Toggle label="Achievement Unlocked" defaultOn={true} />
          <Toggle label="Weekly Progress Report" defaultOn={false} />
          <Toggle label="Friend Activity" defaultOn={false} />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Reminder Time</span>
            <ComingSoon />
          </div>
        </div>
      );

    case 'sound':
      return (
        <div className="space-y-1 divide-y divide-gray-100">
          <Toggle label="Sound Effects" defaultOn={true} />
          <Toggle label="Pronunciation Audio" defaultOn={true} />
          <Toggle label="Haptic Feedback" defaultOn={true} />
          <Toggle label="Background Music" defaultOn={false} />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Volume Level</span>
            <ComingSoon />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Speech Speed</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500">0.9x (Standard)</span>
              <ComingSoon />
            </div>
          </div>
        </div>
      );

    case 'privacy':
      return (
        <div className="space-y-1 divide-y divide-gray-100">
          <Toggle label="Appear on Leaderboard" defaultOn={true} />
          <Toggle label="Share Progress with Friends" defaultOn={false} />
          <Toggle label="Analytics & Crash Reports" defaultOn={true} />
          <Toggle label="Personalized Recommendations" defaultOn={true} />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Data Export</span>
            <ComingSoon />
          </div>
          <div className="py-3">
            <button className="flex w-full items-center gap-2 text-sm font-black text-red-500 hover:text-red-600 transition">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      );

    case 'help':
      return (
        <div className="space-y-1 divide-y divide-gray-100">
          {['How Lessons Work', 'Hearts & Lives Explained', 'Streak Guide', 'Gems & Rewards', 'Report a Bug', 'Contact Support'].map(item => (
            <div key={item} className="flex items-center justify-between py-3">
              <span className="text-sm font-semibold text-[#4b4b4b]">{item}</span>
              <ComingSoon />
            </div>
          ))}
        </div>
      );

    case 'about':
      return (
        <div className="space-y-1 divide-y divide-gray-100">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">App Version</span>
            <span className="text-xs font-black text-gray-500 rounded-full bg-gray-100 px-2.5 py-1">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Backend API</span>
            <span className="text-xs font-black text-green-600 rounded-full bg-green-100 px-2.5 py-1 flex items-center gap-1">
              <Check className="h-3 w-3 stroke-[3]" /> Online
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Stack</span>
            <span className="text-xs font-semibold text-gray-500">Next.js 16 · FastAPI · SQLite</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Terms of Service</span>
            <ComingSoon />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Privacy Policy</span>
            <ComingSoon />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-[#4b4b4b]">Open Source Licenses</span>
            <ComingSoon />
          </div>
        </div>
      );
  }
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      <div className="mx-auto max-w-2xl px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#4b4b4b]">Settings</h1>
          <p className="text-sm font-semibold text-gray-500">Manage your account and preferences</p>
        </div>

        {/* Sections List */}
        <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white overflow-hidden shadow-sm divide-y divide-gray-100">
          {SECTIONS.map(section => (
            <div key={section.id}>
              <button
                onClick={() => setActiveSection(prev => prev === section.id ? null : section.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${section.color}`}>
                  {section.icon}
                </div>
                <span className="flex-1 text-sm font-black text-[#4b4b4b]">{section.label}</span>
                <ChevronRight
                  className={`h-4 w-4 text-gray-400 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Expanded Section Content */}
              {activeSection === section.id && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-5">
                  <SectionContent id={section.id} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* App signature */}
        <p className="mt-6 text-center text-xs font-semibold text-gray-400">
          Built with ❤️ · Duolingo-Inspired Language Learning App
        </p>
      </div>
    </div>
  );
}
