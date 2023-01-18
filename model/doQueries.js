const syncSql = require("mysql");

const config = syncSql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "1998",
    database: "tennisdb",
    port: "3306",
});
config.connect(function (err) {
    if (err) throw err;
    console.log("Connected to database as " + config.threadId);
});
async function login(userName, password) {
    let loginQuery =
        "SELECT user_name,user_id,favorite_player FROM user WHERE user_name = '" +
        userName +
        "' and password = '" +
        password +
        "'";
    try {
        const util = require("util");
        const query = util.promisify(config.query).bind(config);
        let result = await query(loginQuery);
        if (result[0] === undefined) return null;
        let result_username = result[0].user_name;
        if (userName === result_username) {
            return result[0];
        }
        return null;
    } catch {
        console.log("catch");
        return null;
    }
}

async function signUp(
    user_id,
    userName,
    password,
    country,
    age,
    favorite_player,
    phone_number
) {
    let loginQuery = "SELECT user_name, user_id FROM user WHERE user_name = ?";
    try {
        const util = require("util");
        const query = util.promisify(config.query).bind(config);
        let result = await query(loginQuery, [userName]);
        if (result.length > 0 && result[0].user_name === userName) {
            return "Username already is use!";
        }
        let signUpQuery =
            "INSERT INTO user(user_id,user_name, password, country, age, favorite_player, phone_number) VALUES (?,?,?,?,?,?,?)";
        await config.query(signUpQuery, [
            user_id,
            userName,
            password,
            country,
            age,
            favorite_player,
            phone_number,
        ]);
        return "You are signed up!";
    } catch (error) {
        return false;
    }
}

//Return the games
async function getGames(player1, player2) {
    let getGames =
        "SELECT * From Matches WHERE (player_1 = '" +
        player1 +
        "' AND player_2 = '" +
        player2 +
        "') OR (player_1 = '" +
        player2 +
        "' AND player_2 = '" +
        player1 +
        "') LIMIT 10";
    try {
        const util = require("util");
        const query = util.promisify(config.query).bind(config);
        let match_id;
        let winner_id;
        let result = await query(getGames, [
            match_id,
            player1,
            player2,
            winner_id,
        ]);
        var table = [];
        if (result === undefined) return false;
        Object.keys(result).forEach(function (key) {
            table.push({
                match_id: result[key].match_id,
                player1: result[key].player_1,
                player2: result[key].player_2,
                winner_id: result[key].winner_id,
            });
        });
        return table;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function getComments(gameID) {
    let getGames = "SELECT user_id,comment From Comments WHERE match_id = ?";
    var table = [];
    const util = require("util");
    const query = util.promisify(config.query).bind(config);
    var result = await query(getGames, [gameID]);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

async function insertComment(commentID, comment, user_id, match_id) {
    let insertComment =
        "INSERT INTO comments(comment_id,comment,user_id,match_id) VALUES (?,?,?,?)";
    try {
        const util = require("util");
        const query = util.promisify(config.query).bind(config);
        var result = await query(insertComment, [
            commentID,
            comment,
            user_id,
            match_id,
        ]);
        // config.query(insertComment);
        return "Succeeded";
    } catch (error) {
        console.log(error);
        if (error.code === "ER_DUP_ENTRY") {
            return "not succeed";
        }
    }
}

//need to check how to write
async function getFavoritePlayer(player_id) {
    let getPlayerName =
        "SELECT first_name,last_name FROM Player where player_id =?";
    const util = require("util");
    const query = util.promisify(config.query).bind(config);
    var result = await query(getPlayerName, [player_id]);
    if (result[0] === undefined) return false;
    return result;
}

//Return the games
async function getCommonUsers(first, last, height, hand, nationality) {
    let getCommonUsers =
        "SELECT user_id, phone_number FROM user WHERE favorite_player in (SELECT player_id FROM Player WHERE first_name = ? AND last_name = ? AND hight = ? AND hand = ? AND nationality = ?);";
    const util = require("util");
    const query = util.promisify(config.query).bind(config);
    var table = [];
    var result = await query(getCommonUsers, [
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

async function getTopPlayers(playerID) {
    let getTopPlayer =
        "SELECT u.user_id, u.phone_number FROM User u JOIN ranking r1 ON u.favorite_player = r1.player_id JOIN ranking r2 ON r1.rank < r2.rank AND r2.player_id = ?;";
    const util = require("util");
    const query = util.promisify(config.query).bind(config);
    var table = [];
    var result = await query(getTopPlayer, [playerID]);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

async function getTopCountries() {
    let getTopCountries =
        "SELECT player.nationality, COUNT(matches.winner_id) AS wins FROM matches JOIN player ON player.player_id = matches.winner_id GROUP BY player.nationality ORDER BY wins DESC LIMIT 10;";
    const util = require("util");
    const query = util.promisify(config.query).bind(config);
    var table = [];
    var result = await query(getTopCountries);
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
