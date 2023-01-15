const { assert } = require("console");
const express = require("express");
const path = require("path");
const doQueries = require("../model/doQueries1.js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();

const app = express();
app.listen(3000);

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "login.html"));
});

app.post("/login", (req, res) => {
    var userName = req.body.Username;
    var password = req.body.Password;

    (async () => {
        let isLoggedIn = await doQueries.login(userName, password);
        console.log(isLoggedIn);
        if (isLoggedIn != null) {
            res.cookie("username", isLoggedIn.user_name, {
                maxAge: 900000,
                httpOnly: true,
            });
            res.cookie("userID", isLoggedIn.user_id, {
                maxAge: 900000,
                httpOnly: true,
            });
            res.cookie("playerID", isLoggedIn.Favorite_player, {
                maxAge: 900000,
                httpOnly: true,
            });
            res.sendFile(path.join(__dirname, "../public", "game.html"));
        } else {
            res.write("Username or password are incorrect");
            res.end();
        }
    })();
});

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.post("/signUp", (req, res) => {
    let user_id = randomInteger(1, 100000);
    let userName = req.body.Username;
    let password = req.body.Password;
    let confirm = req.body.ConfirmPassword;
    let country = req.body.Country;
    let age = req.body.Age;
    let favorite = req.body.FavoritePlayer;
    let phone = req.body.PhoneNumber;
    if (password !== confirm) {
        res.write("Passwords doesn't match! Please try again.");
        res.end();
    }

    let message = doQueries
        .signUp(user_id, userName, password, country, age, favorite, phone)
        .then((message) => {
            console.log(message);
            if (message === "Username already is use!") {
                res.write(writeInHtml(message));
                res.end();
            }
            if (message === "You are signed up!") {
                //res.write("You are signed up! you can now return to the login screen.")
                console.log("yes");
                res.redirect("/login.html");
            }
        })
        .catch((err) => {
            console.log(err);
            res.end("Error Occured");
        });
});

app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "game.html"));
});

const tableify = require("html-tableify");
function writeInHtml(data) {
    return tableify(data);
}

app.post("/getGames", (req, res) => {
    let player1 = req.body.Player1;
    let player2 = req.body.Player2;
    (async () => {
        let games = await doQueries.getGames(player1, player2);

        if (games === false) {
            let result = writeInHtml("We have no information for this players");
            res.write(result);
            res.end();
        } else {
            createTable(games);
            res.end();
        }
    })();
});

function createTable(data) {
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
    let headRow = document.createElement("tr");
    let headCells = ["id", "player1", "player2", "winner"];
    headCells.forEach((cell) => {
        let th = document.createElement("th");
        th.innerText = cell;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    data.forEach((game) => {
        let row = document.createElement("tr");
        let cells = [game.id, game.player1, game.player2, game.winner];
        cells.forEach((cell) => {
            let td = document.createElement("td");
            td.innerText = cell;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    let result = document.getElementById("result");
    result.appendChild(table);
}

app.post("/getComments", (req, res) => {
    let gameID = req.body.GameID;
    let commends = doQueries.getComments(gameID);
    if (commends === false) {
        let result = writeInHtml("We have no information for this game");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(commends);
        res.write(result);
        res.end();
    }
});

app.post("/insertComment", (req, res) => {
    let variant_id = req.body.variant_id;
    let variant_name = req.body.variant_name;
    result = doQueries.insertVariant(variant_id, variant_name);
    let text = writeInHtml(result);
    res.write(text);
    res.end();
});

app.post("/getFavoritePlayer", (req, res) => {
    let favorite = doQueries.getFavoritePlayer();
    if (favorite === false) {
        let result = writeInHtml("We have no information for this game");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(favorite);
        res.write(result);
        res.end();
    }
});

app.post("/getCommonUsers", (req, res) => {
    let first = req.body.PlayerFirstNameCommonUsers;
    let last = req.body.PlayerLastNameCommonUsers;

    let height = req.body.Hieght;

    let nationality = req.body.NationalityCommon;

    let commends = doQueries.getCommonUsers(first, last, height, nationality);
    if (commends === false) {
        let result = writeInHtml("We have no information");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(commends);
        res.write(result);
        res.end();
    }
});

app.post("/getTopPlayers", (req, res) => {
    let getTopPlayers = doQueries.getTopPlayers(getCookie("playerID"));
    if (getTopPlayers === false) {
        let result = writeInHtml("We have no information");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(getTopPlayers);
        res.write(result);
        res.end();
    }
});

app.post("/getTopCountries", (req, res) => {
    let favorite = doQueries.getTopCountries();
    if (favorite === false) {
        let result = writeInHtml("We have no information");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(favorite);
        res.write(result);
        res.end();
    }
});

function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
}

function writeInHtml(text) {
    result =
        `<p style="font-size:30px; font-family:'verdana';">` + text + `</p>`;
    return result;
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
