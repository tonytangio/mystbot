import Discord from "discord.js";
import secret from "../config/secret";

const client = new Discord.Client();

client.once("ready", () => {
  console.log("mystbot Ready!");
});

client.login(secret.token);
