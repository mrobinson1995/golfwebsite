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
    return <div>...entrance code remains unchanged...</div>; // keep entrance screen code here
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f1efe7', padding: '40px 20px', height: '100vh', width: '100vw', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        ...header and nav remain unchanged...

        {tab === 'teeTimes' && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Tee Time Calendar</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {teeTimes.map(({ id, date, time, course, players }) => (
                <div key={id} onClick={() => setTab(`teeTime-${id}`)} style={{ flex: '1 1 250px', backgroundColor: '#f8f8f8', border: '1px solid #ccc', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer' }}>
                  <strong>{new Date(date.replace(/\s+/g, '')).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                  <p style={{ margin: '6px 0' }}>{time}</p>
                  <p style={{ margin: '0', fontStyle: 'italic' }}>{course}</p>
                  <p style={{ marginTop: '10px', fontWeight: 600 }}>{players.length} / 4 Players</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab.startsWith('teeTime-') && renderTeeTimeDetail(parseInt(tab.split('-')[1]))}

        ...majors and rules tab remain unchanged...
      </div>
    </div>
  );
}
