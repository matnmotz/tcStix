const mysql = require('../config/db_config');

function getBookings(){

}

async function getUsers(){
    try{
        const sql = "SELECT * FROM user";
        const [rows] = await mysql.pool.query(sql);
        let result = [];
        for(let i = 0; i < rows.length; i++){
            let arr = {
                userID: rows[i].userID,
                gender: rows[i].gender,
                firstname: rows[i].firstname,
                lastname: rows[i].lastname,
                email: rows[i].email,
                street: rows[i].street,
                houseNumber: rows[i].houseNumber,
                zip: rows[i].zip,
                city: rows[i].city,
                role: await getRoleTitleByRoleId(rows[i].roleRoleID),
            }
            result.push(arr);
        }
        return result;
    }catch(err){
        console.log(err);
    }
}

async function getUser(userID){
    try{
        const sql = "SELECT * FROM user WHERE userID = ?";
        const [rows] = await mysql.pool.query(sql, [userID]); 
        let result = {
            userID: userID,
            gender: rows[0].gender,
            role: await getRoleTitleByRoleId(rows[0].roleRoleID),
            firstname: rows[0].firstname,
            lastname: rows[0].lastname,
            email: rows[0].email,
            street: rows[0].street,
            houseNumber: rows[0].houseNumber,
            zip: rows[0].zip,
           city: rows[0].city
        }
        return result;
    }catch(err){
        console.log(err);
    }
}

async function getUUID(){
    try{
        const sql = "SELECT UUID() as uuid";
        const [rows] = await mysql.pool.query(sql);
        return rows[0].uuid;
    }catch(err){
        console.log(err);
    }
}

async function getRoleIdByTitle(title){
    try{
        const sql = "SELECT roleID FROM role WHERE title = ?";
        const [rows] = await mysql.pool.query(sql, [title]);
        return rows[0].roleID;
    }catch(err){
        console.log(err);
    }
}

async function getRoleTitleByRoleId(id){
    try{
        const sql = "SELECT title FROM role WHERE roleID = ?";
        const [rows] = await mysql.pool.query(sql, [id]);
        return rows[0].title;
    }catch(err){
        console.log(err);
    }
}

async function addUser(user){
    try{
        const uuid = await getUUID();
        const roleID = await getRoleIdByTitle(user.role);
        const sql = "INSERT INTO user (userID, firstname, lastname, email, password, street, houseNumber, zip, city, roleRoleID, gender) VALUE (?,?,?,?,?,?,?,?,?,?,?)";
        await mysql.pool.query(sql, [`${uuid}`, user.firstname, user.lastname, user.email, user.password, user.street, user.houseNumber, user.zip, user.city, roleID, user.gender]);
    }catch(err){
        console.log(err);
    }
}

async function updateUser(user){
    try{
        const roleID = await getRoleIdByTitle(user.role);
        const sql = "UPDATE user SET firstname = ?, lastname = ?, email = ?, street = ?, houseNumber = ?, zip = ?, city = ?, roleRoleID = ?, gender = ? WHERE userID = ?";
        await mysql.pool.query(sql, [user.firstname, user.lastname, user.email, user.street, user.houseNumber, user.zip, user.city, roleID, user.gender, user.userID]);
    }catch(err){
        console.log(err);
    }
}

async function deleteUser(userID){
    try{
        const sql = "DELETE FROM user WHERE userID = ?";
        await mysql.pool.query(sql, [userID]);
    }catch(err){
        console.log(err);
    }

}

async function updateBookingType(data){
    try{
        const sql = "UPDATE booking_type set hexCode = ? WHERE title = ?";
        await mysql.pool.query(sql, [data.hexCode, data.title]);
    }catch(err){
        console.log(err);
    }
}

async function getBookingTypes(){
    try{
        const sql = "SELECT * FROM booking_type";
        const [rows] = await mysql.pool.query(sql);
        return rows;
    }catch(err){
        console.log(err);
    }
}

async function addActivity(data){
    try{
        const uuid = await getUUID();
        let sql = "INSERT INTO activity (activityID, title, time, date) VALUES (?,?,?,?)";
        await mysql.pool.query(sql, [uuid, data.title, data.time, data.date]);
        sql = "INSERT INTO user_activity (userUserID, activityActivityID) VALUES (?,?)";
        for(let i = 0; i < data.users.length; i++){
            await mysql.pool.query(sql, [data.users[i], uuid]);
        }
    }catch(err){
        console.log(err);
    }
}

async function getActivitys(){
    try{
        const year = new Date().getFullYear()-2
        let date = year + "-01-01";
        let sql = "SELECT activityID, title, time, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM activity WHERE date >= ? ORDER BY date";
        const[rows] = await mysql.pool.query(sql, [date]);
        sql = "SELECT userID, firstname, lastname FROM user_activity JOIN user ON userUserID = userID WHERE activityActivityID = ?";
        let resultArr = [];
        for(let i = 0; i < rows.length; i++){
            let year = parseInt(rows[i].date.substr(0,4));
            let arr = {
                activityID: rows[i].activityID,
                title: rows[i].title,
                time: rows[i].time,
                date: rows[i].date,
                year: year,
                firstMember: "",
                otherMembers: 0,
                users: []
            }
            let [result] = await mysql.pool.query(sql, [rows[i].activityID]);
            for(let j = 0; j < result.length; j++){
                if(j == 0){
                    arr.firstMember = result[j].firstname + " " + result[j].lastname;
                    arr.otherMembers = result.length - 1;
                }
                arr.users.push(
                    {
                        userID: result[j].userID,
                        firstname: result[j].firstname,
                        lastname: result[j].lastname,
                    }
                )
            }
            resultArr.push(arr);
        }
        return resultArr;
    }catch(err){
        console.log(err);
    }
}

async function getActivity(activityID){
    try{
        let sql = "SELECT title, time, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM activity WHERE activityID = ?";
        const [rows] = await mysql.pool.query(sql, [activityID])
        let arr = {
            activityID: activityID,
            title: rows[0].title,
            time: rows[0].time,
            date: rows[0].date,
            users: []
        }
        sql = "SELECT userID, firstname, lastname FROM user_activity JOIN user ON userUserID = userID WHERE activityActivityID = ?";
        const [result] = await mysql.pool.query(sql, [activityID]);
        for(let i = 0; i < result.length; i++){
            let user = {
                userID: result[i].userID,
                firstname: result[i].firstname,
                lastname: result[i].lastname
            }
            arr.users.push(user);
        }
        return arr;
    }catch(err){
        console.log(err);
    }
}

async function updateActivity(data){
    try{
        let sql = "UPDATE activity SET title = ?, time = ?, date = ? WHERE activityID = ?";
        await mysql.pool.query(sql, [data.title, data.time, data.date, data.activityID]);
        sql = "DELETE FROM user_activity WHERE activityActivityID = ?";
        await mysql.pool.query(sql, data.activityID);
        sql = "INSERT INTO user_activity (userUserID, activityActivityID) VALUES (?,?)";
        for(let i = 0; i < data.users.length; i++){
            await mysql.pool.query(sql, [data.users[i], data.activityID]);
        }
    }catch(err){
        console.log(err);
    }
}


module.exports = {
    getBookings,
    addUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getBookingTypes,
    updateBookingType,
    addActivity,
    getActivitys,
    getActivity,
    updateActivity
}