import React, { useEffect, useState } from 'react';
import { ref, get, set } from "firebase/database";
import { db } from "./firebase";

export default function GolfSite() {
  const [teeTimes, setTeeTimes] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('entrance');
  const [scorecardImages, setScorecardImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeeTimes = async () => {
      try {
        setLoading(true);
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
    const updatedTeeTimes = teeTimes.map(t =>
      t.id === id ? { ...t, players: updatedPlayers } : t
    );

    setTeeTimes(updatedTeeTimes);
    setPlayerName('');
    setError('');
    alert('Let it be written!');
  };

  const handleRemovePlayer = (id, nameToRemove) => {
    const updatedTeeTimes = teeTimes.map(t => {
      if (t.id !== id) return t;
      return { ...t, players: t.players.filter(p => p !== nameToRemove) };
    });

    setTeeTimes(updatedTeeTimes);
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
        <div style={{ color: '#2c3e50' }}>
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
