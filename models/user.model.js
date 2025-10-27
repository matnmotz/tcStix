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

module.exports = {
    getBookings,
    addUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
}