import cron from "cron";
import https from "https";

// This cron job is set to run every 14 minutes and sends a GET request to the specified API URL.
const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => {
      console.error("Error with GET request:", e);
    });
});

export default job;

//CRON job explanation
// The cron job is set to run every 14 minutes (*/14 * * * *).
