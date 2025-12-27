const mysql = require('../config/db_config');

async function getUserByEmail(email){
    try{
        const sql = "SELECT * FROM user WHERE email = ?";
        const [rows] = await mysql.pool.query(sql, [email]);
        if(rows.length >= 1){
            let result = {
                userID: rows[0].userID,
                gender: rows[0].gender,
                firstname: rows[0].firstname,
                lastname: rows[0].lastname,
                email: rows[0].email,
                password: rows[0].password,
                street: rows[0].street,
                houseNumber: rows[0].houseNumber,
                zip: rows[0].zip,
                city: rows[0].city,
                role: await getRoleTitleByRoleId(rows[0].roleRoleID)
            }
            return result;
        }else{
            return undefined;
        }
    }catch(err){
        console.log(err);
    }
}

async function getRoleTitleByRoleId(roleID){
    try{
        const sql = "SELECT title FROM role WHERE roleID = ?";
        const [rows] = await mysql.pool.query(sql, [roleID]);
        return rows[0].title;
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    getUserByEmail,
}