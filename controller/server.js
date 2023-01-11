const express = require("express");
const path = require("path");
const doQueries = require("../model/doQueries.js");

const app = express();

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

    var isLoggedIn = doQueries.login(userName, password);
    if (isLoggedIn) {

        res.cookie("username", userName, {maxAge: 900000, httpOnly: true});
        res.sendFile(path.join(__dirname, "../public", "game.html"));
    } else {
        res.write("Username or password are incorrect");
        res.end();
    }
});

app.post("/signUp", (req, res) => {
    let userName = "'" + req.body.Username + "'";
    let password = "'" + req.body.Password + "'";
    let confirm = "'" + req.body.ConfirmPassword + "'";
    let country = "'" + req.body.Country  + "'";;
    let age = "'" + req.body.Age + "'";
    let favorite = "'" + req.body.FavoritePlayer + "'";
    let phone = "'" + req.body.PhoneNumber + "'";

    if (password !== confirm) {
        res.write("Passwords doesn't match! Please try again.");
        res.end();
    }

    let message = doQueries.signUp(userName, password, country,age,favorite, phone );
    if (message === "Username already is use!") {
        res.write(writeInHtml(message));
        res.end();
    }
    if (message === "You are signed up!") {
        //res.write("You are signed up! you can now return to the login screen.")
        res.sendFile(path.join(__dirname, "../public", "login.html"));
    }
});

app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "game.html"));
});

app.post("/getGames", (req, res) => {
    let player1 = req.body.Player1;
    let player2 = req.body.Player2;
    let games = doQueries.getGames(player1, player2);
    if (games === false) {
        let result = writeInHtml("We have no information for this players");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(games);
        res.write(result);
        res.end();
    }
});

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




app.post("/getTotalDeaths", (req, res) => {
    let country = req.body.Country1;
    let totalDeath = doQueries.getTotalDeathsQuery(country);
    if (totalDeath === false) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "Total deaths in " +
                country +
                " so far is: " +
                totalDeath[0][0] +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/getTodayDeaths", (req, res) => {
    let country = req.body.Country2;
    let totalDeath = doQueries.getNumberDeathsLatestDayQuery(country);
    if (totalDeath === false) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "Total deaths in " +
                country +
                " today is: " +
                totalDeath[0][0] +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/getAverage", (req, res) => {
    let country = req.body.Country3;
    let totalDeath = doQueries.avgNewDeathsQuery(country);
    if (totalDeath === false) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "Average daily deaths in " +
                country +
                " is: " +
                totalDeath[0][1] +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/getTotalInfected", (req, res) => {
    let country = req.body.Country1;
    let totalInfected =
        doQueries.sumDailyCasesQueryByLocation(country).total_daily_cases;
    if (totalInfected === undefined) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "Total COVID infected in " +
                country +
                " is: " +
                totalInfected +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/getInfectedPerVariant", (req, res) => {
    let country = req.body.Country2;
    let variantMap = doQueries.createVariantMap();
    let variantKey = req.body.variants;
    let variantName = getKeyByValue(variantMap, parseInt(variantKey));
    let totalInfected = doQueries.sumDailyCasesQueryByLocationAndVariant(
        country,
        variantKey
    );
    if (totalInfected === false) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "Total COVID infected in " +
                country +
                " from " +
                variantName +
                " is: " +
                totalInfected[0][0] +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/getAverageCases", (req, res) => {
    let country = req.body.Country3;
    let avgCases = doQueries.getAvgDailyCasesQuery(country);
    if (avgCases === false) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "The average daily infection cases in " +
                country +
                " is: " +
                avgCases[0][1] +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/getTotalVaccinated", (req, res) => {
    let country = req.body.Country1;
    let totalVaccinated = doQueries.getSumTotalVaccinationsByLocation(country);
    if (totalVaccinated === false) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "Total vaccinated people in " +
                country +
                " is: " +
                totalVaccinated[0][0] +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/getVaccinatedPerManufacturer", (req, res) => {
    let country = req.body.Country2;
    let manufacturerMap = createManufacturerMap();
    let manufacturerKey = req.body.manufacturer;
    let manufacturerName = getKeyByValue(
        manufacturerMap,
        parseInt(manufacturerKey)
    );
    let vaccinations = doQueries.getTotalVaccinationsByManufacturer(
        country,
        manufacturerKey
    );
    if (vaccinations === false) {
        let result = writeInHtml("We have no information for this country");
        res.write(result);
        res.end();
    } else {
        let result = writeInHtml(
            "Total vaccinated in " +
                country +
                " in " +
                manufacturerName +
                " vaccine is: " +
                vaccinations[0].total_vaccinations +
                "\n"
        );
        res.write(result);
        res.end();
    }
});

app.post("/insertManufacturer", (req, res) => {
    let manufacturer_name = req.body.manufacturer_name;
    let result = doQueries.insertManufacturer(manufacturer_name);
    let text = writeInHtml(result);
    res.write(text);
    res.end();
});

app.post("/insertVariant", (req, res) => {
    let variant_id = req.body.variant_id;
    let variant_name = req.body.variant_name;
    result = doQueries.insertVariant(variant_id, variant_name);
    let text = writeInHtml(result);
    res.write(text);
    res.end();
});

app.post("/updateInfectionCases", (req, res) => {
    let location = req.body.location;
    let date = req.body.date;
    let variant = req.body.variant;
    let daily_cases = req.body.daily_cases;
    let result = doQueries.updateInfectionCasesQuery(
        location,
        date,
        variant,
        daily_cases
    );
    let text = writeInHtml(result);
    res.write(text);
    res.end();
});

app.listen(3000);

function createManufacturerMap() {
    dict = {};
    dict["Johnson&Johnson"] = 1;
    dict["Moderna"] = 2;
    dict["Oxford/AstraZeneca"] = 3;
    dict["Pfizer/BioNTech"] = 4;
    dict["Sinovac"] = 5;
    dict["CanSino"] = 6;
    dict["Sputnik V"] = 7;
    dict["Sinopharm/Beijing"] = 8;
    return dict;
}

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
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }