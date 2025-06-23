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
            date: item['Date ']?.trim() || '',
            time: item.Time,
            course: item.Course,
            players: [
              item['Player 1'],
              item['Player 2'],
              item['Player 3'],
              item['Player 4']
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
    const teeTime = teeTimes.find((t) => t.id === id);
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

    const query = `Course=${encodeURIComponent(teeTime.course)}&Date%20=${encodeURIComponent(teeTime.date)}&Time=${encodeURIComponent(teeTime.time)}`;

    fetch(`https://sheetdb.io/api/v1/4qv4g5mlcy4t5/search?${query}`)
      .then((res) => res.json())
      .then((rows) => {
        if (rows.length > 0) {
          const rowId = rows[0].id;
          fetch(`https://sheetdb.io/api/v1/4qv4g5mlcy4t5/id/${rowId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: { [playerField]: playerName } })
          })
            .then((res) => res.json())
            .then(() => {
              fetchTeeTimes();
              setPlayerName('');
              setError('');
            });
        }
      })
      .catch((err) => console.error('Error updating player:', err));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setScorecardImages((prev) => [...prev, ...imageUrls]);
  };

  const renderTeeTimeDetail = (id) => {
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

  if (tab.startsWith('teeTime-')) {
    const id = parseInt(tab.split('-')[1]);
    return renderTeeTimeDetail(id);
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tee Times</h1>
      {teeTimes.map(({ id, date, time, course, players }) => (
        <div key={id} onClick={() => setTab(`teeTime-${id}`)} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}>
          <strong>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
          <p>{time} — {course}</p>
          <p>{players.length} / 4 Players</p>
        </div>
      ))}
    </div>
  );
}
