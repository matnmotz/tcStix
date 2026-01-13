const ExcelJS = require('exceljs');
const mysql = require('../config/db_config');
const {appendToLogs} = require('./error.model');

//activitys
async function getColsForActivityTable(year){
    try{
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        const sql = "SELECT title FROM activity WHERE date >= ? AND date <= ? ORDER BY date ASC";
        const [rows] = await mysql.pool.query(sql, [start.toISOString().slice(0,10),end.toISOString().slice(0,10)]);
        let result = ['Name'];
        for(let i = 0; i < rows.length; i++){
            result.push(rows[i].title);
        }
        result.push('SUMME in STUNDEN');
        result.push('SUMME in EURO');
        return result;
    }catch(err){
        appendToLogs(err);
    }
}

async function getUserObject(year){
    try{
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        let sql = "SELECT userID, firstname, lastname FROM user";
        const [rows] = await mysql.pool.query(sql);
        sql = "SELECT date FROM activity WHERE date >= ? AND date <= ? ORDER BY date ASC";
        const [dates] = await mysql.pool.query(sql, [start.toISOString().slice(0,10),end.toISOString().slice(0,10)]);
        const result = [];
        for(let i = 0; i < rows.length; i++){
            let object = {
                user: {
                    userID: rows[i].userID,
                    firstname: rows[i].firstname,
                    lastname: rows[i].lastname
                },
                dates: []
            }
            for(let j = 0; j < dates.length; j++){
                object.dates.push({ date: dates[j].date, time:0});
            }
            result.push(object);
        }
        return result;
    }catch(err){
        appendToLogs(err);
    }
}

async function getDataForActivityTable(year, hourlyFee){
    try{
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        const userObject = await getUserObject(year);
        const sql = "SELECT time, date FROM activity JOIN user_activity ON activityID = activityActivityID WHERE userUserID = ? AND date >= ? AND date <= ? ORDER BY date ASC";
        for(let i = 0; i < userObject.length; i++){
            const [rows] = await mysql.pool.query(sql, [userObject[i].user.userID,start.toISOString().slice(0,10),end.toISOString().slice(0,10)]);
            let dates = userObject[i].dates;
            for(let j = 0; j < rows.length; j++){
                for(let k = 0; k < dates.length; k++){
                    if(dates[k].date.toISOString() == rows[j].date.toISOString()){
                        dates[k].time = rows[j].time;
                    }
                }
            }
        }
        let result = [];
        for(let i = 0; i < userObject.length; i++){
            let array = [userObject[i].user.firstname + " " + userObject[i].user.lastname];
            let totalTime = 0;
            for(let j = 0; j < userObject[i].dates.length; j++){
                array.push(parseFloat(userObject[i].dates[j].time).toFixed(2));
                totalTime += userObject[i].dates[j].time;
            }
            array.push(parseFloat(totalTime).toFixed(2));
            array.push(Math.floor(totalTime*hourlyFee).toFixed(2));
            result.push(array);

        }
        return result;

    }catch(err){
        appendToLogs(err);
    }
}

async function createActivityWorkbook(year,hourlyFee){
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Aktivitäten');
    const cols = await getColsForActivityTable(year);
    const rows = await getDataForActivityTable(year, hourlyFee);
    
    const colLength = cols.length + 1;
    
    sheet.getColumn(cols.length).numFmt = '"€"##0.00'; 
    for(let i = 2; i < colLength; i++){
        sheet.getColumn(i).numFmt = '0.00';
    }
    


    sheet.addTable({
        name: 'Aktivitäten_'+ year,
        ref: 'B2',
        headerRow: true,
        totalsRow: false,
        style: {
            theme: 'TableStyleMedium9',
            showRowStripes: true,
        },
        columns: cols.map(col => {
            if (col === 'SUMME in EURO') {
                return { name: col, style: { numFmt: '"€"#,##0.00' } };
            }
            return { name: col };
        }),
        rows: rows,


    })

    sheet.columns.forEach((col, index) => {
        let maxLength = 10; // Minimum width
        col.eachCell({ includeEmpty: true }, cell => {
        const value = cell.value ? cell.value.toString() : '';
        if (value.length > maxLength) maxLength = value.length;
        });
        col.width = maxLength + 2; // +2 für etwas Abstand
    });
    return workbook;
}

//membership
async function getMembers(){
    try{
        const sql = "SELECT userID, firstname, lastname FROM user ORDER BY lastname ASC";
        const [rows] = await mysql.pool.query(sql);
        return rows;
    }catch(err){
        appendToLogs(err);
    }
}

async function getSumOfWorkedHours(year){
    try{
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        const members = await getMembers();
        const sql = "SELECT sum(time) as time FROM activity JOIN user_activity ON activityID = activityActivityID WHERE userUserID = ? AND date >= ? AND date <= ?";
        for(let i = 0; i < members.length; i++){
            const [time] = await mysql.pool.query(sql, [members[i].userID, start.toISOString().slice(0,10), end.toISOString().slice(0,10)]);
            members[i].time = (time[0].time != null) ? time[0].time : 0;   
        }
        return members;
    }catch(err){
        appendToLogs(err);
    }
}

async function prepareRows(year, hourlyFee, baseAmount, min){
    const user = await getSumOfWorkedHours(year-1);
    const rows = [];
    for(let i = 0; i < user.length; i++){
        let total = baseAmount - (Math.floor(user[i].time*7).toFixed(2));
        if(total < min){
            total = min;
        }
        let arr = [user[i].lastname + " " + user[i].firstname, baseAmount.toFixed(2), user[i].time.toFixed(2), Math.floor(user[i].time*hourlyFee).toFixed(2), total.toFixed(2)];
        rows.push(arr);
    }
    return rows;
}

async function createMembershipWorkbook(year,hourlyFee, baseAmount,min){
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Mitgliedsbeitrag');
    const cols = ["Name", "Grundbetrag", "Verrichtete Arbeit in Stunden", "Abzug", "GESAMT"];
    const rows = await prepareRows(year,hourlyFee, baseAmount,min);

    sheet.addTable({
        name: 'Mitgliedsbeitrag_'+ year,
        ref: 'B2',
        headerRow: true,
        totalsRow: true,
        style: {
            theme: 'TableStyleMedium9',
            showRowStripes: true,
        },
        columns: cols.map(col => {
            return { name: col };
        }),
        rows: rows,
    })

    sheet.columns.forEach((col, index) => {
        let maxLength = 10; // Minimum width
        col.eachCell({ includeEmpty: true }, cell => {
        const value = cell.value ? cell.value.toString() : '';
        if (value.length > maxLength) maxLength = value.length;
        });
        col.width = maxLength + 2; // +2 für etwas Abstand
    });
    return workbook;
}

module.exports = {
    createActivityWorkbook,
    createMembershipWorkbook
}