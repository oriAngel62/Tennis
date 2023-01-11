const syncSql = require("sync-mysql");

const config = new syncSql({
    host: "localhost",
    user: "root",
    password: "sweetcandyA1!",
    database: "covid_db",
});

function login(userName, password) {
    let loginQuery =
        "SELECT user_name FROM user WHERE user_name =? and password =?";
    try {
        var result = config.query(loginQuery, [userName, password]);
    } catch {
        return null;
    }
    if (result[0] === undefined) return null;
    let result_username = result[0].username;
    if (userName === result_username) return result[0];
    return null;
}

function signUp(
    userName,
    password,
    country,
    age,
    favorite_player,
    phone_number
) {
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
    } catch (error) {
        // check if user already in use
    
        if (error.code === "ER_DUP_ENTRY") return "Username already is use!";
        return false;
    }
    return "You are signed up!";
}

//input user name output user id


//Return the games
function getGames(player1, player2) {
    let getGames =
        "SELECT * From Matches WHERE (player_1 = ? player1 AND player_2 = ?) OR (player_1 = ? AND player_2 = ?) LIMIT 10";

    var table = [];
    var result = config.query(getGames, [player1, player2]);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
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



function getTopCountries(first, last, height, hand, nationality) {
    let getTopCountries =
        "SELECT user_id, phone_number FROM User WHERE player_id = (SELECT player_id FROM Player WHERE first_name = ? AND last_name = ? AND hight = ? AND nationallity = ? )";

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


