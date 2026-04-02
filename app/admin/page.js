'use client';
// app/admin/page.js — Admin Dashboard with Multi-Role + Approval Workflow
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['masjid','education','food','relief','water','medical','youth','zakat','general'];
const emptyForm = { title:'', description:'', goalAmount:'', category:'general', endDate:'', imageUrl:'', active:true };

function BarChart({ data = [], color = '#1a5c38' }) {
  if (!data.length) return <p style={{ color:'var(--muted)', fontSize:'0.82rem' }}>No data yet.</p>;
  const max = Math.max(...data.map(d => d.value || d.amount || 0), 1);
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:72 }}>
        {data.map((d, i) => {
          const val = d.value || d.amount || 0;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }} title={`${d.label||d.month}: ৳${val.toLocaleString()}`}>
              <div style={{ width:'100%', height:Math.max(4,(val/max)*68), borderRadius:'4px 4px 0 0', background:color, opacity: i===data.length-1?1:0.55, transition:'height 0.5s ease' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:5 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', fontSize:'0.6rem', color:'var(--muted)', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {(d.label||d.month||'').replace(/\d{4}-/,'')}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  // Auth state
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const TABS = isSuperAdmin
    ? ['Dashboard', 'Pending', 'Campaigns', 'Donations', 'Enter Donation', 'Volunteers', 'Inbox', 'Newsletter', 'Users', 'Data Management']
    : ['Dashboard', 'Pending', 'Campaigns', 'Donations', 'Enter Donation', 'Volunteers', 'Inbox', 'Newsletter'];

  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Manual donation entry form
  const [manualDonation, setManualDonation] = useState({ donorName:'', amount:'', category:'general', paymentMethod:'cash', campaignId:'', message:'' });

  // New admin user form
  const [newAdmin, setNewAdmin] = useState({ username:'', password:'', role:'admin', displayName:'', email:'' });

  // Purge confirmation
  const [purgeConfirm, setPurgeConfirm] = useState('');
  const [purging, setPurging] = useState(false);

  // Email export
  const [exportEmail, setExportEmail] = useState('');

  const authHeaders = () => ({
    'x-admin-user': currentUser?.username || '',
    'x-admin-pass': loginForm.password || '',
  });

  // ── LOGIN ───────────────────────────────────────
  const login = async () => {
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      if (!res.ok) { toast.error('Invalid credentials'); return; }
      const user = await res.json();
      setCurrentUser(user);
      setAuthed(true);
      toast.success(`Welcome, ${user.displayName || user.username}!`);
    } catch { toast.error('Login failed'); }
    finally { setLoginLoading(false); }
  };

  // ── LOAD DATA ───────────────────────────────────
  const loadAll = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const h = authHeaders();
      const [campRes, donRes, volRes, conRes, subRes, statRes, pendRes] = await Promise.all([
        fetch('/api/campaigns').then(r=>r.json()),
        fetch('/api/donations').then(r=>r.json()),
        fetch('/api/volunteer').then(r=>r.json()).catch(()=>[]),
        fetch('/api/contact').then(r=>r.json()).catch(()=>[]),
        fetch('/api/newsletter/subscribe').then(r=>r.json()).catch(()=>[]),
        fetch('/api/stats').then(r=>r.json()),
        fetch('/api/admin/donations?status=pending', { headers: h }).then(r=>r.json()),
      ]);
      setCampaigns(Array.isArray(campRes) ? campRes : []);
      setDonations(Array.isArray(donRes) ? donRes : []);
      setVolunteers(Array.isArray(volRes) ? volRes : []);
      setContacts(Array.isArray(conRes) ? conRes : []);
      setSubscribers(Array.isArray(subRes) ? subRes : []);
      setStats(statRes || {});
      setPendingDonations(Array.isArray(pendRes) ? pendRes : []);

      // Load admin stats
      const adminStatRes = await fetch('/api/stats').then(r=>r.json());
      setStats(prev => ({ ...prev, ...adminStatRes }));

      // Load admin users if super
      if (isSuperAdmin) {
        const usersRes = await fetch('/api/admin/users', { headers: h }).then(r=>r.json()).catch(()=>[]);
        setAdminUsers(Array.isArray(usersRes) ? usersRes : []);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (authed && currentUser) loadAll(); }, [authed, currentUser]);

  // Reset tab if switching from super to non-super role
  useEffect(() => {
    if (!isSuperAdmin && (tab === 'Users' || tab === 'Data Management')) setTab('Dashboard');
  }, [isSuperAdmin, tab]);

  const last7 = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    return { label: d.toLocaleDateString('en-US',{weekday:'short'}), date: d.toDateString(), value:0 };
  });
  donations.filter(d => d.status === 'approved').forEach(don => {
    if (!don.createdAt?.seconds) return;
    const ds = new Date(don.createdAt.seconds*1000).toDateString();
    const slot = last7.find(d => d.date===ds);
    if (slot) slot.value += don.amount||0;
  });

  const unreadCount = contacts.filter(c => !c.read).length;
  const pendingVols = volunteers.filter(v => v.status==='pending').length;
  const pendingCount = pendingDonations.length;

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = c => { setForm({...c, goalAmount:c.goalAmount?.toString(), endDate:c.endDate||''}); setEditId(c.id); setShowForm(true); };

  const saveCampaign = async () => {
    if (!form.title || !form.goalAmount) { toast.error('Title and goal required.'); return; }
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/campaigns?id=${editId}` : '/api/campaigns';
      await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, goalAmount:Number(form.goalAmount)}) });
      toast.success(editId ? 'Updated!' : 'Created!');
      setShowForm(false); loadAll();
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, isActive) => {
    await fetch(`/api/campaigns?id=${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({active:!isActive}) });
    loadAll();
  };

  // ── APPROVE / REJECT DONATION ────────────────────
  const handleDonationAction = async (id, status) => {
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === 'approved' ? '✅ Donation Approved!' : '❌ Donation Rejected');
      loadAll();
    } catch { toast.error('Action failed'); }
  };

  // ── MANUAL DONATION ENTRY ─────────────────────────
  const submitManualDonation = async () => {
    if (!manualDonation.donorName || !manualDonation.amount) { toast.error('Name and amount required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(manualDonation),
      });
      if (!res.ok) throw new Error();
      toast.success('💰 Donation recorded!');
      setManualDonation({ donorName:'', amount:'', category:'general', paymentMethod:'cash', campaignId:'', message:'' });
      loadAll();
    } catch { toast.error('Failed to record donation.'); }
    finally { setSaving(false); }
  };

  // ── CREATE ADMIN USER ──────────────────────────────
  const createUser = async () => {
    if (!newAdmin.username || !newAdmin.password) { toast.error('Username and password required.'); return; }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newAdmin),
      });
      if (!res.ok) { const e = await res.json(); toast.error(e.error); return; }
      toast.success('User created!');
      setNewAdmin({ username:'', password:'', role:'admin', displayName:'', email:'' });
      loadAll();
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this admin user?')) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      toast.success('Deleted');
      loadAll();
    } catch { toast.error('Failed'); }
  };

  // ── DATA PURGE ─────────────────────────────────────
  const purgeData = async () => {
    if (purgeConfirm !== loginForm.password) { toast.error('Password does not match.'); return; }
    setPurging(true);
    try {
      const res = await fetch('/api/admin/purge', {
        method: 'DELETE',
        headers: { ...authHeaders(), 'x-confirm-password': purgeConfirm },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('🗑️ All data purged!');
      setPurgeConfirm('');
      loadAll();
    } catch { toast.error('Purge failed'); }
    finally { setPurging(false); }
  };

  // ── EXPORT ─────────────────────────────────────────
  const exportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/export', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download=`alnoor-donations-${new Date().toISOString().slice(0,10)}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('📥 CSV downloaded — open in Excel!');
    } catch { toast.error('Export failed.'); }
    finally { setExporting(false); }
  };

  const exportAndEmail = async () => {
    if (!exportEmail) { toast.error('Enter email address.'); return; }
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?email=${encodeURIComponent(exportEmail)}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Email failed'); return; }
      toast.success(`📧 Report sent to ${exportEmail}`);
    } catch { toast.error('Email failed.'); }
    finally { setExporting(false); }
  };

  const exportEmails = () => {
    const csv = 'Email,Date\n' + subscribers.map(s =>
      `"${s.email}","${s.createdAt?.seconds ? new Date(s.createdAt.seconds*1000).toLocaleDateString() : '—'}"`).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = 'newsletter-subscribers.csv'; a.click();
  };

  // Shared styles
  const TH = ({children}) => <th style={{ padding:'11px 14px', textAlign:'left', color:'rgba(255,255,255,0.85)', fontWeight:600, whiteSpace:'nowrap', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{children}</th>;
  const StatusBadge = ({status}) => {
    const colors = { approved:'badge-emerald', pending:'badge-gold', rejected:'badge-red', completed:'badge-emerald' };
    return <span className={`badge ${colors[status]||'badge-gold'}`} style={{ fontSize:'0.65rem', textTransform:'capitalize' }}>{status}</span>;
  };

  // ═══ LOGIN SCREEN ═══════════════════════════════════
  if (!authed) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', paddingTop:80 }}>
      <div className="card" style={{ padding:'52px 44px', width:'100%', maxWidth:420, textAlign:'center' }}>
        <div style={{ fontSize:'3.5rem', marginBottom:16 }}>🔐</div>
        <h2 style={{ fontFamily:'Playfair Display, serif', marginBottom:8 }}>Admin Login</h2>
        <p style={{ color:'var(--muted)', marginBottom:28, fontSize:'0.88rem', lineHeight:1.7 }}>
          Enter your credentials to access the dashboard.
        </p>
        <input type="text" value={loginForm.username} onChange={e=>setLoginForm(f=>({...f,username:e.target.value}))}
          placeholder="Username" className="input-field" style={{ marginBottom:12 }} autoFocus
          onKeyDown={e=>e.key==='Enter'&&document.getElementById('pw-input')?.focus()} />
        <input id="pw-input" type="password" value={loginForm.password} onChange={e=>setLoginForm(f=>({...f,password:e.target.value}))}
          placeholder="Password" className="input-field" style={{ marginBottom:16 }}
          onKeyDown={e=>e.key==='Enter'&&login()} />
        <button onClick={login} disabled={loginLoading} className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>
          {loginLoading ? '⌛ Logging in…' : 'Enter Dashboard →'}
        </button>
        <p style={{ color:'var(--muted)', fontSize:'0.72rem', marginTop:14 }}>
          Default: <code>superadmin</code> / <code>super123</code> or <code>admin</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );

  // ═══ MAIN DASHBOARD ═════════════════════════════════
  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', paddingTop:80 }}>

      {/* Header */}
      <div style={{ background:'var(--emerald-dark)', padding:'24px 0', borderBottom:'1px solid rgba(201,151,58,0.2)' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display, serif', color:'#fff', fontSize:'1.6rem', marginBottom:2 }}>Admin Dashboard</h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem' }}>
              {currentUser?.displayName || currentUser?.username} · <span className="badge" style={{ background:'rgba(201,151,58,0.3)', color:'var(--gold-light)', fontSize:'0.65rem' }}>
                {isSuperAdmin ? '👑 Super Admin' : '🛡️ Admin'}
              </span>
            </p>
          </div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            <button onClick={exportCSV} disabled={exporting} style={{ padding:'8px 16px', background:'rgba(201,151,58,0.15)', color:'var(--gold-light)', border:'1px solid rgba(201,151,58,0.3)', borderRadius:99, cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
              {exporting?'⌛':'📥'} Export CSV
            </button>
            <button onClick={loadAll} style={{ padding:'8px 14px', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:99, cursor:'pointer', fontSize:'0.8rem' }}>🔄</button>
            <button onClick={()=>{setAuthed(false);setCurrentUser(null);setLoginForm({username:'',password:''});}} style={{ padding:'8px 14px', background:'rgba(220,38,38,0.15)', color:'#fca5a5', border:'1px solid rgba(220,38,38,0.3)', borderRadius:99, cursor:'pointer', fontSize:'0.8rem' }}>🚪 Logout</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'1px solid rgba(26,92,56,0.1)', overflowX:'auto' }}>
        <div className="container" style={{ display:'flex' }}>
          {TABS.map(t => {
            const badge = t==='Inbox'?unreadCount : t==='Volunteers'?pendingVols : t==='Pending'?pendingCount : 0;
            return (
              <button key={t} onClick={()=>setTab(t)} style={{ padding:'14px 16px', border:'none', background:'none', cursor:'pointer', fontWeight:700, fontSize:'0.82rem', whiteSpace:'nowrap', position:'relative', color:tab===t?'var(--emerald)':'var(--muted)', borderBottom:tab===t?'3px solid var(--emerald)':'3px solid transparent', transition:'all 0.2s' }}>
                {t}
                {badge>0 && <span style={{ position:'absolute', top:7, right:2, background:t==='Pending'?'var(--gold)':'#dc2626', color:t==='Pending'?'#000':'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.58rem', fontWeight:800 }}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="container" style={{ padding:'32px 24px' }}>

        {/* ═══ DASHBOARD ═══ */}
        {tab==='Dashboard' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
              {[
                {icon:'💰', label:'Total Raised',   value:loading?'—':`৳${(stats.totalRaised||0).toLocaleString()}`, sub:'Approved', color:'#c9973a'},
                {icon:'🤲', label:'Donations',       value:loading?'—':(stats.totalDonations||0).toLocaleString(),   sub:'Approved', color:'#1a5c38'},
                {icon:'⏳', label:'Pending',          value:loading?'—':pendingCount,                                sub:'Awaiting approval', color:'#f59e0b'},
                {icon:'📋', label:'Live Campaigns',  value:loading?'—':stats.activeCampaigns,                        sub:`${stats.totalCampaigns||0} total`, color:'#6366f1'},
                {icon:'📬', label:'Messages',        value:loading?'—':contacts.length,                              sub:`${unreadCount} unread`, color:'#ec4899'},
                {icon:'✉️', label:'Subscribers',     value:loading?'—':stats.newsletterSubscribers||subscribers.length, sub:'Newsletter', color:'#0ea5e9'},
              ].map(s => (
                <div key={s.label} className="card" style={{ padding:'20px 18px', cursor:s.label==='Pending'?'pointer':'default' }} onClick={()=>s.label==='Pending'&&setTab('Pending')}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <span style={{ fontSize:'1.5rem' }}>{s.icon}</span>
                    <span style={{ fontSize:'0.68rem', color:'var(--muted)', background:'var(--parchment)', padding:'2px 7px', borderRadius:99 }}>{s.sub}</span>
                  </div>
                  <div style={{ fontFamily:'Playfair Display, serif', fontSize:'1.8rem', color:s.color, fontWeight:700, lineHeight:1 }}>{s.value}</div>
                  <div style={{ color:'var(--muted)', fontSize:'0.78rem', marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:24 }}>
              <div className="card" style={{ padding:'22px 24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
                  <h3 style={{ fontFamily:'Playfair Display, serif', fontSize:'1rem' }}>Last 7 Days</h3>
                  <span style={{ color:'var(--emerald)', fontWeight:700, fontSize:'0.85rem' }}>৳{last7.reduce((s,d)=>s+d.value,0).toLocaleString()}</span>
                </div>
                <BarChart data={last7} color="var(--emerald)" />
              </div>
              <div className="card" style={{ padding:'22px 24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
                  <h3 style={{ fontFamily:'Playfair Display, serif', fontSize:'1rem' }}>Monthly Trend</h3>
                  <span className="badge badge-gold" style={{ fontSize:'0.68rem' }}>6 months</span>
                </div>
                <BarChart data={(stats.monthlyData||[]).map(d=>({...d,value:d.amount}))} color="var(--gold)" />
              </div>
            </div>

            {/* Export & Email section */}
            <div className="card" style={{ padding:'22px 26px', marginBottom:24 }}>
              <h3 style={{ fontFamily:'Playfair Display, serif', fontSize:'1rem', marginBottom:16 }}>📧 Export & Email Report</h3>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                <input type="email" value={exportEmail} onChange={e=>setExportEmail(e.target.value)} placeholder="recipient@email.com" className="input-field" style={{ flex:1, minWidth:200 }} />
                <button onClick={exportAndEmail} disabled={exporting} style={{ padding:'10px 20px', background:'var(--emerald)', color:'#fff', border:'none', borderRadius:50, cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>
                  {exporting ? '⌛ Sending…' : '📧 Send Excel via Email'}
                </button>
                <button onClick={exportCSV} disabled={exporting} className="btn-primary" style={{ padding:'10px 20px', fontSize:'0.85rem' }}>
                  📥 Download CSV
                </button>
              </div>
              <p style={{ color:'var(--muted)', fontSize:'0.72rem', marginTop:8 }}>
                💡 Configure SMTP_HOST, SMTP_USER, SMTP_PASS in <code>.env.local</code> for email. CSV opens directly in Excel.
              </p>
            </div>
          </div>
        )}

        {/* ═══ PENDING DONATIONS ═══ */}
        {tab==='Pending' && (
          <div>
            <h2 style={{ fontFamily:'Playfair Display, serif', marginBottom:22 }}>
              ⏳ Pending Donations ({pendingCount})
              {pendingCount>0 && <span style={{ color:'var(--gold)', fontSize:'0.9rem', marginLeft:12 }}>
                ৳{pendingDonations.reduce((s,d)=>s+(d.amount||0),0).toLocaleString()}
              </span>}
            </h2>

            {loading ? <p style={{ color:'var(--muted)', textAlign:'center', padding:48 }}>Loading…</p>
            : !pendingDonations.length ? (
              <div style={{ textAlign:'center', padding:80, color:'var(--muted)' }}>
                <div style={{ fontSize:'3rem' }}>✅</div>
                <p style={{ marginTop:12, fontWeight:600 }}>No pending donations!</p>
                <p style={{ fontSize:'0.85rem' }}>All donations have been reviewed.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {pendingDonations.map(d => (
                  <div key={d.id} className="card" style={{ padding:'16px 20px', borderLeft:'4px solid var(--gold)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                      <div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                          <span style={{ fontWeight:700 }}>{d.donorName || 'Anonymous'}</span>
                          <span style={{ fontFamily:'Playfair Display, serif', color:'var(--emerald)', fontWeight:700, fontSize:'1.1rem' }}>৳{(d.amount||0).toLocaleString()}</span>
                          <span className="badge badge-gold" style={{ fontSize:'0.65rem' }}>{d.category}</span>
                        </div>
                        <div style={{ display:'flex', gap:12, fontSize:'0.79rem', color:'var(--muted)', flexWrap:'wrap' }}>
                          {d.email && <span>✉️ {d.email}</span>}
                          <span>💳 {d.paymentMethod}</span>
                          <span>📅 {d.createdAt?.seconds?new Date(d.createdAt.seconds*1000).toLocaleDateString():'—'}</span>
                        </div>
                        {d.message && <p style={{ color:'var(--muted)', fontSize:'0.8rem', fontStyle:'italic', marginTop:4 }}>"{d.message}"</p>}
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <button onClick={()=>handleDonationAction(d.id,'approved')} style={{ padding:'8px 16px', background:'var(--emerald)', color:'#fff', border:'none', borderRadius:99, cursor:'pointer', fontSize:'0.82rem', fontWeight:700 }}>✅ Approve</button>
                        <button onClick={()=>handleDonationAction(d.id,'rejected')} style={{ padding:'8px 16px', background:'transparent', color:'#dc2626', border:'1.5px solid #dc2626', borderRadius:99, cursor:'pointer', fontSize:'0.82rem', fontWeight:700 }}>✗ Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ CAMPAIGNS ═══ */}
        {tab==='Campaigns' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22, flexWrap:'wrap', gap:12 }}>
              <h2 style={{ fontFamily:'Playfair Display, serif' }}>Campaigns ({campaigns.length})</h2>
              <button onClick={openCreate} className="btn-primary">+ New Campaign</button>
            </div>
            {showForm && (
              <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
                <div className="card" style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', padding:'32px' }}>
                  <h3 style={{ fontFamily:'Playfair Display, serif', marginBottom:22 }}>{editId?'✏️ Edit':'➕ Create'} Campaign</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[['title','Title *','text','Masjid Renovation'],['goalAmount','Goal (৳) *','number','500000'],['endDate','End Date','date',''],['imageUrl','Image URL','url','https://…']].map(([k,l,t,ph])=>(
                      <div key={k}>
                        <label style={{ display:'block', fontWeight:600, fontSize:'0.83rem', color:'var(--emerald)', marginBottom:4 }}>{l}</label>
                        <input type={t} value={form[k]||''} placeholder={ph} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="input-field" />
                      </div>
                    ))}
                    <div>
                      <label style={{ display:'block', fontWeight:600, fontSize:'0.83rem', color:'var(--emerald)', marginBottom:4 }}>Category</label>
                      <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="input-field">
                        {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontWeight:600, fontSize:'0.83rem', color:'var(--emerald)', marginBottom:4 }}>Description</label>
                      <textarea value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} className="input-field" style={{ resize:'vertical' }} />
                    </div>
                    <div style={{ display:'flex', gap:10, marginTop:6 }}>
                      <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:13, border:'none', borderRadius:50, background:'var(--parchment)', fontWeight:600, cursor:'pointer' }}>Cancel</button>
                      <button onClick={saveCampaign} disabled={saving} className="btn-primary" style={{ flex:2, justifyContent:'center' }}>{saving?'⌛ Saving…':editId?'💾 Update':'✅ Create'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {loading ? <p style={{ color:'var(--muted)', textAlign:'center', padding:48 }}>Loading…</p> : (
              <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                {campaigns.map(c => {
                  const pct = Math.min(100,Math.round(((c.raisedAmount||0)/(c.goalAmount||1))*100));
                  return (
                    <div key={c.id} className="card" style={{ padding:'16px 20px', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                      <div style={{ flex:1, minWidth:180 }}>
                        <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                          <h4 style={{ fontFamily:'Playfair Display, serif', fontSize:'0.95rem' }}>{c.title}</h4>
                          <span className={`badge ${c.active?'badge-emerald':'badge-red'}`} style={{ fontSize:'0.65rem' }}>{c.active?'Active':'Closed'}</span>
                        </div>
                        <div style={{ color:'var(--muted)', fontSize:'0.78rem', marginBottom:5 }}>৳{(c.raisedAmount||0).toLocaleString()} / ৳{(c.goalAmount||0).toLocaleString()} · {c.donorCount||0} donors</div>
                        <div className="progress-bar" style={{ height:5 }}><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <button onClick={()=>openEdit(c)} style={{ padding:'6px 12px', border:'1.5px solid var(--emerald)', color:'var(--emerald)', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.76rem', fontWeight:600 }}>✏️ Edit</button>
                        <button onClick={()=>toggleActive(c.id,c.active)} style={{ padding:'6px 12px', border:'1.5px solid var(--gold)', color:'var(--gold)', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.76rem', fontWeight:600 }}>{c.active?'⏸ Close':'▶️ Open'}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ DONATIONS ═══ */}
        {tab==='Donations' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22, flexWrap:'wrap', gap:12 }}>
              <h2 style={{ fontFamily:'Playfair Display, serif' }}>All Donations ({donations.length}) · <span style={{ color:'var(--emerald)' }}>৳{donations.filter(d=>d.status==='approved').reduce((s,d)=>s+(d.amount||0),0).toLocaleString()}</span></h2>
              <button onClick={exportCSV} disabled={exporting} className="btn-primary" style={{ padding:'9px 18px', fontSize:'0.82rem' }}>{exporting?'⌛':'📥'} Export</button>
            </div>
            <div className="card" style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.83rem' }}>
                <thead><tr style={{ background:'var(--emerald-dark)' }}>{['#','Donor','Amount','Status','Category','Payment','Date','Action'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                <tbody>
                  {donations.map((d,i) => (
                    <tr key={d.id} style={{ borderBottom:'1px solid rgba(26,92,56,0.07)', background:i%2===0?'#fff':'rgba(250,247,240,0.4)' }}>
                      <td style={{ padding:'9px 14px', color:'var(--muted)' }}>{i+1}</td>
                      <td style={{ padding:'9px 14px', fontWeight:600 }}>{d.donorName||'—'}</td>
                      <td style={{ padding:'9px 14px', color:'var(--emerald)', fontWeight:700 }}>৳{(d.amount||0).toLocaleString()}</td>
                      <td style={{ padding:'9px 14px' }}><StatusBadge status={d.status} /></td>
                      <td style={{ padding:'9px 14px' }}><span className="badge badge-gold" style={{ fontSize:'0.67rem' }}>{d.category}</span></td>
                      <td style={{ padding:'9px 14px', fontSize:'0.79rem' }}>{d.paymentMethod}</td>
                      <td style={{ padding:'9px 14px', color:'var(--muted)', whiteSpace:'nowrap', fontSize:'0.79rem' }}>{d.createdAt?.seconds?new Date(d.createdAt.seconds*1000).toLocaleDateString():'—'}</td>
                      <td style={{ padding:'9px 14px' }}>
                        {d.status==='pending' && (
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={()=>handleDonationAction(d.id,'approved')} style={{ padding:'4px 10px', background:'var(--emerald)', color:'#fff', border:'none', borderRadius:99, cursor:'pointer', fontSize:'0.7rem', fontWeight:600 }}>✅</button>
                            <button onClick={()=>handleDonationAction(d.id,'rejected')} style={{ padding:'4px 10px', background:'transparent', color:'#dc2626', border:'1px solid #dc2626', borderRadius:99, cursor:'pointer', fontSize:'0.7rem', fontWeight:600 }}>✗</button>
                          </div>
                        )}
                        {d.approvedBy && <span style={{ fontSize:'0.7rem', color:'var(--muted)' }}>by {d.approvedBy}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ ENTER DONATION ═══ */}
        {tab==='Enter Donation' && (
          <div>
            <h2 style={{ fontFamily:'Playfair Display, serif', marginBottom:8 }}>💰 Enter Manual Donation</h2>
            <p style={{ color:'var(--muted)', marginBottom:24, fontSize:'0.9rem' }}>Record cash or in-person donations. These are auto-approved.</p>
            <div className="card" style={{ padding:'32px', maxWidth:600 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {[['donorName','Donor Name *','text','আব্দুল রহমান'],['amount','Amount (৳) *','number','5000']].map(([k,l,t,ph])=>(
                  <div key={k}>
                    <label style={{ display:'block', fontWeight:600, fontSize:'0.88rem', color:'var(--emerald)', marginBottom:6 }}>{l}</label>
                    <input type={t} value={manualDonation[k]} placeholder={ph} onChange={e=>setManualDonation(f=>({...f,[k]:e.target.value}))} className="input-field" />
                  </div>
                ))}
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'0.88rem', color:'var(--emerald)', marginBottom:6 }}>Category</label>
                  <select value={manualDonation.category} onChange={e=>setManualDonation(f=>({...f,category:e.target.value}))} className="input-field">
                    {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'0.88rem', color:'var(--emerald)', marginBottom:6 }}>Payment Method</label>
                  <select value={manualDonation.paymentMethod} onChange={e=>setManualDonation(f=>({...f,paymentMethod:e.target.value}))} className="input-field">
                    {['cash','bank','bkash','nagad','rocket','card','other'].map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                  </select>
                </div>
                {campaigns.length>0 && (
                  <div>
                    <label style={{ display:'block', fontWeight:600, fontSize:'0.88rem', color:'var(--emerald)', marginBottom:6 }}>Campaign (optional)</label>
                    <select value={manualDonation.campaignId} onChange={e=>setManualDonation(f=>({...f,campaignId:e.target.value}))} className="input-field">
                      <option value="">— General Donation —</option>
                      {campaigns.filter(c=>c.active).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'0.88rem', color:'var(--emerald)', marginBottom:6 }}>Note (optional)</label>
                  <textarea value={manualDonation.message} onChange={e=>setManualDonation(f=>({...f,message:e.target.value}))} rows={2} className="input-field" style={{ resize:'vertical' }} placeholder="Any notes about this donation…" />
                </div>
                <button onClick={submitManualDonation} disabled={saving} className="btn-primary" style={{ justifyContent:'center', marginTop:8 }}>
                  {saving ? '⌛ Recording…' : '💰 Record Donation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ VOLUNTEERS ═══ */}
        {tab==='Volunteers' && (
          <div>
            <h2 style={{ fontFamily:'Playfair Display, serif', marginBottom:22 }}>Volunteers ({volunteers.length})</h2>
            {loading ? <p style={{ color:'var(--muted)', textAlign:'center', padding:48 }}>Loading…</p>
            : !volunteers.length ? <div style={{ textAlign:'center', padding:80, color:'var(--muted)' }}><div style={{ fontSize:'3rem' }}>🙋</div><p style={{ marginTop:12 }}>No applications yet.</p></div>
            : volunteers.map(v => (
              <div key={v.id} className="card" style={{ padding:'16px 20px', marginBottom:10, borderLeft:`4px solid ${v.status==='approved'?'var(--emerald)':v.status==='rejected'?'#dc2626':'var(--gold)'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{v.name} <StatusBadge status={v.status||'pending'} /></div>
                    <div style={{ fontSize:'0.79rem', color:'var(--muted)' }}>✉️ {v.email} {v.phone && `· 📞 ${v.phone}`}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {v.status!=='approved' && <button onClick={async()=>{await fetch(`/api/volunteer?id=${v.id}&status=approved`,{method:'PATCH'}); toast.success('Approved!'); loadAll();}} style={{ padding:'6px 12px', border:'1.5px solid var(--emerald)', color:'var(--emerald)', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.76rem', fontWeight:600 }}>✅</button>}
                    {v.status!=='rejected' && <button onClick={async()=>{await fetch(`/api/volunteer?id=${v.id}&status=rejected`,{method:'PATCH'}); loadAll();}} style={{ padding:'6px 12px', border:'1.5px solid #dc2626', color:'#dc2626', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.76rem', fontWeight:600 }}>✗</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ INBOX ═══ */}
        {tab==='Inbox' && (
          <div>
            <h2 style={{ fontFamily:'Playfair Display, serif', marginBottom:22 }}>Inbox ({contacts.length})</h2>
            {!contacts.length ? <div style={{ textAlign:'center', padding:80, color:'var(--muted)' }}><div style={{ fontSize:'3rem' }}>📬</div><p style={{ marginTop:12 }}>No messages.</p></div>
            : contacts.map(c => (
              <div key={c.id} className="card" style={{ padding:'16px 20px', marginBottom:10, borderLeft:`4px solid ${c.read?'rgba(26,92,56,0.15)':'var(--gold)'}`, opacity:c.read?0.82:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:10 }}>
                  <div>
                    <span style={{ fontWeight:700 }}>{c.name}</span>
                    {!c.read && <span className="badge badge-gold" style={{ fontSize:'0.62rem', marginLeft:6 }}>NEW</span>}
                    <div style={{ fontSize:'0.79rem', color:'var(--muted)' }}>✉️ {c.email}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {!c.read && <button onClick={async()=>{await fetch(`/api/contact?id=${c.id}`,{method:'PATCH'}); setContacts(cs=>cs.map(x=>x.id===c.id?{...x,read:true}:x));}} style={{ padding:'6px 12px', border:'1.5px solid var(--gold)', color:'var(--gold)', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.76rem', fontWeight:600 }}>✓ Read</button>}
                    <button onClick={async()=>{if(!confirm('Delete?'))return; await fetch(`/api/contact?id=${c.id}`,{method:'DELETE'}); loadAll();}} style={{ padding:'6px 12px', border:'1.5px solid #9ca3af', color:'#9ca3af', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.76rem', fontWeight:600 }}>🗑</button>
                  </div>
                </div>
                <div style={{ background:'var(--parchment)', borderRadius:10, padding:'11px 14px', fontSize:'0.86rem', lineHeight:1.7 }}>{c.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ NEWSLETTER ═══ */}
        {tab==='Newsletter' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ fontFamily:'Playfair Display, serif' }}>Subscribers ({subscribers.length})</h2>
              <button onClick={exportEmails} className="btn-primary" style={{ padding:'9px 18px', fontSize:'0.82rem' }}>📥 Export Emails</button>
            </div>
            {!subscribers.length ? <div style={{ textAlign:'center', padding:80, color:'var(--muted)' }}><div style={{ fontSize:'3rem' }}>✉️</div><p style={{ marginTop:12 }}>No subscribers yet.</p></div>
            : (
              <div className="card" style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.84rem' }}>
                  <thead><tr style={{ background:'var(--parchment)' }}>{['#','Email','Date','Action'].map(h=><th key={h} style={{ padding:'11px 16px', textAlign:'left', color:'var(--emerald)', fontWeight:700 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {subscribers.map((s,i) => (
                      <tr key={s.id} style={{ borderTop:'1px solid rgba(26,92,56,0.07)', background:i%2===0?'#fff':'rgba(250,247,240,0.4)' }}>
                        <td style={{ padding:'10px 16px', color:'var(--muted)' }}>{i+1}</td>
                        <td style={{ padding:'10px 16px', fontWeight:600 }}>{s.email}</td>
                        <td style={{ padding:'10px 16px', color:'var(--muted)' }}>{s.createdAt?.seconds?new Date(s.createdAt.seconds*1000).toLocaleDateString():'—'}</td>
                        <td style={{ padding:'10px 16px' }}>
                          <button onClick={async()=>{await fetch(`/api/newsletter/unsubscribe?id=${s.id}`,{method:'POST'}); toast.success('Removed.'); loadAll();}} style={{ padding:'5px 11px', border:'1.5px solid #dc2626', color:'#dc2626', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.74rem', fontWeight:600 }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ USERS (Super Admin Only) ═══ */}
        {tab==='Users' && isSuperAdmin && (
          <div>
            <h2 style={{ fontFamily:'Playfair Display, serif', marginBottom:22 }}>👥 Admin Users</h2>

            {/* Create new user form */}
            <div className="card" style={{ padding:'28px', marginBottom:24 }}>
              <h3 style={{ fontFamily:'Playfair Display, serif', marginBottom:16, fontSize:'1rem' }}>➕ Create Admin User</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'0.83rem', color:'var(--emerald)', marginBottom:4 }}>Username *</label>
                  <input type="text" value={newAdmin.username} onChange={e=>setNewAdmin(f=>({...f,username:e.target.value}))} placeholder="newadmin" className="input-field" />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'0.83rem', color:'var(--emerald)', marginBottom:4 }}>Password *</label>
                  <input type="text" value={newAdmin.password} onChange={e=>setNewAdmin(f=>({...f,password:e.target.value}))} placeholder="password123" className="input-field" />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'0.83rem', color:'var(--emerald)', marginBottom:4 }}>Display Name</label>
                  <input type="text" value={newAdmin.displayName} onChange={e=>setNewAdmin(f=>({...f,displayName:e.target.value}))} placeholder="Display Name" className="input-field" />
                </div>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'0.83rem', color:'var(--emerald)', marginBottom:4 }}>Role</label>
                  <select value={newAdmin.role} onChange={e=>setNewAdmin(f=>({...f,role:e.target.value}))} className="input-field">
                    <option value="admin">🛡️ Normal Admin</option>
                    <option value="super_admin">👑 Super Admin</option>
                  </select>
                </div>
              </div>
              <button onClick={createUser} className="btn-primary" style={{ marginTop:16 }}>✅ Create User</button>
            </div>

            {/* Existing users */}
            <div className="card" style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.84rem' }}>
                <thead><tr style={{ background:'var(--emerald-dark)' }}>{['Username','Display Name','Role','Created','Action'].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                <tbody>
                  {adminUsers.map((u,i) => (
                    <tr key={u.id} style={{ borderBottom:'1px solid rgba(26,92,56,0.07)', background:i%2===0?'#fff':'rgba(250,247,240,0.4)' }}>
                      <td style={{ padding:'10px 14px', fontWeight:600 }}>{u.username}</td>
                      <td style={{ padding:'10px 14px' }}>{u.displayName || '—'}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span className={`badge ${u.role==='super_admin'?'badge-gold':'badge-emerald'}`} style={{ fontSize:'0.65rem' }}>
                          {u.role==='super_admin'?'👑 Super Admin':'🛡️ Admin'}
                        </span>
                      </td>
                      <td style={{ padding:'10px 14px', color:'var(--muted)', fontSize:'0.79rem' }}>{u.createdAt?.seconds?new Date(u.createdAt.seconds*1000).toLocaleDateString():'—'}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <button onClick={()=>deleteUser(u.id)} style={{ padding:'5px 11px', border:'1.5px solid #dc2626', color:'#dc2626', background:'transparent', borderRadius:99, cursor:'pointer', fontSize:'0.74rem', fontWeight:600 }}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ DATA MANAGEMENT (Super Admin Only) ═══ */}
        {tab==='Data Management' && isSuperAdmin && (
          <div>
            <h2 style={{ fontFamily:'Playfair Display, serif', marginBottom:8 }}>🗑️ Data Management</h2>
            <p style={{ color:'var(--muted)', marginBottom:32, fontSize:'0.9rem' }}>
              Purge all application data for production deployment. <strong>This cannot be undone.</strong>
            </p>

            <div className="card" style={{ padding:'32px', maxWidth:560, border:'2px solid #dc2626' }}>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ fontSize:'3rem', marginBottom:12 }}>⚠️</div>
                <h3 style={{ color:'#dc2626', fontFamily:'Playfair Display, serif', marginBottom:8 }}>Danger Zone</h3>
                <p style={{ color:'var(--muted)', fontSize:'0.88rem', lineHeight:1.7 }}>
                  This will permanently delete ALL:<br/>
                  Donations, Campaigns, Contacts, Volunteers, and Newsletter subscribers.<br/>
                  <strong>Admin users will be preserved.</strong>
                </p>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontWeight:600, fontSize:'0.88rem', color:'#dc2626', marginBottom:6 }}>
                  Enter your password to confirm:
                </label>
                <input type="password" value={purgeConfirm} onChange={e=>setPurgeConfirm(e.target.value)} placeholder="Re-enter your password" className="input-field" style={{ borderColor:'#dc2626' }} />
              </div>

              <button onClick={purgeData} disabled={purging || !purgeConfirm} style={{
                width:'100%', padding:'14px', border:'none', borderRadius:50, cursor:'pointer',
                fontWeight:700, fontSize:'0.95rem',
                background: purgeConfirm ? '#dc2626' : '#e5e7eb',
                color: purgeConfirm ? '#fff' : '#9ca3af',
                transition:'all 0.2s',
              }}>
                {purging ? '⌛ Purging…' : '🗑️ Purge All Data'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
