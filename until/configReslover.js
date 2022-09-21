const fs = require("node:fs")
module.exports = {
    async configReslover() {
        return new Promise(async (reslove) => {
            if (fs.existsSync("./config.js")) {
                let config = require("../config")
                let invaild = false;


                if (typeof config.TOKEN !== "string") {
                    console.log("`token`不是一個字串");
                    invaild = true;
                } else if (typeof config.UPDATE_EVERY_X_MINUTES !== "number") {
                    console.log("`UPDATE_EVERY_X_MINUTES`不是一個字串 是數字 `UPDATE_EVERY_X_MINUTES`: 1");
                    invaild = true;
                }
                if (invaild) {
                    console.log("設定出現錯誤，程式正在自動關閉");
                    process.exit(1);
                } else {
                    console.log("成功讀取設定");
                    reslove(config);
                }

            } else {
                console.log("找不到設定檔，正在從環境變數讀取");
                let config = {
                    TOKEN: process.env.TOKEN,
                    RIOT_USERNAME: process.env.RIOT_USERNAME,
                    RIOT_PASSWORD: process.env.RIOT_PASSWORD,
                    STATUS_BOARD_CHANNEL_ID: process.env.STATUS_BOARD_CHANNEL_ID,
                    STATUS_BOARD_MESSAGE_ID: process.env.STATUS_BOARD_MESSAGE_ID,
                    UPDATE_EVERY_X_MINUTES : process.env.UPDATE_EVERY_X_MINUTES,
                    Status: process.env.Status
                };
                let invaild = false;

                if (typeof config.TOKEN !== "string") {
                    console.log("`token`不是一個字串");
                    invaild = true;
                }else if (typeof Number(config.UPDATE_EVERY_X_MINUTES) !== "number") {
                    console.log("`UPDATE_EVERY_X_MINUTES`不是一個字串 是數字 `UPDATE_EVERY_X_MINUTES`: 1");
                    invaild = true;
                }
                if (invaild) {
                    console.log("設定出現錯誤，程式正在自動關閉");
                    process.exit(1);
                } else {
                    console.log("成功讀取設定");
                    reslove(config);
                }
            }
        })
    }
}