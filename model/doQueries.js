const syncSql = require('sync-mysql');

const config = new syncSql({
    host: "localhost",
    user: "root",
    password: "sweetcandyA1!",
    database: "covid_db",
});


function login(userName, password) {
    let loginQuery = 'SELECT username FROM covid_db.users WHERE username =? and password =?'

    try{
        var result = config.query(loginQuery, [userName, password])
    }

    catch{
        return false
    }

    if(result[0] === undefined)
        return false
    let result_username = result[0].username
    if (userName === result_username)
        return true
    return false
}

function isAdmin(userName) {
    let isAdminQuery = 'SELECT is_admin FROM covid_db.users WHERE username =?';
    var result = config.query(isAdminQuery, [userName])
    if(result[0] === undefined)
        return false
    res = result[0].is_admin
    if(res === 1)
        return true
    return false
}

function signUp(userName, password, isAdmin) {
    let signUpQuery= "INSERT INTO covid_db.users(username, password, is_admin)" +
        "VALUES (" + userName + ","  + password + ","  + isAdmin + ")";
    try {
        config.query(signUpQuery)
    }
    catch (error) {
        if (error.code === "ER_DUP_ENTRY")
            return "Username already is use!"
        return false;
    }
    return "You are signed up!"
}

// Admin Update Query
function updateInfectionCasesQuery(location, date, variant, daily_cases){
    let set_foreign_keys_query = "SET FOREIGN_KEY_CHECKS=0";
    config.query(set_foreign_keys_query)
    let update_infection_cases_query = `UPDATE covid_db.infection_cases 
                                        SET daily_cases =? WHERE location =? and date =? and variant =?`
    try{
        config.query(update_infection_cases_query, [daily_cases, location, date, createVariantMap()[variant]])
        return "Succeeded";
    }
    catch{
        return "not succeeded";
    }
}

function insertManufacturer(manufacturer_name){
    let lastManufacturerIDQuery = 'SELECT MAX(manufacturer_id) as last FROM covid_db.manufacturers';

    try{
        last_manufacturer_id = config.query(lastManufacturerIDQuery)
    }

    catch{
        return "Not succeeded"
    }

    let manufacturer_id = last_manufacturer_id[0].last + 1

    let insertManufacturerQuery = `INSERT INTO covid_db.manufacturers(manufacturer_id ,manufacturer_name)
                                    VALUES(`+manufacturer_id+`,'`+manufacturer_name+`');`
    try {
        config.query(insertManufacturerQuery, [manufacturer_id, manufacturer_name])
        return "Succeeded";
    }
    catch (error) {
        if (error.code === "ER_DUP_ENTRY")
            return "Not succeeded"
    }
}

function insertVariant(variant_id, variant_name){
    let insertVariantQuery =`INSERT INTO covid_db.variants(variant_id ,variant_name)
                             VALUES(`+variant_id+`, '`+variant_name+`');`
    try {
        config.query(insertVariantQuery)
        return "Succeeded";
    }
    catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return "not succeed"
        }
    }
}

//Return the total number of deaths for the location they gave
function getTotalDeathsQuery(location) {
    let getTotalDeathsQuery = `select sum(new_deaths) 
                                from covid_db.death_cases 
                                where location like '`+ location +
        `' group by location;`
    var table = []
    var result = config.query(getTotalDeathsQuery)
    if(result[0] === undefined)
        return false
    Object.keys(result).forEach(function(key) {
        table.push(Object.values(result[key]))
    })
    return table
}

//Return the number of deaths in the latest day for the location they gave
function getNumberDeathsLatestDayQuery(location) {
    let getTotalDeathsQuery = `select new_deaths from covid_db.death_cases AS d 
                                where (date = (select distinct max(date) from covid_db.death_cases 
                                                where location = d.location)
                                and location = '` + location + `');`
    var table = []
    var result = config.query(getTotalDeathsQuery)
    if(result[0] === undefined)
        return false
    Object.keys(result).forEach(function(key) {
        table.push(Object.values(result[key]))
    })
    return table
}

function avgNewDeathsQuery(location) {
    let avgNewDeathsQuery = `select location, AVG(new_deaths) 
                                FROM covid_db.death_cases 
                                where location = '` +location+ `'
                                 group by location`
    var table = []
    var result = config.query(avgNewDeathsQuery)
    if(result[0] === undefined)
        return false
    Object.keys(result).forEach(function(key) {
        table.push(Object.values(result[key]))
    })
    return table
}

//infection_cases
//Return the sum daily cases by the location they gave
function sumDailyCasesQueryByLocation(location) {
    let getSumDailyCasesQuery = `select SUM(daily_cases) as total_daily_cases 
                                    from covid_db.infection_cases 
                                     where location = '` + location +
        `' group by location;`
    let result = config.query(getSumDailyCasesQuery)
    if(result[0] === undefined)
        return false
    let total_daily_cases = result[0].total_daily_cases
    return {
        location,
        total_daily_cases
    };
}

//Return the sum daily cases by the location and variant they gave
function sumDailyCasesQueryByLocationAndVariant(location, variant) {
    let getSumDailyCasesQuery = `select SUM(daily_cases) from covid_db.infection_cases
                                 where location = '` + location + `' and variant = '`+ variant +
        `' group by location, variant;`
    var table = []
    var result = config.query(getSumDailyCasesQuery)
    if(result[0] === undefined)
        return false
    Object.keys(result).forEach(function(key) {
        table.push(Object.values(result[key]))
    })
    return table
}

function getAvgDailyCasesQuery(location) {
    let getAvgDailyCasesQuery = `SELECT location, AVG(daily_cases) as average_daily_cases 
                                FROM covid_db.infection_cases 
                                where location = '`+ location +`'
                                group by location`
    var table = []
    var result = config.query(getAvgDailyCasesQuery)
    if(result[0] === undefined)
        return false
    Object.keys(result).forEach(function(key) {
        table.push(Object.values(result[key]))
    })
    return table
}

function getSumTotalVaccinationsByLocation(location) {
    let getSumTotalVaccinationsByLocationQuery = `select SUM(total_vaccinations) as sum_vaccinations
                                                    from covid_db.vaccinations c 
                                                    where (location = '`+location+`' 
                                                            and date = (select distinct max(date) from covid_db.vaccinations 
                                                                        where location = c.location)) 
                                                    group by c.location, date`
    var table = []
    var result = config.query(getSumTotalVaccinationsByLocationQuery)
    if(result[0] === undefined)
        return false
    Object.keys(result).forEach(function(key) {
        table.push(Object.values(result[key]))
    })
    return table
}

function getSumTotalVaccinationsInAllTheCountryQuery(){
    let getSumTotalVaccinationsInAllTheCountryQuery = `select SUM(total_vaccinations) as sum_total_vaccinations 
                                                       FROM covid_db.vaccinations AS c 
                                                       where (date = (select distinct max(date) from covid_db.vaccinations
                                                                         where location = c.location))`
    var result = config.query(getSumTotalVaccinationsInAllTheCountryQuery)
    if(result[0] === undefined)
        return false
    return result[0].sum_total_vaccinations
}

function getTotalVaccinationsByManufacturer(location, manufacturer) {
    let getTotalVaccinationsByManufacturerQuery = `select total_vaccinations FROM covid_db.vaccinations AS c
                                                     where (location ='` + location+ `' AND manufacturer = '`+ manufacturer +
        `' AND date = (select distinct max(date) from covid_db.vaccinations
                                                          where location = c.location));`
    var result = config.query(getTotalVaccinationsByManufacturerQuery)
    if(result[0] === undefined)
        return false
    return result
}

function createVariantMap() {
    var dict = {}
    dict['Alpha'] = 1
    dict['B.1.1.277'] = 2
    dict['B.1.1.302'] = 3
    dict['B.1.1.519'] = 4
    dict['B.1.177'] = 6
    dict['B.1.221'] = 7
    dict['B.1.258'] = 8
    dict['B.1.367'] = 9
    dict['B.1.620'] = 10
    dict['Beta'] = 11
    dict['Delta'] = 12
    dict['Epsilon'] = 13
    dict['Eta'] = 14
    dict['Gamma'] = 15
    dict['Iota'] = 16
    dict['Kappa'] = 17
    dict['Lambda'] = 18
    dict['Mu'] = 19
    dict['Omicron'] = 20
    dict['S:677H.Robin1'] = 21
    dict['S:677P.Pelican'] = 22
    dict['others'] = 23
    dict['non_who'] = 24
    return dict
}

module.exports.login = login
module.exports.isAdmin = isAdmin
module.exports.signUp = signUp
module.exports.sumDailyCasesQueryByLocation = sumDailyCasesQueryByLocation
module.exports.getSumTotalVaccinationsByLocation = getSumTotalVaccinationsByLocation
module.exports.getSumTotalVaccinationsInAllTheCountryQuery = getSumTotalVaccinationsInAllTheCountryQuery
module.exports.getTotalVaccinationsByManufacturer = getTotalVaccinationsByManufacturer
module.exports.getTotalDeathsQuery = getTotalDeathsQuery
module.exports.avgNewDeathsQuery = avgNewDeathsQuery
module.exports.getAvgDailyCasesQuery = getAvgDailyCasesQuery
module.exports.getNumberDeathsLatestDayQuery = getNumberDeathsLatestDayQuery
module.exports.sumDailyCasesQueryByLocationAndVariant = sumDailyCasesQueryByLocationAndVariant
module.exports.updateInfectionCasesQuery = updateInfectionCasesQuery
module.exports.insertVariant = insertVariant
module.exports.insertManufacturer = insertManufacturer
module.exports.createVariantMap = createVariantMap