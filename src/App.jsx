import React, { useEffect, useState } from 'react';

export default function GolfSite() {
  const [teeTimes, setTeeTimes] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('entrance');
  const [scorecardImages, setScorecardImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTeeTimes = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://sheetdb.io/api/v1/4qv4g5mlcy4t5');
      const data = await res.json();
      const formattedData = data.map((item, index) => {
        let parsedDate = item['Date ']?.trim();
        let formattedDate = parsedDate;
        try {
          formattedDate = new Date(parsedDate).toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
          });
        } catch {
          formattedDate = 'Invalid Date';
        }
        return {
          id: index + 1,
          rowId: item.id,
          date: parsedDate || '',
          formattedDate,
          time: item.Time,
          course: item.Course,
          players: [item['Player 1'], item['Player 2'], item['Player 3'], item['Player 4']].filter(Boolean),
        };
      });
      setTeeTimes(formattedData);
    } catch (error) {
      console.error('Failed to fetch tee times:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeeTimes();
  }, []);

  const handleSignUp = async (id) => {
    if (!playerName.trim()) {
      setError('Please enter your name.');
      return;
    }

    const teeTime = teeTimes.find((t) => t.id === id);
    if (!teeTime) return;

    if (teeTime.players.includes(playerName)) {
      setError('You are already signed up.');
      return;
    }

    if (teeTime.players.length >= 4) {
      setError('This tee time is already full.');
      return;
    }

    const nextPlayerIndex = teeTime.players.length + 1;
    const playerField = `Player ${nextPlayerIndex}`;

    const query = `Course=${encodeURIComponent(teeTime.course)}&Date%20=${encodeURIComponent(teeTime.date)}&Time=${encodeURIComponent(teeTime.time)}`;

    try {
      const res = await fetch(`https://sheetdb.io/api/v1/4qv4g5mlcy4t5/search?${query}`);
      const rows = await res.json();

      if (rows.length > 0) {
        const rowId = rows[0].id;
        await fetch(`https://sheetdb.io/api/v1/4qv4g5mlcy4t5/id/${rowId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: { [playerField]: playerName } })
        });
        await fetchTeeTimes();
        setPlayerName('');
        setError('');
      }
    } catch (err) {
      console.error('Error updating player:', err);
      setError('Something went wrong.');
    }
  };

  const renderTeeTimeDetail = (id) => {
    const teeTime = teeTimes.find(t => t.id === id);
    if (!teeTime) return null;

    return (
      <div style={{ marginTop: '40px' }}>
        <button onClick={() => setTab('teeTimes')} style={{ marginBottom: '20px' }}>← Back</button>
        <h2>{teeTime.course}</h2>
        <p><strong>Date:</strong> {teeTime.formattedDate}</p>
        <p><strong>Time:</strong> {teeTime.time}</p>

        <input
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={() => handleSignUp(id)}>Playing</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
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

  const renderTabs = () => {
    if (tab === 'teeTimes') {
      return (
        <div>
          <h1>Tee Times</h1>
          {loading ? <p>Loading tee times...</p> : (
            teeTimes.length > 0 ? (
              teeTimes.map(({ id, formattedDate, time, course, players }) => (
                <div key={id} onClick={() => setTab(`teeTime-${id}`)} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                  <strong>{formattedDate}</strong>
                  <p>{time} — {course}</p>
                  <p>{players.length} / 4 Players</p>
                </div>
              ))
            ) : <p>No tee times scheduled.</p>
          )}
        </div>
      );
    }
    if (tab.startsWith('teeTime-')) {
      const id = parseInt(tab.split('-')[1]);
      return renderTeeTimeDetail(id);
    }
    if (tab === 'historical') {
      return <div><h2>Historical Results</h2><p>Coming soon... 🏌️‍♂️</p></div>;
    }
    if (tab === 'rules') {
      return (
        <div>
          <h2>Rules</h2>
          <ul>
            <li>Each tee time can have a max of 4 players.</li>
            <li>Only sign up if you're committed to playing.</li>
            <li>If you withdraw, notify the group 24 hours in advance.</li>
            <li>Injured withdrawals from a major forfeit the mug.</li>
          </ul>
        </div>
      );
    }
    return null;
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
    <div style={{ padding: '20px' }}>
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setTab('teeTimes')}>Tee Times</button>
        <button onClick={() => setTab('historical')}>Historical Results</button>
        <button onClick={() => setTab('rules')}>Rules</button>
      </nav>
      {renderTabs()}
    </div>
  );
}
