const mysql = require('../config/db_config');

function getBookings(){

}

async function getUsers(){
    try{
        const sql = "SELECT * FROM user ORDER BY lastname ASC";
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

async function getUsersUserIdAndName(){
    try{
        const sql = "SELECT firstname, lastname, userID FROM user ORDER BY lastname ASC";
        const [rows] = await mysql.pool.query(sql);
        return rows;
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

async function getCourts(){
    try{
        const sql = "SELECT * FROM court";
        const [rows] = await mysql.pool.query(sql);
        return rows
    }catch(err){
        console.log(err);
    }
}

async function checkFreeCourt(data){
    try{
        await mysql.pool.query("CREATE TEMPORARY TABLE tmp_time (t time)");
        const start_hh = parseInt(data.from.substring(0,2));
        const end_hh = parseInt(data.to.substring(0,2));
        const start_mm = parseInt(data.from.substring(3,5));
        const end_mm = parseInt(data.to.substring(3,5));
        const tmp_sql = "INSERT INTO tmp_time (t) VALUES (?)";
        console.log(start_hh + " | " + end_hh);
        for(let i = start_hh; i <= end_hh; i++){
            if(i == start_hh){
                //start
                if(start_mm == 0){
                    await mysql.pool.query(tmp_sql, [`${i}:00:00`]);
                    await mysql.pool.query(tmp_sql, [`${i}:30:00`]);
                }else{
                    await mysql.pool.query(tmp_sql, [`${i}:30:00`]);
                }
            }else if(i == end_hh){
                //end
                if(end_mm == 30){
                    await mysql.pool.query(tmp_sql, [`${i}:00:00`]);
                }
            }else{
                //between
                await mysql.pool.query(tmp_sql, [`${i}:00:00`]);
                await mysql.pool.query(tmp_sql, [`${i}:30:00`]);
            }
        }

        const [rows] = await mysql.pool.query("SELECT bookingID FROM tmp_time LEFT JOIN booking ON t = starttime WHERE date = ? AND courtCourtID = ?", [data.date, data.court]);
        await mysql.pool.query("DROP TABLE tmp_time");
        
        if(rows.length == 0){
            //court free
            return true;
        }else{
            //court full
            return false;
        }
    }catch(err){
        console.log(err);
    }
}

async function checkUserAllowedBooking(data, roleTitle, userID){
    try{
        if(roleTitle != 'trainer'){
            if((parseInt(data.to.split(":")[0]) - parseInt(data.from.split(":")[0])) > 2){
                return false;
            }
            //sql format formatter
            const format = (d) => d.toISOString().split("T")[0];
            const toDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
            //calc mon & sun
            const date = new Date(data.date);
            const day = date.getDay();
            const diffToMonday = (day === 0 ? -6 : 1) - day;
            const monday = new Date(date);
            monday.setDate(date.getDate() + diffToMonday);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            
            const sql = "SELECT * FROM booking JOIN booking_user ON bookingID = bookingBookingID WHERE userUserID = ? AND date >= ? AND date <= ? AND booking_type = ?";
            const [rows] = await mysql.pool.query(sql,[userID, format(monday), format(sunday), 'reservation']);
            let green = true;
            let red = true;
            for(let i = 0; i < rows.length; i++){
                let tm = toDateOnly(new Date(rows[i].timestamp.substring(0,10)));
                let bk = toDateOnly(new Date(rows[i].date));
                let diff = (bk-tm) / (24*60*60*1000);

                if(diff >= 0 && diff <= 1){
                    green = false;
                }else{
                    red = false;
                }
            } 
            if(!green && !red){
                //rot & grün verbraucht
                return false;
            }else if(!red && green){
                //rot verbraucht, grün geht
                let diff = (toDateOnly(date)-toDateOnly(new Date())) / (24*60*60*1000);
                if(diff >= 0 && diff <= 1){
                    return true;
                }else{
                    return false;
                }
            }
        }
        return true;
    }catch(err){
        console.log(err);
    }
}

async function addBooking(data, userID){
    try{
        data.from = timeToSqlTimeFormat(data.from);
        data.to = timeToSqlTimeFormat(data.to);

        const uuid = await getUUID();
        let sql = "INSERT INTO booking (bookingID, booking_type, starttime, endtime, date, timestamp, courtCourtID) VALUES (?,?,?,?,?,?,?)";
        await mysql.pool.query(sql, [uuid, data.booking_type, data.from, data.to, data.date, getSQLTimestamp(), data.court]);
        sql = "INSERT INTO booking_user (bookingBookingID, userUserID) VALUES (?,?)";
        await mysql.pool.query(sql, [uuid, userID]);
    }catch(err){
        console.log(err);
    }
}

async function getBookings(userID){
    try{
        const format = (d) => {
            const date = new Date(d);
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yy = date.getFullYear();
            return `${dd}.${mm}.${yy}`;
        }
        const formatSQL = (d) => {
            const dd = d.getDate();
            const mm = d.getMonth()+1;
            const yy = d.getFullYear();
            return `${yy}-${mm}-${dd}`;
        }
        const year = new Date().getFullYear()
        const dateString = formatSQL(new Date());
        const sql = "SELECT * FROM booking JOIN booking_user ON bookingID = bookingBookingID WHERE userUserID = ? AND booking_type = ? AND date >= ? ORDER BY date ASC LIMIT 5";
        const [rows] = await mysql.pool.query(sql, [userID,'reservation', dateString]);
        let result = [];
        for(let i = 0; i < rows.length; i++){

            let arr = {
                bookingID: rows[i].bookingID,
                date: format(rows[i].date),
                starttime: rows[i].starttime.substring(0,5),
                endtime: rows[i].endtime.substring(0,5),
                courtCourtID: rows[i].courtCourtID
            }
            result.push(arr);
        }
        return result;
    }catch(err){
        console.log(err);
    }
}

async function deleteBooking(bookingID){
    try{
        let sql = "DELETE FROM booking WHERE bookingID = ?";
        await mysql.pool.query(sql, [bookingID]);
        sql = "DELETE FROM booking_user WHERE bookingBookingID = ?";
        await mysql.pool.query(sql, [bookingID]);
    }catch(err){
        console.log(err);
    }
}

async function allowedToDeleteBooking(userID, bookingID){
    try{
        const sql = "SELECT * FROM booking_user WHERE userUserID = ? AND bookingBookingID = ?";
        const [rows] = await mysql.pool.query(sql, [userID, bookingID]);
        if(rows.length >= 1){
            return true;
        }else{
            return false;
        }
    }catch(err){
        console.log(err);
    }
}

async function addChampionship(opponent,date,from,to, userID){
    try{
        const formatSQL = (date) => {
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yy = date.getFullYear();
            const hh = date.getHours();
            const min = date.getMinutes();
            const ss = date.getSeconds();
            return `${yy}-${mm}-${dd} ${hh}:${min}:${ss}`;
        }
        const bookingID = await getUUID();
        const bookingID2 = await getUUID();
        const bookingIDs = [bookingID, bookingID2];
        const timestamp = formatSQL(new Date);
        const sql = "INSERT INTO booking(bookingID, booking_type, starttime, endtime, date, timestamp, courtCourtID, note) VALUES (?,?,?,?,?,?,?,?)";
        const sql_user = "INSERT INTO booking_user (bookingBookingID, userUserID) VALUES (?,?)";
        for(let i = 1; i <= 2; i++){
            await mysql.pool.query(sql, [bookingIDs[i-1], 'championship', from, to, date, timestamp, i, opponent]);
            await mysql.pool.query(sql_user, [bookingIDs[i-1], userID]);
        }
    }catch(err){
        console.log(err);
    }
}

async function getChampionships(){
    try{
        const formatSQL = (d) => {
            const dd = String(d.getDate()).padStart(2,'0');
            const mm = String(d.getMonth()+1).padStart(2,'0');
            const yy = d.getFullYear();
            return `${yy}-${mm}-${dd}`;
        }
        const date = formatSQL(new Date(new Date().getFullYear(),0,1));
        const sql = "SELECT * FROM booking WHERE booking_type = 'championship' AND date >= ? GROUP BY date";
        const [rows] = await mysql.pool.query(sql, [date]);
        for(let i = 0; i < rows.length; i++){
            rows[i].date = new Date(rows[i].date);
            rows[i].starttime = rows[i].starttime.substring(0,5);
            rows[i].endtime = rows[i].endtime.substring(0,5);
        }
        return rows;
    }catch(err){
        console.log(err);
    }
}

async function deleteChampionship(date){
    try{
        let sql = "SELECT bookingID FROM booking WHERE booking_type = ? AND date = ?";
        const [rows] = await mysql.pool.query(sql, ['championship', date]);
        sql = "DELETE FROM booking WHERE booking_type = ? AND date = ? LIMIT 2";
        await mysql.pool.query(sql,['championship', date]);
        sql = "DELETE FROM booking_user WHERE bookingBookingID = ?";
        for(let i = 0; i < rows.length; i++){
            await mysql.pool.query(sql, [rows[i].bookingID]);
        }
    }catch(err){
        console.log(err);
    }
}

async function addClosure(from,to,courtParam,userID){
    try{
        const diff = calculateDayDiff(from,to);
        const courts = courtParam.split("&");
        const sql = "INSERT INTO booking (bookingID, booking_type, starttime, endtime, date, timestamp, courtCourtID, note) VALUES (?,?,?,?,?,?,?,?)";
        const sql_user = "INSERT INTO booking_user (bookingBookingID, userUserID) VALUES (?,?)";
        let noteID = await getUUID();
        for(let i = 0; i < diff; i++){
            for(let j = 0; j < courts.length; j++){
                let date = new Date(from.split("T")[0]);
                let timestamp = getSQLTimestamp();
                date.setDate(date.getDate() + i);
                let bookingID = await getUUID();
                let starttime = "06:00:00";
                let endtime = "22:00:00";
                if(i == 0){
                    starttime = from.split("T")[1]+":00";
                }
                if(i == (diff - 1)){
                    endtime = to.split("T")[1]+":00";
                }
                await mysql.pool.query(sql, [bookingID, 'closed', starttime, endtime, dateToSqlFormat(date), timestamp, parseInt(courts[j]), noteID]);
                await mysql.pool.query(sql_user, [bookingID, userID]);
            }
        }
        console.log("Fehlerlos durchgeführt!");
    }catch(err){
        console.log(err);
    }
}

async function getActiveClosure(){
    try{
        const today = dateToSqlFormat(new Date());
        let sql = "SELECT note FROM booking WHERE booking_type = ? AND date = ?";
        let [rows] = await mysql.pool.query(sql,['closed', today]);
        if(rows.length >= 1){
            sql = "SELECT note, date, starttime FROM booking WHERE note = ?";
            let [result] = await mysql.pool.query(sql, [rows[0].note]);
            for(let i = 0; i < result.length; i++){
                result[i].starttime = result[i].starttime.substring(0,5);
            }
            return result[0];
        }
        return [];
    }catch(err){
        console.log(err);
    }
}

async function updateClosure(noteID, enddatetime, userID){
    try{
        let sql = "DELETE booking, booking_user FROM booking JOIN booking_user ON bookingID = bookingBookingID WHERE note = ? AND date > ? AND booking_type = ?";
        await mysql.pool.query(sql, [noteID, enddatetime.split("T")[0], 'closed']);
        sql = "UPDATE booking SET endtime = ?, timestamp = ? WHERE date = ? AND note = ? AND booking_type = ?";
        await mysql.pool.query(sql, [enddatetime.split("T")[1], await getSQLTimestamp(), enddatetime.split("T")[0], noteID, 'closed']);
    }catch(err){
        console.log(err);
    }
}

async function getAllBookingsBetween(startdate, enddate){
    try{
        const sql = "SELECT booking.*, booking_user.*, DATE_FORMAT(booking.date, '%Y-%m-%d') AS date FROM booking JOIN booking_user ON bookingID = bookingBookingID WHERE date >= ? AND date <= ?";
        const [rows] = await mysql.pool.query(sql, [startdate, enddate]);
        return rows;
    }catch(err){
        console.log(err);
    }
}
//private functions
function getSQLTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function timeToSqlTimeFormat(t){
    let parts = t.split(":");
     while (parts.length < 3) {
        parts.push("00");
    }
    t = parts.join(":");
    return t;
}

function dateToSqlFormat(d){
    let date = new Date(d);
    const yy = date.getFullYear();
    const mm = String(date.getMonth()+1).padStart(2,"0");
    const dd = String(date.getDate()).padStart(2,"0");
    return `${yy}-${mm}-${dd}`
}

function calculateDayDiff(from, to) {
    const dateFrom = new Date(from);
    const dateTo   = new Date(to);

    const diffMs = dateTo - dateFrom;

    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}



module.exports = {
    getBookings,
    addUser,
    getUsers,
    getUsersUserIdAndName,
    getUser,
    updateUser,
    deleteUser,
    getBookingTypes,
    updateBookingType,
    addActivity,
    getActivitys,
    getActivity,
    updateActivity,
    getCourts,
    checkFreeCourt,
    checkUserAllowedBooking,
    addBooking,
    getBookings,
    deleteBooking,
    allowedToDeleteBooking,
    addChampionship,
    getChampionships,
    deleteChampionship,
    addClosure,
    getActiveClosure,
    updateClosure,
    getAllBookingsBetween
}