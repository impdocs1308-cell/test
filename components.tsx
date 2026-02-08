
import React, { useState, useMemo, useEffect } from 'react';
import { AppData, Player, Match, Team, User, Announcement, Tournament, Role } from './types';

// --- Navbar Component ---
export const Navbar: React.FC<{
  user: User | null;
  onViewChange: (view: 'home' | 'admin' | 'player') => void;
  onLogout: () => void;
  onLoginClick: () => void;
}> = ({ user, onViewChange, onLogout, onLoginClick }) => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange('home')}>
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
        <span className="font-bold text-xl tracking-tight hidden sm:block">CricketHub</span>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button onClick={() => onViewChange('home')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600">Home</button>
        {user ? (
          <>
            {user.role === 'admin' && <button onClick={() => onViewChange('admin')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600">Admin</button>}
            {user.role === 'player' && <button onClick={() => onViewChange('player')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600">Profile</button>}
            <button onClick={onLogout} className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg border border-red-100">Logout</button>
          </>
        ) : (
          <button onClick={onLoginClick} className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg shadow-sm">Sign In</button>
        )}
      </div>
    </div>
  </nav>
);

// --- Announcement Bar ---
export const AnnouncementBar: React.FC<{ announcements: Announcement[] }> = ({ announcements }) => {
  if (!announcements.length) return null;
  const text = announcements.map(a => `🔥 ${a.text}`).join(' | ');
  return (
    <div className="bg-slate-900 text-white py-2 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee inline-block pl-[100%]">
        <span className="text-sm font-medium">{text} • {text}</span>
      </div>
    </div>
  );
};

// --- Player Dashboard ---
export const PlayerDashboard: React.FC<{ player: Player; matches: Match[]; teams: Team[] }> = ({ player, matches, teams }) => (
  <div className="max-w-4xl mx-auto space-y-8 p-4">
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
      <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-black">
        {player.name.charAt(0)}
      </div>
      <div className="text-center md:text-left flex-1">
        <h1 className="text-3xl font-black text-slate-800">{player.name}</h1>
        <p className="text-slate-500">{player.role} • {player.matchesPlayed} Matches</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-indigo-600">{player.runs}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Runs</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-indigo-600">{player.wickets}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Wickets</div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold mb-4">Detailed Statistics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 border rounded-lg text-center"><div className="text-sm text-slate-400">Avg</div><div className="font-bold">{player.average}</div></div>
        <div className="p-3 border rounded-lg text-center"><div className="text-sm text-slate-400">S/R</div><div className="font-bold">{player.strikeRate}</div></div>
        <div className="p-3 border rounded-lg text-center"><div className="text-sm text-slate-400">Matches</div><div className="font-bold">{player.matchesPlayed}</div></div>
        <div className="p-3 border rounded-lg text-center"><div className="text-sm text-slate-400">Username</div><div className="font-bold">{player.username}</div></div>
      </div>
    </div>
  </div>
);

// --- Admin Dashboard ---
export const AdminDashboard: React.FC<{ data: AppData; onUpdate: (data: AppData) => void }> = ({ data, onUpdate }) => {
  const [tab, setTab] = useState<'tournaments'|'teams'|'players'|'matches'|'announcements'>('tournaments');

  const addItem = (type: keyof AppData) => {
    if (type === 'announcements') {
      const text = prompt('Announcement:');
      if (text) onUpdate({...data, announcements: [{id: Date.now().toString(), text, createdAt: new Date().toISOString()}, ...data.announcements]});
    } else if (type === 'players') {
      const name = prompt('Name:');
      const user = prompt('Username:');
      const pass = prompt('Password:');
      if (name && user && pass) {
        const newP: Player = { id: Date.now().toString(), name, username: user, password: pass, role: 'Batsman', runs: 0, wickets: 0, matchesPlayed: 0, average: 0, strikeRate: 0 };
        onUpdate({...data, players: [...data.players, newP]});
      }
    } else if (type === 'tournaments') {
      const name = prompt('Tournament:');
      const year = prompt('Year:');
      if (name && year) onUpdate({...data, tournaments: [...data.tournaments, {id: Date.now().toString(), name, year: parseInt(year), status: 'Upcoming'}]});
    } else if (type === 'matches') {
      const stage = prompt('Stage (e.g. League, Semi Final, Final):');
      if (stage && data.teams.length >= 2) {
        onUpdate({...data, matches: [...data.matches, {
          id: Date.now().toString(), tournamentId: data.tournaments[0]?.id || '', date: new Date().toISOString(),
          teamAId: data.teams[0].id, teamBId: data.teams[1].id, stage, status: 'Scheduled', venue: 'New Stadium'
        }]});
      }
    } else if (type === 'teams') {
      const name = prompt('Team Name:');
      const short = prompt('Short Name:');
      if (name && short) onUpdate({...data, teams: [...data.teams, {id: Date.now().toString(), name, shortName: short, logo: 'https://picsum.photos/seed/'+short+'/150/150'}]});
    }
  };

  const deleteItem = (type: keyof AppData, id: string) => {
    if (confirm('Delete this item?')) {
      onUpdate({...data, [type]: (data[type] as any[]).filter((i:any) => i.id !== id)});
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-2">
        {(['tournaments', 'teams', 'players', 'matches', 'announcements'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-left font-bold capitalize transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white'}`}>{t}</button>
        ))}
      </div>
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black capitalize">{tab}</h2>
          <button onClick={() => addItem(tab)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">+ Add</button>
        </div>
        <div className="space-y-3">
          {(data[tab] as any[]).map((item: any) => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
              <div className="font-bold text-slate-700">{item.name || item.text || (item.stage + ': ' + item.date)}</div>
              <button onClick={() => deleteItem(tab, item.id)} className="text-red-500 font-bold px-3 py-1 hover:bg-red-50 rounded">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
