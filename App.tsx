
import React, { useState, useEffect, useMemo } from 'react';
import { AppData, Player, Match, Team, User, Announcement, Tournament, Role } from './types';

// --- INITIAL DATA ---
const INITIAL_DATA: AppData = {
  players: [
    { id: 'p1', name: 'Virat Kohli', role: 'Batsman', username: 'virat', password: '123', runs: 12000, wickets: 4, matchesPlayed: 254, average: 59.3, strikeRate: 93.5 },
    { id: 'p2', name: 'Jasprit Bumrah', role: 'Bowler', username: 'jasprit', password: '123', runs: 200, wickets: 350, matchesPlayed: 140, average: 12.4, strikeRate: 45.2 },
    { id: 'p3', name: 'Ben Stokes', role: 'All-Rounder', username: 'ben', password: '123', runs: 5000, wickets: 190, matchesPlayed: 110, average: 38.9, strikeRate: 95.1 },
  ],
  teams: [
    { id: 't1', name: 'Royal Challengers', shortName: 'RCB', logo: 'https://picsum.photos/seed/rcb/150/150' },
    { id: 't2', name: 'Mumbai Indians', shortName: 'MI', logo: 'https://picsum.photos/seed/mi/150/150' },
    { id: 't3', name: 'Chennai Super Kings', shortName: 'CSK', logo: 'https://picsum.photos/seed/csk/150/150' },
  ],
  tournaments: [
    { id: 'tr1', name: 'Premier League', year: 2024, status: 'Ongoing' },
    { id: 'tr2', name: 'Champions Trophy', year: 2023, status: 'Completed' },
  ],
  matches: [
    { id: 'm1', tournamentId: 'tr1', date: new Date(Date.now() + 86400000 * 2).toISOString(), teamAId: 't1', teamBId: 't2', stage: 'League Match', status: 'Scheduled', venue: 'M. Chinnaswamy Stadium' },
    { id: 'm2', tournamentId: 'tr1', date: new Date(Date.now() + 86400000 * 5).toISOString(), teamAId: 't2', teamBId: 't3', stage: 'Semi-Final', status: 'Scheduled', venue: 'Wankhede Stadium' },
  ],
  announcements: [
    { id: 'a1', text: 'Club Membership drive starts from Jan 1st!', createdAt: new Date().toISOString() },
    { id: 'a2', text: 'New equipment arriving next week for all players.', createdAt: new Date().toISOString() },
  ],
  seasons: [2023, 2024, 2025]
};

// --- SUB-COMPONENTS ---

const Navbar: React.FC<{
  user: User | null;
  onViewChange: (view: 'home' | 'admin' | 'player') => void;
  onLogout: () => void;
  onLoginClick: () => void;
}> = ({ user, onViewChange, onLogout, onLoginClick }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onViewChange('home')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black group-hover:rotate-6 transition-transform">C</div>
          <span className="font-bold text-xl tracking-tighter hidden sm:block">CricketHub</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={() => onViewChange('home')} className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Home</button>
          {user ? (
            <>
              {user.role === 'admin' && <button onClick={() => onViewChange('admin')} className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</button>}
              {user.role === 'player' && <button onClick={() => onViewChange('player')} className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">My Profile</button>}
              <button onClick={onLogout} className="px-4 py-2 text-sm font-bold bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">Logout</button>
            </>
          ) : (
            <button onClick={onLoginClick} className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">Sign In</button>
          )}
        </div>
      </div>
    </nav>
  );
};

const AnnouncementBar: React.FC<{ announcements: Announcement[] }> = ({ announcements }) => {
  if (!announcements.length) return null;
  const combinedText = announcements.map(a => `📢 ${a.text}`).join(' | ');
  return (
    <div className="bg-slate-900 text-white py-2 overflow-hidden whitespace-nowrap border-b border-indigo-900">
      <div className="animate-marquee inline-block pl-[100%]">
        <span className="text-sm font-medium tracking-wide uppercase">{combinedText} • {combinedText}</span>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('cricket_data_v2');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'admin' | 'player'>('home');
  const [showLogin, setShowLogin] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ u: '', p: '' });
  const [playerFilter, setPlayerFilter] = useState({ tournament: 'All', season: 'All' });

  useEffect(() => {
    localStorage.setItem('cricket_data_v2', JSON.stringify(data));
  }, [data]);

  const upcomingMatch = useMemo(() => {
    const sorted = [...data.matches]
      .filter(m => m.status === 'Scheduled' && new Date(m.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted[0] || null;
  }, [data.matches]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCreds.u === 'admin' && loginCreds.p === '9908') {
      setUser({ role: 'admin', username: 'admin' });
      setView('admin');
      setShowLogin(false);
    } else {
      const p = data.players.find(x => x.username === loginCreds.u && x.password === loginCreds.p);
      if (p) {
        setUser({ role: 'player', username: p.username, playerId: p.id });
        setView('player');
        setShowLogin(false);
      } else alert('Invalid credentials. Check Username or Password.');
    }
    setLoginCreds({ u: '', p: '' });
  };

  const filteredPlayers = useMemo(() => {
    let players = [...data.players];
    // In a real app, we'd filter based on actual match records per tournament/season.
    // Here we just sort by runs for ranking.
    return players.sort((a, b) => b.runs - a.runs);
  }, [data.players, playerFilter]);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar announcements={data.announcements} />
      <Navbar 
        user={user} 
        onViewChange={setView} 
        onLogout={() => { setUser(null); setView('home'); }} 
        onLoginClick={() => setShowLogin(true)} 
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        {view === 'home' && (
          <div className="space-y-12 max-w-6xl mx-auto">
            {/* HERO SECTION - NEXT MATCH */}
            {upcomingMatch ? (
              <div className="bg-indigo-900 rounded-[2.5rem] p-8 sm:p-16 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                  <div className="flex-1">
                    <span className="inline-block bg-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-indigo-100 mb-6">
                      {upcomingMatch.stage}
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
                      {data.teams.find(t => t.id === upcomingMatch.teamAId)?.shortName} <span className="text-indigo-400 italic">vs</span> {data.teams.find(t => t.id === upcomingMatch.teamBId)?.shortName}
                    </h2>
                    <p className="text-indigo-200 font-bold text-xl mb-8 flex items-center justify-center md:justify-start gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {upcomingMatch.venue}
                    </p>
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                       <span className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></span>
                       <span className="font-bold text-indigo-50">{new Date(upcomingMatch.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 sm:gap-6">
                    <div className="bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 text-center min-w-[100px]">
                      <div className="text-4xl font-black">{Math.max(0, Math.floor((new Date(upcomingMatch.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}</div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Days</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 text-center min-w-[100px]">
                      <div className="text-4xl font-black">{Math.max(0, Math.floor((new Date(upcomingMatch.date).getTime() - Date.now()) / (1000 * 60 * 60) % 24))}</div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Hours</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-[2.5rem] p-16 text-center text-white">
                <h2 className="text-3xl font-black">No upcoming matches.</h2>
                <p className="text-slate-400 mt-2">Check back later for new tournament schedules.</p>
              </div>
            )}

            {/* RANKINGS TABLES */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* PLAYER RANKINGS */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h3 className="font-black text-2xl text-slate-800">Player Rankings</h3>
                  <div className="flex gap-2">
                    <select 
                      className="text-xs font-bold bg-slate-50 border border-slate-200 p-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                      onChange={e => setPlayerFilter({...playerFilter, season: e.target.value})}
                    >
                      <option value="All">All Seasons</option>
                      {data.seasons.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Rank</th>
                        <th className="px-8 py-4">Player</th>
                        <th className="px-8 py-4 text-center">Runs</th>
                        <th className="px-8 py-4 text-right">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredPlayers.slice(0, 8).map((p, idx) => (
                        <tr key={p.id} className="hover:bg-indigo-50/50 transition-colors">
                          <td className="px-8 py-5 font-black text-indigo-600 text-lg">#{idx + 1}</td>
                          <td className="px-8 py-5">
                            <div className="font-bold text-slate-800">{p.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{p.role}</div>
                          </td>
                          <td className="px-8 py-5 text-center font-bold text-slate-700">{p.runs}</td>
                          <td className="px-8 py-5 text-right font-black text-indigo-600">{p.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TEAM STANDINGS */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h3 className="font-black text-2xl text-slate-800">Team Standings</h3>
                  <div className="flex gap-2">
                    <select className="text-xs font-bold bg-slate-50 border border-slate-200 p-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>All Tournaments</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Team</th>
                        <th className="px-8 py-4 text-center">Played</th>
                        <th className="px-8 py-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {data.teams.map((t) => (
                        <tr key={t.id} className="hover:bg-indigo-50/50 transition-colors">
                          <td className="px-8 py-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                              <img src={t.logo} alt={t.shortName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <div className="font-bold text-slate-800">{t.name}</div>
                               <div className="text-xs font-black text-slate-400">{t.shortName}</div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center font-bold text-slate-700">0</td>
                          <td className="px-8 py-5 text-right font-black text-indigo-600">0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && user?.role === 'admin' && (
          <div className="max-w-6xl mx-auto">
            <AdminPanel data={data} onUpdate={setData} />
          </div>
        )}

        {view === 'player' && user?.role === 'player' && user.playerId && (
          <div className="max-w-6xl mx-auto">
            <PlayerDashboard 
              player={data.players.find(p => p.id === user.playerId)!} 
              matches={data.matches} 
              teams={data.teams} 
            />
          </div>
        )}
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-8 text-white">
              <h2 className="text-2xl font-black">Welcome Back</h2>
              <p className="text-indigo-200 text-sm font-medium mt-1">Sign in to manage your cricket profile</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Username</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" 
                  value={loginCreds.u}
                  onChange={e => setLoginCreds({...loginCreds, u: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" 
                  value={loginCreds.p}
                  onChange={e => setLoginCreds({...loginCreds, p: e.target.value})} 
                  required 
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                Login
              </button>
              <button type="button" onClick={() => setShowLogin(false)} className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">
                Maybe Later
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-slate-400 font-bold text-sm tracking-tighter uppercase">© 2024 Cricket Hub Management System Pro</p>
      </footer>
    </div>
  );
};

// --- ADDITIONAL PANELS ---

const PlayerDashboard: React.FC<{ player: Player; matches: Match[]; teams: Team[] }> = ({ player, matches, teams }) => (
  <div className="space-y-8">
    <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-10">
      <div className="w-40 h-40 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-7xl font-black shadow-2xl rotate-3">
        {player.name.charAt(0)}
      </div>
      <div className="text-center md:text-left flex-1">
        <span className="inline-block bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">Official Member</span>
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter">{player.name}</h1>
        <p className="text-slate-500 text-xl font-medium mt-2">{player.role} • <span className="text-indigo-600 font-bold">{player.matchesPlayed}</span> Matches Played</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
          <div className="text-3xl font-black text-indigo-600">{player.runs}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Runs Scored</div>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
          <div className="text-3xl font-black text-indigo-600">{player.wickets}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Wickets Taken</div>
        </div>
      </div>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-800 mb-6">Career Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Average" value={player.average.toString()} />
          <StatCard label="Strike Rate" value={player.strikeRate.toString()} />
          <StatCard label="Max Runs" value="--?" />
          <StatCard label="Fours" value="--?" />
        </div>
      </div>
      <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl">
        <h2 className="text-2xl font-black mb-6">Recent Activities</h2>
        <div className="space-y-4">
          {matches.filter(m => m.status === 'Completed').length > 0 ? (
            matches.filter(m => m.status === 'Completed').slice(0, 3).map(m => (
              <div key={m.id} className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="font-bold">{m.stage}</div>
                <div className="text-xs text-indigo-200">{new Date(m.date).toLocaleDateString()}</div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-white/10 rounded-2xl text-center italic text-indigo-100">No match records yet.</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-2xl font-black text-indigo-600">{value}</div>
  </div>
);

const AdminPanel: React.FC<{ data: AppData; onUpdate: (data: AppData) => void }> = ({ data, onUpdate }) => {
  const [tab, setTab] = useState<'tournaments' | 'teams' | 'players' | 'matches' | 'announcements'>('tournaments');

  const addItem = (type: keyof AppData) => {
    if (type === 'announcements') {
      const text = prompt('Enter Announcement Text:');
      if (text) onUpdate({ ...data, announcements: [{ id: Date.now().toString(), text, createdAt: new Date().toISOString() }, ...data.announcements] });
    } else if (type === 'players') {
      const name = prompt('Player Full Name:');
      const user = prompt('Login Username:');
      const pass = prompt('Login Password:');
      if (name && user && pass) {
        onUpdate({ ...data, players: [...data.players, { id: Date.now().toString(), name, username: user, password: pass, role: 'Batsman', runs: 0, wickets: 0, matchesPlayed: 0, average: 0, strikeRate: 0 }] });
      }
    } else if (type === 'tournaments') {
      const name = prompt('Tournament Name:');
      const year = prompt('Year:');
      if (name && year) onUpdate({ ...data, tournaments: [...data.tournaments, { id: Date.now().toString(), name, year: parseInt(year), status: 'Upcoming' }] });
    } else if (type === 'teams') {
      const name = prompt('Team Name:');
      const short = prompt('Short Name (e.g. MI, CSK):');
      if (name && short) onUpdate({ ...data, teams: [...data.teams, { id: Date.now().toString(), name, shortName: short, logo: `https://picsum.photos/seed/${short}/150/150` }] });
    } else if (type === 'matches') {
      const stage = prompt('Match Stage (e.g. Semi Final, Final):');
      if (stage && data.teams.length >= 2) {
         onUpdate({ ...data, matches: [...data.matches, {
           id: Date.now().toString(), tournamentId: data.tournaments[0]?.id || 'tr1', date: new Date().toISOString(),
           teamAId: data.teams[0].id, teamBId: data.teams[1].id, stage, status: 'Scheduled', venue: 'Main Stadium'
         }]});
      }
    }
  };

  const deleteItem = (type: keyof AppData, id: string) => {
    if (confirm('Are you sure you want to delete this?')) {
      onUpdate({ ...data, [type]: (data[type] as any[]).filter((item: any) => item.id !== id) });
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-8 space-y-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Management</h3>
        {(['tournaments', 'teams', 'players', 'matches', 'announcements'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`w-full px-6 py-4 rounded-2xl text-left font-black capitalize transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-x-1' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <h2 className="text-4xl font-black capitalize tracking-tight">{tab}</h2>
          <button onClick={() => addItem(tab)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Add {tab.slice(0, -1)}
          </button>
        </div>
        <div className="space-y-4">
          {(data[tab] as any[]).map((item: any) => (
            <div key={item.id} className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center border border-slate-100 group hover:border-indigo-200 transition-colors">
              <div>
                <div className="font-black text-lg text-slate-800">{item.name || item.text || (item.stage + ': ' + item.date)}</div>
                <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.shortName || (item.role ? `Role: ${item.role}` : item.year ? `Year: ${item.year}` : 'Active Entry')}</div>
              </div>
              <button onClick={() => deleteItem(tab, item.id)} className="text-red-400 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          ))}
          {(data[tab] as any[]).length === 0 && (
            <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[2.5rem]">
               <div className="text-slate-300 font-black text-2xl">Empty List</div>
               <p className="text-slate-400 mt-2">Click "Add" to create your first entry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
