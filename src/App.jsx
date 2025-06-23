import React, { useEffect, useState } from 'react';
import { ref, get, set, onValue } from "firebase/database";
import { db } from "./firebase";

export default function GolfSite() {
  const [teeTimes, setTeeTimes] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('entrance');
  const [scorecardImages, setScorecardImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeeTimes = async () => {
    try {
      const res = await fetch('https://sheetdb.io/api/v1/4qv4g5mlcy4t5');
      const data = await res.json();

      const formattedData = data.map((item, index) => {
        let parsedDate = item['Date']?.trim();
        let formattedDate = parsedDate || 'Invalid Date';
        if (parsedDate) {
          const dateObj = new Date(parsedDate + 'T00:00:00');
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString(undefined, {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });
          }
        }
        return {
          id: index + 1,
          rowId: item.id,
          date: parsedDate || '',
          formattedDate,
          time: item.Time,
          course: item.Course,
          players: [],
        };
      });

      // Merge with Firebase player data
      const teeTimeRefs = ref(db, 'teeTimes');
      onValue(teeTimeRefs, (snapshot) => {
        const playerData = snapshot.val() || {};
        const merged = formattedData.map(t => {
          return {
            ...t,
            players: playerData[t.id] || [],
          };
        });
        setTeeTimes(merged);
        setLoading(false);
      });
    } catch (error) {
      console.error('Failed to fetch tee times:', error);
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

    const teeTime = teeTimes.find(t => t.id === id);
    if (!teeTime) return;

    if (teeTime.players.includes(playerName)) {
      setError('You are already signed up.');
      return;
    }

    if (teeTime.players.length >= 4) {
      setError('This tee time is already full.');
      return;
    }

    const updatedPlayers = [...teeTime.players, playerName];
    await set(ref(db, `teeTimes/${id}`), updatedPlayers);

    setError('');
    setPlayerName('');
    alert('Let it be written!');
  };

  const handleRemovePlayer = async (id, nameToRemove) => {
    const teeTime = teeTimes.find(t => t.id === id);
    if (!teeTime) return;

    const updatedPlayers = teeTime.players.filter(p => p !== nameToRemove);
    await set(ref(db, `teeTimes/${id}`), updatedPlayers);
  };

  const renderTeeTimeDetail = (id) => {
    const teeTime = teeTimes.find(t => t.id === id);
    if (!teeTime) return null;

    return (
      <div style={{ marginTop: '40px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
        <button onClick={() => setTab('teeTimes')} style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#3e513d', color: 'white', border: 'none', borderRadius: '6px' }}>← Back</button>
        <h2>{teeTime.course}</h2>
        <p><strong>Date:</strong> {teeTime.formattedDate}</p>
        <p><strong>Time:</strong> {teeTime.time}</p>

        <input
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ padding: '10px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button onClick={() => handleSignUp(id)} style={{ padding: '10px 20px', backgroundColor: '#3e513d', color: 'white', border: 'none', borderRadius: '6px' }}>Playing</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <h3>Participants:</h3>
          {teeTime.players.length > 0 ? (
            <ul>
              {teeTime.players.map((p, i) => (
                <li key={i}>
                  {p} <button onClick={() => handleRemovePlayer(id, p)} style={{ marginLeft: '10px', color: 'red' }}>Remove</button>
                </li>
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
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#2c3e50' }}>Tee Times</h1>
          {loading ? <p>Loading tee times...</p> : (
            teeTimes.length > 0 ? (
              teeTimes.map(({ id, formattedDate, time, course, players }) => (
                <div key={id} onClick={() => setTab(`teeTime-${id}`)} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#ffffff', transition: '0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', color: '#000' }}>
                  <strong style={{ fontSize: '16px' }}>{formattedDate}</strong>
                  <p style={{ margin: '5px 0' }}>{time} — {course}</p>
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
      return (
        <div style={{ color: '#2c3e50' }}>
          <h2>Historical Results</h2>
          <p>Coming soon... 🏌️‍♂️</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScorecardImages([...scorecardImages, ...Array.from(e.target.files)])}
            style={{ marginTop: '10px' }}
          />
        </div>
      );
    }
if (tab === 'rules') {
  return (
  <div style={{ color: '#2c3e50', fontFamily: "'Playfair Display', serif", padding: '20px' }}>
  <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Official Rules & Regulations – Quick Hitters Golf Association</h2>
  <ol style={{ lineHeight: '1.8' }}>
    <li>
      <strong>Rule Governance and Interpretation</strong><br />
      All play shall be governed by the current edition of the Rules of Golf as approved by the USGA, except where modified by the following Local Rules and League Policies.
    </li>
    <li>
      <strong>Local Rule – Lateral Hazards (Red Stakes)</strong><br />
      All penalty areas shall be treated as lateral water hazards (red stakes), regardless of actual course markings.
      <ul>
        <li>A ball entering a penalty area must be dropped within two club lengths from the point where the ball last crossed the margin of the hazard.</li>
        <li>The ball must not be dropped nearer the hole.</li>
        <li>Penalty: One stroke.</li>
      </ul>
    </li>
    <li>
      <strong>“Weekend Rules” Clause</strong><br />
      “Weekend Rules” are in effect, providing players with a relaxed but structured environment. Players are expected to maintain integrity, pace of play, and respect for the game while adhering to the following league-specific adaptations.
    </li>
    <li>
      <strong>Gimme Protocol</strong>
      <ul>
        <li>Gimmes may only be granted by an opponent.</li>
        <li>Teammates may not issue or accept gimmes on one another’s behalf.</li>
        <li>All gimmes are to be within reason (typically within 18 inches) and must be explicitly given verbally or by gesture.</li>
        <li>No implied gimmes are allowed.</li>
      </ul>
    </li>
    <li>
      <strong>Mug Drinking Privileges</strong>
      <ul>
        <li>The ceremonial mugs shall be transferred at the conclusion of each round to the designated winner(s).</li>
        <li>Injury withdrawals or other forfeitures result in immediate forfeiture of Mug privileges for that round.</li>
        <li>The Mug cannot be retained through default or absence.</li>
      </ul>
    </li>
    <li>
      <strong>Withdrawals</strong>
      <ul>
        <li>Any player who withdraws during a round, regardless of reason, forfeits all active standings and privileges, including but not limited to the Mug and match outcomes.</li>
        <li>Partial rounds do not qualify for scoring purposes.</li>
      </ul>
    </li>
    <li>
      <strong>Rule Changes and Amendments</strong>
      <ul>
        <li>Any proposed rule changes must be brought forward during an official committee meeting.</li>
        <li>A quorum (defined as at least 50% of active committee members) must be present.</li>
        <li>Each committee member holds one vote.</li>
        <li>In the event of a tie, the decision shall be resolved via a coin flip, executed by a neutral party or non-competing committee member.</li>
      </ul>
    </li>
  </ol>
</div>

  );
}

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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#eef2f5', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('teeTimes')} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #3e513d', backgroundColor: tab === 'teeTimes' ? '#3e513d' : 'white', color: tab === 'teeTimes' ? 'white' : '#3e513d' }}>Tee Times</button>
        <button onClick={() => setTab('majors')} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #3e513d', backgroundColor: tab === 'majors' ? '#3e513d' : 'white', color: tab === 'majors' ? 'white' : '#3e513d' }}>Major Results</button>
        <button onClick={() => setTab('rules')} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #3e513d', backgroundColor: tab === 'rules' ? '#3e513d' : 'white', color: tab === 'rules' ? 'white' : '#3e513d' }}>Official Rules</button>
      </nav>
      {renderTabs()}
    </div>
  );
}
