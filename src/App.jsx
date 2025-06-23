import React, { useEffect, useState } from 'react';

export default function GolfSite() {
  const [teeTimes, setTeeTimes] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('entrance');
  const [scorecardImages, setScorecardImages] = useState([]);

  const fetchTeeTimes = () => {
    fetch('https://sheetdb.io/api/v1/4qv4g5mlcy4t5')
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item, index) => {
          return {
            id: index + 1,
            rowId: item.id,
            date: item['Date '].trim(),
            time: item.Time,
            course: item.Course,
            players: [
              item["Player 1"],
              item["Player 2"],
              item["Player 3"],
              item["Player 4"]
            ].filter(Boolean)
          };
        });
        setTeeTimes(formattedData);
      });
  };

  useEffect(() => {
    fetchTeeTimes();
  }, []);

  const handleSignUp = (id) => {
    if (!playerName) return;
    const teeTime = teeTimes.find(t => t.id === id);
    if (!teeTime) return;

    const isAlreadySignedUp = teeTime.players.includes(playerName);
    if (isAlreadySignedUp) {
      setError('');
      return;
    }
    if (teeTime.players.length >= 4) {
      setError('This tee time is already full.');
      return;
    }

    const nextPlayerIndex = teeTime.players.length + 1;
    const playerField = `Player ${nextPlayerIndex}`;

    const query = `Course=${encodeURIComponent(teeTime.course)}&Date=${encodeURIComponent(teeTime.date)}&Time=${encodeURIComponent(teeTime.time)}`;

    fetch(`https://sheetdb.io/api/v1/4qv4g5mlcy4t5/search?${query}`)
      .then(res => res.json())
      .then(rows => {
        if (rows.length > 0) {
          const rowId = rows[0].id;
          fetch(`https://sheetdb.io/api/v1/4qv4g5mlcy4t5/id/${rowId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: { [playerField]: playerName } })
          })
            .then(res => res.json())
            .then(() => {
              fetchTeeTimes();
              setPlayerName('');
              setError('');
            });
        }
      })
      .catch(err => console.error("Error updating player:", err));
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
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                  <strong>{new Date(Date.parse(date)).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                  <p style={{ margin: '6px 0' }}>{time}</p>
                  <p style={{ margin: '0', fontStyle: 'italic' }}>{course}</p>
                  <p style={{ marginTop: '10px', fontWeight: 600 }}>{players.length} / 4 Players</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
