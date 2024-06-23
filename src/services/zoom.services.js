const pool = require('../models/DB');
const pgpool = require('../models/PGDB');
const date = require('date-and-time');

module.exports = {

    getAllRecordsFromDB: (user_id, callback) => {

        pgpool.query(
            `select * from zoom_recordings WHERE user_id = $1`,
            [      
                user_id,
            ],
            (err, res, fields) =>{
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                
                
                return callback(null, res.rows)
            }

        )
    },

    updateBackupStatusForUser: (user_id, truthy, callback) => {
        console.log('TRUETH', truthy)
        pgpool.query(
            `update users set backup_in_progress=$1 WHERE user_id=$2`,
            [
                truthy,       
                user_id,
            ],
            (err, res, fields) =>{
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                console.log(res.rowCount)
                return callback(null, res.rowCount)
            }

        )
    },

    fetchBackupEvent:(access,callback)=>{

        // check if account exist
        pgpool.query(
            `select * from zoom_recordings where backup_status = $1 AND user_id = $2`,
            [
                'completed',
                access.user_id
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                return callback(null, res.rowCount)
            }

        )
    },


    if_exists:(user_id,callback)=>{

        // check if account exist
        pgpool.query(
            `select * from user_zoom where user_id = $1`,
            [
                user_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }

                // console.log(res.rowCount)
                return callback(null, res)
     
            }

        )
    },

    fetch_user_zoom: (user_id, callback) => {
        console.log(user_id)
        pgpool.query(
            `select * from user_zoom where user_id = $1`,
            [
                user_id 
            ],
            (err, res, fields) =>{
                if (err) {
                    console.log(err)
                    return callback(err);
                }
                    return callback(null, res)
                
            }
        )

    },

    // -----------------------------------------
    // Supply this code below with which selected records to get for backup 
    // using the ID and user ID

    fetchRecordsForBackup: (access, ids, callback) => {
        if (ids.length === 0) {
            return callback(null, []); // No IDs to search for, return empty array
        }
    
        const queryString = `SELECT * FROM zoom_recordings WHERE user_id = $1 AND backup_status = $2 AND id = ANY($3)`;
        const queryParameters = [access.user_id, 'pending', ids];
    
        console.log('Executing query:', queryString);
        console.log('Query parameters:', queryParameters);
    
        pgpool.query(
            queryString,
            queryParameters,
            (err, res, fields) => { 
                if (err) {
                    console.error('Error executing query:', err);
                    return callback(err);
                }
    
                    let totalSize = 0;
                    if (res.rows.length > 0) {
                        totalSize = res.rows.reduce((acc, row) => acc + parseInt(row.size), 0);
                    }

                return callback(null, { rows: res.rows, totalSize });
            }
        );
    },
    
    
    update_zoom_recordings: (user_id, record_id, callback) => {
        console.log('updat DB', record_id)
        pgpool.query(
            `update zoom_recordings set backup_status=$1 WHERE id=$2`,
            [
                'completed',
                record_id,
            
                
            ],
            (err, res, fields) =>{

                if(err){
                    return callback(err);
                }
              
              
                return callback(null, record_id)
            }

        )
    },

    checkDrive: (access, callback) => {
        pgpool.query(
            `SELECT * FROM user_zoom WHERE user_id = $1`,
            [
                access.user_id
            ],
            (err, res, fields) => { 
                if(err){
                    return callback(err);
                }

                return callback(null, res.rows)

            }
        )
    },

    store_recordings_data: (record,user_id,size,batch_id, callback) => { 
        // Check if the UUID already exists in the recording_data JSONB column
        pgpool.query(
            `SELECT id FROM zoom_recordings WHERE recording_data @> $1`,
            [
                { uuid: record.uuid }  
            ],
            (err, res) => {
                if (err) {
                    console.error('Error checking UUID in recording_data:', err);
                    return callback(err);
                }
    
                if (res.rows.length > 0) {
                    // UUID already exists, do not insert
                    // console.log('UUID already exists in recording_data:', record.uuid);
                    return callback(null, { message: 'UUID already exists in recording_data' });
                } else {
                    // console.log(record)
                    // UUID does not exist, proceed with the insertion
                    pgpool.query(
                        `INSERT INTO zoom_recordings(recording_data,user_id, size, batch_id) VALUES ($1, $2, $3, $4)`,
                        [
                            record,
                            user_id,
                            size,
                            batch_id
                        ],
                        (err, res) => {
                            if (err) {
                                console.error('Error inserting recording_data:', err);
                                return callback(err);
                            }
                            console.log('Recording data inserted successfully:', record);
                            return callback(null, res);
                        }
                    );
                }
            }
        );
    }
,    
    save_user_zoom:(zoomData,user_id,zoom_user_id,callback)=>{

        // check if account exist
        pgpool.query(
            `select * from user_zoom where user_id = $1`,
            [
                user_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                
                console.log(res.rowCount)
                if(res.rowCount < 1){
                    insert()
                    return callback(null, res.rows.length)
                }else{
                    update()
                    return callback(null, res.rows.length)
                }
            }

        )
            const insert = ()=>{
                pgpool.query(
                    `insert into user_zoom(
                        user_id,
                        refresh_token,
                        access_token,
                        expires_in,
                        token_type,
                        scope,
                        zoom_user_id
                       ) values($1,$2,$3,$4,$5,$6,$7)`,
                    [
                        user_id,
                        zoomData.data.refresh_token,
                        zoomData.data.access_token,
                        zoomData.data.expires_in,
                        zoomData.data.token_type,
                        zoomData.data.scope,
                        zoom_user_id
                        
                       
                    ],
                    (err, res, fields) =>{
                        
                        if(err){
                            console.log('zoom'+ err)
                            return callback(err);
                        }
                        console.log('zoom'+ res)
                        return callback(null, res)
                        
                   
                    },
                )
            }
            const update = ()=>{
                console.log('updating')
                console.log(zoom_user_id)
                pgpool.query(
                    'update user_zoom set refresh_token=$1,access_token=$2,expires_in=$3,token_type=$4,scope=$5,zoom_user_id=$6 WHERE user_id = $7',       
                    [
                     
                        zoomData.data.refresh_token,
                        zoomData.data.access_token,
                        zoomData.data.expires_in,
                        zoomData.data.token_type,
                        zoomData.data.scope,
                        zoom_user_id,
                        user_id
                      
                        
                       
                    ],
                    (err, res, fields) =>{
                        
                        if(err){
                            console.log('zoom'+ err)
                            return callback(err);
                        }
                      
                    },
                )
            }

    }
}