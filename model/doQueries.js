const syncSql = require("mysql");

const config = syncSql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "1998",
    database: "tennisdb",
});
config.connect(function (err) {
    if (err) throw err;
    console.log("Connected to database as " + config.threadId);
});

async function login(userName, password) {
    let loginQuery =
        "SELECT user_name FROM user WHERE user_name = '" + userName +"' and password = '" + password+"'";
    try {
        const util = require('util');
        const query = util.promisify(config.query).bind(config);
        let result = await query(loginQuery);
        if (result[0] === undefined) return null;
        let result_username = result[0].user_name;
        if (userName === result_username){
            return result[0];
        } 
        return null;
    } catch {
        console.log("catch");
        return null;
    }
}


function signUp(
    userName,
    password,
    country,
    age,
    favorite_player,
    phone_number
) {
    let checkUserExist = `SELECT user_name FROM user WHERE user_name = ${userName}`;
    config.query(checkUserExist, function (err, results, fields) {
        if (err) throw err;
        if (results.length > 0) return "Username already is use!";
        let signUpQuery =
            "INSERT INTO user(user_name, password, country, age, favorite_player, phone_number)" +
            "VALUES (" +
            userName +
            "," +
            password +
            "," +
            country +
            "," +
            age +
            "," +
            favorite_player +
            "," +
            phone_number +
            ")";
        try {
            config.query(signUpQuery);
            return "You are signed up!";
        } catch (error) {
            return false;
        }
    });
}

//Return the games
async function getGames(player1, player2) {
    let getGames =
    "SELECT * From Matches WHERE (player_1 = '" + player1 + "' AND player_2 = '" + player2 + "') OR (player_1 = '" + player2 + "' AND player_2 = '" + player1 + "') LIMIT 10";
    try {
        console.log("in get games");
        const util = require('util');
        const query = util.promisify(config.query).bind(config);
        let match_id;
        let winner_id;
        let result = await query(getGames, [match_id, player1, player2, winner_id]);
        console.log("result");
        console.log(result);
        var table = [];
        if (result === undefined) return false;
        console.log("before for each");
        Object.keys(result).forEach(function (key) {
            table.push({match_id: result[key].match_id, player1: result[key].player_1, player2: result[key].player_2, winner_id: result[key].winner_id});
        });
        console.log("table:");
        console.log(table);
        return table;
    } catch (err) {
        console.log(err);
        return null;
    }
    
    
}

function getComments(gameID) {
    let getGames = "SELECT user_id,comment From Comments WHERE match_id = ?";
    var table = [];
    var result = config.query(getGames, [gameID]);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

function insertComment(userName, userId, comment) {
    let insertComment =
        "INSERT INTO Comment(match_id, user_id, comment)" +
        "VALUES (" +
        userName +
        "," +
        userId +
        "," +
        comment +
        ")";
    try {
        config.query(insertComment);
        return "Succeeded";
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return "not succeed";
        }
    }
}

//need to check how to write
function getFavoritePlayer(username, favorite) {
    let playerName = "SELECT player_name FROM User where user_name =?";
    var table = [];
    var result = config.query(getGames, [username]);
    if (result[0] === undefined) return false;

    let favoritrPlayer =
        "SELECT * FROM player where player_name in (SELECT player_name FROM User where user_name =?)";
    var result2 = config.query(getGames, [playerName]);

    return result2;
}

//Return the games
function getCommonUsers(first, last, height, hand, nationality) {
    let getCommonUsers =
        "SELECT user_id, phone_number FROM User WHERE player_id = (SELECT player_id FROM Player WHERE first_name = ? AND last_name = ? AND hight = ? AND nationallity = ? )";

    var table = [];
    var result = config.query(getCommonUsers, [
        first,
        last,
        height,
        hand,
        nationality,
    ]);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

function getTopPlayers(playerID) {
    let getTopPlayer =
        "SELECT user_id, phone_number FROM User WHERE player_id = (SELECT player_id FROM Player WHERE first_name = ? AND last_name = ? AND hight = ? AND nationallity = ? )";

    var table = [];
    var result = config.query(getTopPlayer);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

function getTopCountries() {
    let getTopCountries =
        "SELECT player.country, COUNT(matches.winner_id) AS wins FROM matches JOIN player ON player.player_id = matches.winner_id GROUP BY player.country ORDER BY wins DESC LIMIT 10;";
    var table = [];
    var result = config.query(getTopCountries);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

module.exports.login = login;
module.exports.signUp = signUp;

module.exports.getGames = getGames;
module.exports.getComments = getComments;
module.exports.insertComment = insertComment;

module.exports.getFavoritePlayer = getFavoritePlayer;
module.exports.getCommonUsers = getCommonUsers;
module.exports.getTopPlayers = getTopPlayers;
module.exports.getTopCountries = getTopCountries;
