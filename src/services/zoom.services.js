const pool = require('../models/DB');
const pgpool = require('../models/PGDB');
const date = require('date-and-time');

module.exports = {

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

    fetch_user_zoom:(user_id,callback)=>{
        pgpool.query(
            `select * from user_zoom where user_id = $1`,
            [
                user_id 
            ],
            (err, res, fields) =>{
                if(err){
                    return callback(err);
                }
                    return callback(null, res)
                
            }
        )

    },

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