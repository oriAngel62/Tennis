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
global.globfavorite_player;
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "login.html"));
});

app.post("/login", (req, res) => {
    var userName = req.body.Username;
    var password = req.body.Password;

    (async () => {
        console.log("userName in login");
        console.log(userName);
        console.log("password in login");
        console.log(password);
        let isLoggedIn = await doQueries.login(userName, password);
        // favorite_player = isLoggedIn.favorite_player;
        console.log("isLoggedIn");
        console.log(isLoggedIn);
        if (isLoggedIn != null) {
            global.globauser_id = isLoggedIn.user_id;
            console.log("globalfavorite_player before if");
            console.log(global.globfavorite_player);
            if (global.globfavorite_player === undefined) {
                global.globfavorite_player = isLoggedIn.favorite_player;
            }

            console.log("globalfavorite_player after if");
            console.log(global.globfavorite_player);
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
function checkingMissingValues(val, res) {
    const values = Object.values(val);
    const isMissingValue = values.some(
        (value) => typeof value === "undefined" || value.length === 0
    );
    if (isMissingValue) {
        res.write("Missing Values");
        res.end();
        return true;
    }
    return false;
}

app.post("/signUp", (req, res) => {
    let user_id = randomInteger(1, 100000);
    let userName = req.body.Username;
    let password = req.body.Password;
    let confirm = req.body.ConfirmPassword;
    let country = req.body.Country;
    let age = req.body.Age;
    if (checkingMissingValues(req.body, res)) {
        return;
    }
    global.globfavorite_player = req.body.FavoritePlayer;
    let phone = req.body.PhoneNumber;
    if (password !== confirm) {
        res.write("Passwords doesn't match! Please try again.");
        res.end();
    }

    let message = doQueries
        .signUp(
            user_id,
            userName,
            password,
            country,
            age,
            global.globfavorite_player,
            phone
        )
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
    if (checkingMissingValues(req.body, res)) {
        return;
    }
    (async () => {
        let games = await doQueries.getGames(player1, player2);

        if (games === false) {
            let result = writeInHtml("We have no information for this players");
            res.write(result);
            res.end();
        } else {
            try {
                const html = tableTemplateGames({ games: games });
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

const tableTemplateGames = handlebars.compile(`
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

const tableTemplateCountries = handlebars.compile(`
<table>
    <thead>
        <tr>
            <th>Country</th>
            <th>Wins</th>
        </tr>
    </thead>
    <tbody>
        {{#each countries}}
            <tr>
                <td>{{this.[0]}}</td>
                <td>{{this.[1]}}</td>
            </tr>
        {{/each}}
    </tbody>
</table>
`);

const tableTemplateUsers = handlebars.compile(`
<table>
    <thead>
        <tr>
            <th>User Id</th>
            <th>Phone number</th>
        </tr>
    </thead>
    <tbody>
        {{#each users}}
            <tr>
                <td>{{this.[0]}}</td>
                <td>{{this.[1]}}</td>
            </tr>
        {{/each}}
    </tbody>
</table>
`);

const tableTemplateComments = handlebars.compile(`
<table>
    <thead>
        <tr>
            <th>User Id</th>
            <th>Comment</th>
        </tr>
    </thead>
    <tbody>
        {{#each comments}}
            <tr>
                <td>{{this.[0]}}</td>
                <td>{{this.[1]}}</td>
            </tr>
        {{/each}}
    </tbody>
</table>
`);

app.post("/getComments", async (req, res) => {
    let gameID = req.body.GameID;
    if (checkingMissingValues(req.body, res)) {
        return;
    }
    let comments = await doQueries.getComments(gameID);
    if (comments === false) {
        let result = writeInHtml("We have no information for this game");
        res.write(result);
        res.end();
    } else {
        try {
            const html = tableTemplateComments({ comments: comments });
            res.write(writeInHtml(html));
            setTimeout(() => {
                res.end();
            }, 2000);
        } catch (error) {
            console.log(error);
            res.end("An error occurred while creating the table");
        }
    }
});


app.post("/insertComment", async (req, res) => {
    let MatchID = req.body.MatchID;
    let Comment = req.body.Comment;
    if (checkingMissingValues(req.body, res)) {
        return;
    }
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
        .getFavoritePlayer(global.globfavorite_player)
        .then((favorite) => {
            if (favorite === false) {
                let result = writeInHtml(
                    "We have no information for this player"
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
    if (checkingMissingValues(req.body, res)) {
        return;
    }
    doQueries
        .getCommonUsers(first, last, height, hand, nationality)
        .then((users) => {
            if (users === false) {
                let result = writeInHtml(
                    "We have no information for the provided player's information."
                );
                res.write(result);
                res.end();
            } else {
                try {
                    console.log("Users:");
                    console.log(users);
                    const html = tableTemplateUsers({ users: users });
                    res.write(writeInHtml(html));
                    setTimeout(() => {
                        res.end();
                    }, 2000);
                } catch (error) {
                    console.log(error);
                    res.end("An error occurred while creating the table");
                }
            }
        })
        .catch((err) => {
            console.log(err);
            res.write("An error occurred while getting the common users");
            res.end();
        });
});

app.post("/getTopPlayers", (req, res) => {
    doQueries
        .getTopPlayers(global.globfavorite_player)
        .then((users) => {
            if (users === false) {
                let result = writeInHtml("We have no information");
                res.write(result);
                res.end();
            } else {
                try {
                    console.log("users:");
                    console.log(users);
                    const html = tableTemplateUsers({ users: users });
                    res.write(writeInHtml(html));
                    setTimeout(() => {
                        res.end();
                    }, 2000);
                } catch (error) {
                    console.log(error);
                    res.end("An error occurred while creating the table");
                }
            }
        })
        .catch((err) => {
            console.log(err);
            res.write("An error occurred while getting the top countries");
            res.end();
        });
});

app.post("/getTopCountries", (req, res) => {
    doQueries
        .getTopCountries()
        .then((countries) => {
            if (countries === false) {
                let result = writeInHtml("We have no information");
                res.write(result);
                res.end();
            } else {
                try {
                    console.log("countries:");
                    console.log(countries);
                    const html = tableTemplateCountries({
                        countries: countries,
                    });
                    res.write(writeInHtml(html));
                    setTimeout(() => {
                        res.end();
                    }, 2000);
                } catch (error) {
                    console.log(error);
                    res.end("An error occurred while creating the table");
                }
            }
        })
        .catch((err) => {
            console.log(err);
            res.write("An error occurred while getting the top countries");
            res.end();
        });
});

function writeInHtml(text) {
    result =
        `<p style="font-size:30px; font-family:'verdana';">` + text + `</p>`;
    return result;
}

