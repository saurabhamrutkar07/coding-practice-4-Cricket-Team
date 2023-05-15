const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { request } = require("http");

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

// Function for conversion of snakeCase to CamelCase

function convertToCamelCase(object) {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
}

// Initialize DB

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(1011, () => {
      console.log(`Server is running on http://localhost:1011/`);
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Return the list of all players in table cricket_team

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    
    `;
  const playerList = await db.all(getPlayerQuery);
  const camelCase = playerList.map((eachPlayer) =>
    convertToCamelCase(eachPlayer)
  );
  response.send(camelCase);
  
});

// POST method

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  // console.log(playerName, jerseyNumber, role);
  const addNewPlayerQuery = `
  INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES(
    
    '${playerName}',
    ${jerseyNumber},
    '${role}'
    );
    `;

  await db.run(addNewPlayerQuery);

  response.send("Player Added to Team");
});

// Returns Player Based on Id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerByIdQuery = `
  SELECT * 
  FROM cricket_team
  WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerByIdQuery);
  console.log(player);
  const op = convertToCamelCase(player);
  response.send(op);
});

// Put API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
  UPDATE cricket_team
  SET player_id = ${playerId},
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE player_id = ${playerId}; `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM cricket_team
  WHERE player_id = ${playerId};
  `;
  db.run(deletePlayerQuery);
  response.send("Player Removed");
});


module.exports = app;
