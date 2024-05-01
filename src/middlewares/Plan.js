const {google} = require('googleapis');
const shortid = require("shortid");
const dotenv = require('dotenv');
const date = require('date-and-time');
// plan errors range from 600 - 602

module.exports = {
    checkLinkExpire: (req, res, next) => {
        let access = res.decoded_access
        // Get user plan

        if (access.plan == 1) { // free plan
            return res.status(600).json({
                error: 1,
                message: "Youre on a free, you cannot perform this action",
            });

        } else if (access.plan == 2) { // plus plan
            res.planAccess = 'plus'
            next();
        } else if (access.plan == 3) { // future plan
            return res.status(601).json({
                error: 1,
                message: "Youre on a future, you cannot perform this action",
            });
        } else { //  No plan, cannot exist
            return res.status(602).json({
                error: 1,
                message: "Youre on no plan you cannot perform this action ",
            });
        }
     
    },
}