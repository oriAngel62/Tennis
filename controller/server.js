const { assert } = require("console");
const express = require("express");
const path = require("path");
const doQueries = require("../model/doQueries.js");
const jsdom = require("jsdom");
const { JSDOM } = require("jsdom");
const dom = new JSDOM();
const { document } = dom.window;
const handlebars = require("handlebars");
let favorite_player;

const app = express();
app.listen(3000);

app.use(
    express.urlencoded({
        extended: true,
    })
);
global.globauser_id;
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "login.html"));
});

app.post("/login", (req, res) => {
    var userName = req.body.Username;
    var password = req.body.Password;

    (async () => {
        let isLoggedIn = await doQueries.login(userName, password);
        favorite_player = isLoggedIn.favorite_player;
        console.log("favorite_player");
        console.log(favorite_player);
        if (isLoggedIn != null) {
            global.globauser_id = isLoggedIn.user_id;
            res.cookie("username", isLoggedIn.user_name, {
                maxAge: 900000,
                httpOnly: true,
            });
            res.cookie("userID", isLoggedIn.user_id, {
                maxAge: 900000,
                httpOnly: true,
            });
            res.cookie("playerID", isLoggedIn.favorite_player, {
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
            try {
                const html = tableTemplate({ games: games });
                res.write(writeInHtml(html));
                // res.send(html);
                setTimeout(() => {
                    res.end();
                }, 2000);
            } catch (error) {
                console.log(error);
                res.end("An error occurred while creating the table");
            }
        }
    })();
});

const tableTemplate = handlebars.compile(`
<table>
    <thead>
        <tr>
            <th>id</th>
            <th>player1</th>
            <th>player2</th>
            <th>winner</th>
        </tr>
    </thead>
    <tbody>
        {{#each games}}
        <tr>
            <td>{{match_id}}</td>
            <td>{{player1}}</td>
            <td>{{player2}}</td>
            <td>{{winner_id}}</td>
        </tr>
        {{/each}}
    </tbody>
</table>
`);

app.post("/getComments", async (req, res) => {
    let gameID = req.body.GameID;
    let commends = await doQueries.getComments(gameID);
    console.log(commends);
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

app.post("/insertComment", async (req, res) => {
    let MatchID = req.body.MatchID;
    let Comment = req.body.Comment;
    console.log(global.globauser_id);
    let result = await doQueries.insertComment(
        randomInteger(1, 100000),
        Comment,
        global.globauser_id,
        MatchID
    );
    let text = writeInHtml(result);
    res.write(text);
    res.end();
});

app.post("/getFavoritePlayer", (req, res) => {
    doQueries
        .getFavoritePlayer(favorite_player)
        .then((favorite) => {
            if (favorite === false) {
                let result = writeInHtml(
                    "We have no information for this user"
                );
                res.write(result);
                res.end();
            } else {
                var my_favorite_player =
                    favorite[0].first_name + " " + favorite[0].last_name;
                let result = writeInHtml(my_favorite_player);
                res.write(result);
                res.end();
            }
        })
        .catch((err) => {
            console.log(err);
            res.write("An error occurred while getting the favorite player");
            res.end();
        });
});

app.post("/getCommonUsers", (req, res) => {
    let first = req.body.PlayerFirstNameCommonUsers;
    let last = req.body.PlayerLastNameCommonUsers;
    let height = req.body.Height;
    let hand = req.body.Hand;
    let nationality = req.body.NationalityCommonUser;
    doQueries
        .getCommonUsers(first, last, height, hand, nationality)
        .then((commends) => {
            if (commends === false) {
                let result = writeInHtml("We have no information");
                res.write(result);
                res.end();
            } else {
                console.log(commends);
                let result = writeInHtml(commends);
                res.write(result);
                res.end();
            }
        })
        .catch((err) => {
            console.log(err);
            res.write("An error occurred while getting the favorite player");
            res.end();
        });
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
