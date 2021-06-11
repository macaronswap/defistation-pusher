require("dotenv").config();
import axios from "axios";
import Signale from "signale";
var Cron = require("node-cron");

const clientID = process.env.DEFISTATION_API_CLIENT_ID;
const clientSecret = process.env.DEFISTATION_API_CLIENT_SECRET;

let authorizationBasic: string;
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
        if (data.updated_at) {
          delete data.updated_at;
        }
        postTVLData(data)
          .then((resp: any) => {
            Signale.success(
              `TVL data posted successfully @[${new Date().toISOString()}]
              Status: ${resp.status}`,
            );
          })
          .catch((e: any) => {
            Signale.error(
              `TVL data can't posted skipping @[${new Date().toISOString()}] 
              Error: ${e}`,
            );
          });
      } else {
        Signale.error(
          `TVL data came empty from MacaronSwap api @[${new Date().toISOString()}]`,
        );
      }
    })
    .catch((e: any) => {
      Signale.error(
        `TVL data can't fetched skipping @[${new Date().toISOString()}]
        Error: ${e}`,
      );
    });
};

const getTVLData = async () => {
  if (process.env.MACARONSWAP_API_TVL_URL) {
    const apiTVLURL = process.env.MACARONSWAP_API_TVL_URL;
    Signale.start(`Starting api TVL fetch @[${new Date().toISOString()}]`);
    Signale.time("Api TVL Fetch");
    try {
      const response = await axios.get(apiTVLURL);
      Signale.timeEnd("Api TVL Fetch");
      return response.data;
    } catch (e) {
      Signale.timeEnd("Api TVL Fetch");
      Signale.error(
        `An error occured when trying to fetch MacaronSwap TVL from url: ${apiTVLURL} @[${new Date().toISOString()}]
          ${e}`,
      );
      throw e;
    }
  } else {
    Signale.fatal(
      "MacaronSwap Api TVL URL does not exist in env variables. Can't fetch!",
    );
    process.exit(1);
  }
};

const postTVLData = async (data: any) => {
  if (process.env.DEFISTATION_API_TVL_URL) {
    const apiTVLURL = process.env.DEFISTATION_API_TVL_URL;
    Signale.start(`Starting api TVL post @[${new Date().toISOString()}]`);
    Signale.time("Api TVL Post");
    try {
      const resp = await axios.post(apiTVLURL, data, {
        headers: {
          Authorization: `Basic ${authorizationBasic}`,
        },
      });
      Signale.timeEnd("Api TVL Post");
      return resp;
    } catch (e) {
      Signale.timeEnd("Api TVL Post");
      Signale.error(
        `An error occured when trying to post MacaronSwap TVL to url: ${apiTVLURL} @[${new Date().toISOString()}]
          ${e}`,
      );
      throw e;
    }
  } else {
    Signale.fatal(
      "DefiStation Api TVL URL does not exist in env variables. Can't fetch!",
    );
    process.exit(1);
  }
};
