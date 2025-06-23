import React, { useEffect, useState } from 'react';
import { ref, get, set, onValue } from "firebase/database";
import { db } from "./firebase";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, listAll } from "firebase/storage";

const storage = getStorage();

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

  const fetchImages = async () => {
    const listRef = storageRef(storage, 'scorecards');
    const res = await listAll(listRef);
    const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
    setScorecardImages(urls);
  };

  useEffect(() => {
    fetchTeeTimes();
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageRef = storageRef(storage, `scorecards/${Date.now()}-${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    setScorecardImages(prev => [...prev, url]);
  };

  const renderTabs = () => {
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
        <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setTab('teeTimes')}>Tee Times</button>
          <button onClick={() => setTab('majors')}>Major Results</button>
          <button onClick={() => setTab('historical')}>Historical Results</button>
          <button onClick={() => setTab('rules')}>Official Rules</button>
        </nav>

        {tab === 'teeTimes' && (
          <div>
            <h2>Tee Times</h2>
            {loading ? <p>Loading tee times...</p> : (
              teeTimes.map(({ id, formattedDate, time, course, players }) => (
                <div key={id} style={{ background: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
                  <h3>{formattedDate} - {time}</h3>
                  <p><strong>{course}</strong></p>
                  <p>Players: {players.join(', ')}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'majors' && (
          <div>
            <h2>Major Results</h2>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' }}>{`
Major – June 15, 2025
Date      Course       Winner         Score
6/15      Broad Run GC  BOD Sr. + Mick  7 & 6

Major – May 24–26, 2025
Date      Course        Winner         Score
5/24      SHGC          BOD Sr. + Mark 3 & 2
5/26      SHGC          BOD Sr. + Mark 4 & 3

Major – August 31 to October 26
Date      Course        Winner           Score
8/31      SHGC          BOD Sr. + Mark   4 & 3
10/6      GC @ GM       BOD Jr. + Mick   3 & 2
10/26     JVille        BOD Jr. + Mick   5 & 4

Major – July 4 to July 20
Date      Course        Winner             Score
7/4       SHGC          Mark + Mick        1 Up
7/7       SHGC          BOD Jr. + BOD Sr.  2 & 1
7/20      SHGC          BOD Jr. + BOD Sr.  1 Up

Major – June 15–16
Date      Course        Winner         Score
6/15      Shore Gate    BOD Sr. + Mick 6 & 5
6/16      SHGC          BOD Sr. + Mick 4 & 3
`}</pre>
          </div>
        )}

        {tab === 'historical' && (
          <div>
            <h2>Historical Scorecards</h2>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ marginBottom: '20px' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {scorecardImages.map((url, idx) => (
                <img key={idx} src={url} alt={`scorecard-${idx}`} style={{ maxWidth: '300px', borderRadius: '8px' }} />
              ))}
            </div>
          </div>
        )}

        {tab === 'rules' && (
          <div style={{ color: '#2c3e50', fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '20px', textDecoration: 'underline' }}>
              Official Rules & Regulations – Quick Hitters Golf Association
            </h2>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>Rule Governance and Interpretation</strong><br />All play shall be governed by the current edition of the Rules of Golf as approved by the USGA, except where modified by the following Local Rules and League Policies.</li>
              <li><strong>Local Rule – Lateral Hazards (Red Stakes)</strong><br />
                All penalty areas shall be treated as lateral water hazards (red stakes), regardless of actual course markings.
                <ul>
                  <li>A ball entering a penalty area must be dropped within two club lengths from the point where the ball last crossed the margin of the hazard.</li>
                  <li>The ball must not be dropped nearer the hole.</li>
                  <li>Penalty: One stroke.</li>
                </ul>
              </li>
              <li><strong>“Weekend Rules” Clause</strong><br />“Weekend Rules” are in effect, providing players with a relaxed but structured environment. Players are expected to maintain integrity, pace of play, and respect for the game while adhering to the following league-specific adaptations.</li>
              <li><strong>Gimme Protocol</strong>
                <ul>
                  <li>Gimmes may only be granted by an opponent.</li>
                  <li>Teammates may not issue or accept gimmes on one another’s behalf.</li>
                  <li>All gimmes are to be within reason (typically within 18 inches) and must be explicitly given verbally or by gesture.</li>
                  <li>No implied gimmes are allowed.</li>
                </ul>
              </li>
              <li><strong>Mug Drinking Privileges</strong>
                <ul>
                  <li>The ceremonial mugs shall be transferred at the conclusion of each round to the designated winner(s).</li>
                  <li>Injury withdrawals or other forfeitures result in immediate forfeiture of Mug privileges for that round.</li>
                  <li>The Mug cannot be retained through default or absence.</li>
                </ul>
              </li>
              <li><strong>Withdrawals</strong>
                <ul>
                  <li>Any player who withdraws during a round, regardless of reason, forfeits all active standings and privileges, including but not limited to the Mug and match outcomes.</li>
                  <li>Partial rounds do not qualify for scoring purposes.</li>
                </ul>
              </li>
              <li><strong>Rule Changes and Amendments</strong>
                <ul>
                  <li>Any proposed rule changes must be brought forward during an official committee meeting.</li>
                  <li>A quorum (defined as at least 50% of active committee members) must be present.</li>
                  <li>Each committee member holds one vote.</li>
                  <li>In the event of a tie, the decision shall be resolved via a coin flip, executed by a neutral party or non-competing committee member.</li>
                </ul>
              </li>
            </ol>
          </div>
        )}
      </div>
    );
  };

  return <>{renderTabs()}</>;
}
