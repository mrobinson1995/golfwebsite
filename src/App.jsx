import React, { useState } from 'react';

const initialTeeTimes = [
  { id: 1, date: '2025-06-10', time: '8:00 AM', course: 'Pine Hill', players: [] },
  { id: 2, date: '2025-06-15', time: '7:30 AM', course: 'Stone Harbor', players: [] }
];

export default function GolfSite() {
  const [teeTimes, setTeeTimes] = useState(initialTeeTimes);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('entrance');
  const [scorecardImages, setScorecardImages] = useState([]);

  const handleSignUp = (id) => {
    if (!playerName) return;
    setTeeTimes(prev =>
      prev.map(t => {
        if (t.id === id) {
          const isAlreadySignedUp = t.players.includes(playerName);
          if (isAlreadySignedUp) {
            setError('');
            return { ...t, players: t.players.filter(p => p !== playerName) };
          }
          if (t.players.length >= 4) {
            setError('This tee time is already full.');
            return t;
          }
          setError('');
          return { ...t, players: [...t.players, playerName] };
        }
        return t;
      })
    );
    setPlayerName('');
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setScorecardImages(prev => [...prev, ...imageUrls]);
  };

  if (tab === 'entrance') {
    return (
      <div style={{
        backgroundImage: 'url(https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2017/10/07/59d9000722bd233920d352c5_Jeffersonville%203.JPG.rend.hgtvcom.966.644.suffix/1573348146565.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Serif Display, serif',
        color: 'white',
        textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '40px', borderRadius: '12px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', marginBottom: '20px' }}><em>"So it is said, let it be written"</em></h1>
          <button onClick={() => setTab('teeTimes')} style={{ padding: '14px 28px', fontSize: '18px', backgroundColor: '#3e513d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Enter Clubhouse</button>
        </div>
      </div>
    );
  }

return (
  <div style={{
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#f1efe7',
    padding: '40px 20px',
    height: '100vh',
    width: '100vw',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <header style={{ borderBottom: '2px solid #3e513d', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(28px, 6vw, 48px)', color: '#3e513d', textAlign: 'center' }}>Quick Hitters Golf Club</h1>
          <p style={{ textAlign: 'center', color: '#555', fontSize: '16px' }}>est. 2014</p>
        </header>

        <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 20px', marginBottom: '30px' }}>
          <button onClick={() => setTab('teeTimes')} style={{ background: tab === 'teeTimes' ? '#3e513d' : '#ddd', color: tab === 'teeTimes' ? 'white' : '#333', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '16px' }}>Tee Times</button>
          <button onClick={() => setTab('majors')} style={{ background: tab === 'majors' ? '#3e513d' : '#ddd', color: tab === 'majors' ? 'white' : '#333', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '16px' }}>Major Results</button>
          <button onClick={() => setTab('rules')} style={{ background: tab === 'rules' ? '#3e513d' : '#ddd', color: tab === 'rules' ? 'white' : '#333', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '16px' }}>Official Rules</button>
        </nav>

        {tab === 'teeTimes' && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Tee Time Calendar</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {teeTimes.map(({ id, date, time, course, players }) => (
                <div
                  key={id}
                  onClick={() => setTab(`teeTime-${id}`)}
                  style={{ flex: '1 1 250px', backgroundColor: '#f8f8f8', border: '1px solid #ccc', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer' }}
                >
                  <strong>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                  <p style={{ margin: '6px 0' }}>{time}</p>
                  <p style={{ margin: '0', fontStyle: 'italic' }}>{course}</p>
                  <p style={{ marginTop: '10px', fontWeight: 600 }}>{players.length} / 4 Players</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab.startsWith('teeTime-') && (() => {
          const id = parseInt(tab.split('-')[1]);
          const teeTime = teeTimes.find(t => t.id === id);
          if (!teeTime) return null;
          return (
            <div style={{ marginTop: '40px' }}>
              <button onClick={() => setTab('teeTimes')} style={{ marginBottom: '20px', padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '6px' }}>← Back</button>
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{teeTime.course}</h2>
              <p><strong>Date:</strong> {teeTime.date}</p>
              <p><strong>Time:</strong> {teeTime.time}</p>

              <div style={{ marginTop: '20px' }}>
                <input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px', width: '100%', maxWidth: '300px' }}
                />
                <button
                  onClick={() => handleSignUp(id)}
                  style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#3e513d', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px' }}
                >
                  Playing
                </button>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>Participants:</h3>
                {teeTime.players.length > 0 ? (
                  <ul>
                    {teeTime.players.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No one signed up yet.</p>
                )}
              </div>
            </div>
          );
        })()}

        {tab === 'majors' && (
          <section style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Post Major Result</h2>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
            <div style={{ marginTop: '30px' }}>
              <h3>Uploaded Results</h3>
              {scorecardImages.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {scorecardImages.map((url, index) => (
                    <img key={index} src={url} alt="Major Result" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px' }} />
                  ))}
                </div>
              ) : (
                <p>No major results posted yet.</p>
              )}
            </div>
          </section>
        )}

        {tab === 'rules' && (
          <section style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Official Rules</h2>
            <p>Welcome to the Quick Hitters Golf Club Rules section. The full rulebook will be posted here soon. Stay tuned!</p>
          </section>
        )}
      </div>
    </div>
  );
}
