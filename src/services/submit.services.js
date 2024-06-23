const pool = require("../models/DB");
const pgpool = require("../models/PGDB");
const date = require("date-and-time");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
// Generate a new UUID

module.exports = {
  getSubmittedRecordById: (r_id, callback) => {
    pgpool.query(
      `select * from form_records where record_id = $1`,
      [r_id],
      (err, res, fields) => {
        if (err) {
          return callback(err);
        }
        return callback(null, res.rows[0]);
      }
    );
  },

  getPageName: (body, callback) => { 
    pgpool.query(
      `SELECT record_data->'otherData'->>'page_name' AS page_name FROM form_records WHERE record_id = $1`,
      [body.record_id],
      (err, res) => {
        if (err) {
          return callback(err);
        } else if (res.rows.length > 0) {
          callback(null, res.rows[0].page_name);
        } else {
          callback(new Error('No record found'));
        }
      }
    );
  },

  submitFormReplies: (body, uniqueId, callback) => {
    // get user id
    function getUserId() {
      pgpool.query(
        `select user_id from form_records where record_id = $1`,
        [body.record_id],

        (err, res, fields) => {
          if (err) {
            return callback(err);
          } else if (res.rows.length > 0) {
            getUserDetails(res.rows);
          }
        }
      );
    }

    function getUserDetails(uid) {
      pgpool.query(
        `select * from users where user_id = $1`,
        [uid[0].user_id],

        (err, res, fields) => {
          // console.log(res.rows)
          if (err) {
            return callback(err);
          } else if (res.rows.length > 0) {
            updateCount(res.rows)
          }
        }
      );
    }

    function updateCount(userRows) {
      let count = 0;
      if (body.status !== "pending") {
        count = 1;
      }
      pgpool.query(
        `update form_records set count_submissions= count_submissions + $1 WHERE record_id = $2 `,
        [count, body.record_id],

        (err, res, fields) => {
          // console.log(res.rows)
          if (err) {
            return callback(err);
          }
          return callback(null, userRows);
     ;
        }
      );
    }

    function submitForm() {
      const currentDate = new Date();

      pgpool.query(
        `insert into submitted_records(submitted_data, created_at, drive_email, record_id, status, submitted_id) values($1,$2,$3,$4,$5,$6)`,
        [
          body.json_replies,
          currentDate,
          body.drive_email,
          body.record_id,
          body.status,
          uniqueId,
        ],

        (err, res, fields) => {
          if (err) {
            return callback(err);
          }
          getUserId();
        }
      );
    }
    submitForm();
  },

  submitAndUpdate: async (body, callback) => {
    fileLinks = JSON.stringify(body.fileLinks);
    replyLinks = JSON.stringify(body.replyLinks);
    if (fileLinks.length < 1) {
      fileLinks = [{ default: null }];
    }
    console.log("###########################################");
    console.log(body);
    console.log("###########################################");
    console.log(body.submit_id);
    console.log(fileLinks.length);
    console.log(body.replyLinks);

    pgpool.query(
      `update submitted_records set file_urls = $1, status = $2, reply_links = $3 WHERE submitted_id = $4`,
      [fileLinks, "completed", replyLinks, body.submit_id],
      (err, res, fields) => {
        if (err) {
          console.log(err);
          return callback(err);
        }
        console.log("work");
        console.log(res.rowCount);
        return callback(null, res.rows);
      }
    );
  },
};
