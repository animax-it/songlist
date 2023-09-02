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
 'postgres://admin:vN4ExMDblHTpKe0Hgn22Zz1DFLGIW3aV@dpg-chn1vne4dad21k2un7gg-a.oregon-postgres.render.com/songs_fyk7?ssl=true'
);

// Create the songs table
const createSongsTableQuery = `
  CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title TEXT,
    scale TEXT,
    chords TEXT,
    genres TEXT[],
    lyrics TEXT,
    transposed_chords TEXT
  )
`;

const updateQuery = `ALTER TABLE songs
ADD COLUMN  IF NOT EXISTS transposed_chords TEXT;`

// Execute the table creation query
async function createTable() {
  try {
    await db.none(createSongsTableQuery);
    await db.none(updateQuery);
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
    const { title, lyrics, scale, chords, genres, transposed_chords } = req.body;
    await db.none(
      'INSERT INTO songs (title, scale, chords, genres, lyrics, transposed_chords) VALUES ($1, $2, $3, $4, $5, $6)',
      [title, scale, chords, genres, lyrics, transposed_chords]
    );
    res.sendStatus(201);
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing song by ID
app.put('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, lyrics, scale, chords, genres, transposed_chords } = req.body;
    
    // Check if the song with the given ID exists
    const existingSong = await db.oneOrNone('SELECT * FROM songs WHERE id = $1', [id]);
    if (!existingSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Update the song with the new data
    await db.none(
      'UPDATE songs SET title = $2, scale = $3, chords = $4, genres = $5, lyrics = $6, transposed_chords = $7 WHERE id = $1',
      [id, title, scale, chords, genres, lyrics, transposed_chords]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete a song by ID
app.delete('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.none('DELETE FROM songs WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

