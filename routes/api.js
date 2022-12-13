var express = require("express");
var router = express.Router();

const mqttDomain = "178.32.223.217";
const port = 80;
const mqttUri = `mqtt://${mqttDomain}`;
const options = {
    username: "groupe2",
    password: "groupe2",
    port,
    keepalive: 60,
};

const mqtt = require("mqtt").connect(mqttUri, options);

mqtt.on("connect", () => {
    console.log(`Connected to ${mqttUri}`);
    mqtt.subscribe("/groupe2/#", err => {
        if (!err) {
            console.log("Subscribed to /groupe2/#");
        } else {
            console.log("Error while subscribing to /groupe2/#");
        }
    });
});

const map = new Map();
mqtt.on("message", (topic, message) => {
    // console.log(`${topic}: ${message}`);
    map.set(topic, message.toString());
});

/* GET users listing. */
router.get("/", function (req, res, next) {
    // Make a JSON array from the map
    const json = jsonify(map);
    res.set("Access-Control-Allow-Origin", "*"); // Sets Access-Control-Allow-Origin response header
    res.status(200).json(json);
});

function jsonify(map) {
    return [...map.entries()].reduce((acc, [topic, message]) => {
        const nKey = topic.replace("/groupe2/", "");
        acc[nKey] = message;
        return acc;
    }, {});
}

module.exports = router;
