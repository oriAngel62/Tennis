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
        return false;
    }
    if (result[0] === undefined) return false;
    let result_username = result[0].username;
    if (userName === result_username) return true;
    return false;
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
    let getGames =
        "SELECT user_id,comment From Comments WHERE match_id = ?";
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
function getFavoritePlayer(username,favorite) {
    let playerName =
        "SELECT player_name FROM User where user_name =?";
    var table = [];
    var result = config.query(getGames, [username]);
    if (result[0] === undefined) return false;

    let favoritrPlayer =
    "SELECT * FROM player where player_name in (SELECT player_name FROM User where user_name =?)";
    var result2 = config.query(getGames, [playerName]);
   
    return result2;
}




// Admin Update Query
function updateInfectionCasesQuery(location, date, variant, daily_cases) {
    let set_foreign_keys_query = "SET FOREIGN_KEY_CHECKS=0";
    config.query(set_foreign_keys_query);
    let update_infection_cases_query = `UPDATE covid_db.infection_cases 
                                        SET daily_cases =? WHERE location =? and date =? and variant =?`;
    try {
        config.query(update_infection_cases_query, [
            daily_cases,
            location,
            date,
            createVariantMap()[variant],
        ]);
        return "Succeeded";
    } catch {
        return "not succeeded";
    }
}

function insertManufacturer(manufacturer_name) {
    let lastManufacturerIDQuery =
        "SELECT MAX(manufacturer_id) as last FROM covid_db.manufacturers";

    try {
        last_manufacturer_id = config.query(lastManufacturerIDQuery);
    } catch {
        return "Not succeeded";
    }

    let manufacturer_id = last_manufacturer_id[0].last + 1;

    let insertManufacturerQuery =
        `INSERT INTO covid_db.manufacturers(manufacturer_id ,manufacturer_name)
                                    VALUES(` +
        manufacturer_id +
        `,'` +
        manufacturer_name +
        `');`;
    try {
        config.query(insertManufacturerQuery, [
            manufacturer_id,
            manufacturer_name,
        ]);
        return "Succeeded";
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return "Not succeeded";
    }
}


//Return the number of deaths in the latest day for the location they gave
function getNumberDeathsLatestDayQuery(location) {
    let getTotalDeathsQuery =
        `select new_deaths from covid_db.death_cases AS d 
                                where (date = (select distinct max(date) from covid_db.death_cases 
                                                where location = d.location)
                                and location = '` +
        location +
        `');`;
    var table = [];
    var result = config.query(getTotalDeathsQuery);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

function avgNewDeathsQuery(location) {
    let avgNewDeathsQuery =
        `select location, AVG(new_deaths) 
                                FROM covid_db.death_cases 
                                where location = '` +
        location +
        `'
                                 group by location`;
    var table = [];
    var result = config.query(avgNewDeathsQuery);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

//infection_cases
//Return the sum daily cases by the location they gave
function sumDailyCasesQueryByLocation(location) {
    let getSumDailyCasesQuery =
        `select SUM(daily_cases) as total_daily_cases 
                                    from covid_db.infection_cases 
                                     where location = '` +
        location +
        `' group by location;`;
    let result = config.query(getSumDailyCasesQuery);
    if (result[0] === undefined) return false;
    let total_daily_cases = result[0].total_daily_cases;
    return {
        location,
        total_daily_cases,
    };
}

//Return the sum daily cases by the location and variant they gave
function sumDailyCasesQueryByLocationAndVariant(location, variant) {
    let getSumDailyCasesQuery =
        `select SUM(daily_cases) from covid_db.infection_cases
                                 where location = '` +
        location +
        `' and variant = '` +
        variant +
        `' group by location, variant;`;
    var table = [];
    var result = config.query(getSumDailyCasesQuery);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

function getAvgDailyCasesQuery(location) {
    let getAvgDailyCasesQuery =
        `SELECT location, AVG(daily_cases) as average_daily_cases 
                                FROM covid_db.infection_cases 
                                where location = '` +
        location +
        `'
                                group by location`;
    var table = [];
    var result = config.query(getAvgDailyCasesQuery);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

function getSumTotalVaccinationsByLocation(location) {
    let getSumTotalVaccinationsByLocationQuery =
        `select SUM(total_vaccinations) as sum_vaccinations
                                                    from covid_db.vaccinations c 
                                                    where (location = '` +
        location +
        `' 
                                                            and date = (select distinct max(date) from covid_db.vaccinations 
                                                                        where location = c.location)) 
                                                    group by c.location, date`;
    var table = [];
    var result = config.query(getSumTotalVaccinationsByLocationQuery);
    if (result[0] === undefined) return false;
    Object.keys(result).forEach(function (key) {
        table.push(Object.values(result[key]));
    });
    return table;
}

function getSumTotalVaccinationsInAllTheCountryQuery() {
    let getSumTotalVaccinationsInAllTheCountryQuery = `select SUM(total_vaccinations) as sum_total_vaccinations 
                                                       FROM covid_db.vaccinations AS c 
                                                       where (date = (select distinct max(date) from covid_db.vaccinations
                                                                         where location = c.location))`;
    var result = config.query(getSumTotalVaccinationsInAllTheCountryQuery);
    if (result[0] === undefined) return false;
    return result[0].sum_total_vaccinations;
}

function getTotalVaccinationsByManufacturer(location, manufacturer) {
    let getTotalVaccinationsByManufacturerQuery =
        `select total_vaccinations FROM covid_db.vaccinations AS c
                                                     where (location ='` +
        location +
        `' AND manufacturer = '` +
        manufacturer +
        `' AND date = (select distinct max(date) from covid_db.vaccinations
                                                          where location = c.location));`;
    var result = config.query(getTotalVaccinationsByManufacturerQuery);
    if (result[0] === undefined) return false;
    return result;
}

function createVariantMap() {
    var dict = {};
    dict["Alpha"] = 1;
    dict["B.1.1.277"] = 2;
    dict["B.1.1.302"] = 3;
    dict["B.1.1.519"] = 4;
    dict["B.1.177"] = 6;
    dict["B.1.221"] = 7;
    dict["B.1.258"] = 8;
    dict["B.1.367"] = 9;
    dict["B.1.620"] = 10;
    dict["Beta"] = 11;
    dict["Delta"] = 12;
    dict["Epsilon"] = 13;
    dict["Eta"] = 14;
    dict["Gamma"] = 15;
    dict["Iota"] = 16;
    dict["Kappa"] = 17;
    dict["Lambda"] = 18;
    dict["Mu"] = 19;
    dict["Omicron"] = 20;
    dict["S:677H.Robin1"] = 21;
    dict["S:677P.Pelican"] = 22;
    dict["others"] = 23;
    dict["non_who"] = 24;
    return dict;
}

module.exports.login = login;
module.exports.signUp = signUp;

module.exports.getGames = getGames;
module.exports.getComments = getComments;
module.exports.insertComment = insertComment;

module.exports.getFavoritePlayer = getFavoritePlayer;


module.exports.sumDailyCasesQueryByLocation = sumDailyCasesQueryByLocation;
module.exports.getSumTotalVaccinationsByLocation =
    getSumTotalVaccinationsByLocation;
module.exports.getSumTotalVaccinationsInAllTheCountryQuery =
    getSumTotalVaccinationsInAllTheCountryQuery;
module.exports.getTotalVaccinationsByManufacturer =
    getTotalVaccinationsByManufacturer;
module.exports.getTotalDeathsQuery = getTotalDeathsQuery;
module.exports.avgNewDeathsQuery = avgNewDeathsQuery;
module.exports.getAvgDailyCasesQuery = getAvgDailyCasesQuery;
module.exports.getNumberDeathsLatestDayQuery = getNumberDeathsLatestDayQuery;
module.exports.sumDailyCasesQueryByLocationAndVariant =
    sumDailyCasesQueryByLocationAndVariant;
module.exports.updateInfectionCasesQuery = updateInfectionCasesQuery;
module.exports.insertManufacturer = insertManufacturer;
module.exports.createVariantMap = createVariantMap;
