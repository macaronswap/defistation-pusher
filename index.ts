require("dotenv").config();
import axios from "axios";
import Signale from "signale";
var Cron = require("node-cron");

const clientID = process.env.DEFISTATION_API_CLIENT_ID;
const clientSecret = process.env.DEFISTATION_API_CLIENT_SECRET;

let authorizationBasic;
if (clientID && clientSecret) {
  authorizationBasic = Buffer.from(
    clientID + ":" + clientSecret,
    "binary",
  ).toString("base64");
  Signale.success("Auth Base64 created successfully");
} else {
  Signale.fatal(
    "ClientID or ClientSecret is empty on env variables. Cannot continue!",
  );
  process.exit(1);
}

Signale.start(`Initalized DefiStation Pusher @[${new Date().toISOString()}]`);
Cron.schedule("50 * * * *", () => {
  // Fetches data at *:50
  taskRunner();
});

const taskRunner = async () => {
  getTVLData()
    ?.then((data: any) => {
      if (data) {
        Signale.success(
          `TVL data fetched successfully @[${new Date().toISOString()}]`,
        );
        Signale.success(
          `TVL data pushed to DefiStation successfully @[${new Date().toISOString()}]`,
        );
      } else {
        Signale.error(
          `TVL data came empty from MacaronSwap api @[${new Date().toISOString()}]`,
        );
      }
    })
    .catch((e: any) => {
      Signale.error(
        `TVL data can't fetched skipping @[${new Date().toISOString()}]`,
      );
    });
};

const getTVLData = () => {
  if (process.env.MACARONSWAP_API_TVL_URL) {
    const apiTVLURL = process.env.MACARONSWAP_API_TVL_URL;
    Signale.start(`Starting api TVL fetch @[${new Date().toISOString()}]`);
    Signale.time("Api TVL Fetch");
    return axios
      .get(apiTVLURL)
      .then((response: any) => {
        Signale.timeEnd("Api TVL Fetch");
        return response.data;
      })
      .catch((e: any) => {
        Signale.timeEnd("Api TVL Fetch");
        Signale.error(
          `An error occured when trying to fetch MacaronSwap TVL from url: ${apiTVLURL} @[${new Date().toISOString()}]
          ${e}`,
        );
        throw e;
      });
  } else {
    Signale.error(
      "MacaronSwap Api TVL URL does not exist in env variables. Can't fetch!",
    );
  }
};

//TODO: Implement sending data to DefiStation
const postTVLData = () => {};
