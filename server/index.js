import express from 'express';
import cors from 'cors';
import pgPromise from 'pg-promise';

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Create a new pg-promise instance
const pgp = pgPromise();

// Create a new database connection
const db = pgp(
 'postgres://admin:vN4ExMDblHTpKe0Hgn22Zz1DFLGIW3aV@dpg-chn1vne4dad21k2un7gg-a.oregon-postgres.render.com/songs_fyk7'
);

// Create the songs table
const createSongsTableQuery = `
  CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title TEXT,
    scale TEXT,
    chords TEXT,
    genres TEXT[],
    lyrics TEXT
  )
`;

// Execute the table creation query
async function createTable() {
  try {
    await db.none(createSongsTableQuery);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createTable();

// Define API endpoints

// Get all songs
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await db.any('SELECT * FROM songs');
    res.json(songs);
  } catch (error) {
    console.error('Error retrieving songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new song
app.post('/api/songs', async (req, res) => {
  try {
    const { title, lyrics, scale, chords, genres } = req.body;
    await db.none(
      'INSERT INTO songs (title, scale, chords, genres, lyrics) VALUES ($1, $2, $3, $4, $5)',
      [title, scale, chords, genres, lyrics]
    );
    res.sendStatus(201);
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

