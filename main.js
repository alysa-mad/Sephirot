const { response } = require('express');
const express = require('express');
const app = express();
const colors = require('colors');
var fs = require('fs');

const default_config = {
    interval: "300",
    tracker_id: "thatsitwhatyoulookinghere",
    port: 9797
};

var config_path = "config.json";
try {
    if(fs.existsSync(config_path)) {
        console.log("[debug]".green, "Config file found, loading...");
        var l_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    } else {
        console.log("[debug]".green, "Config file not found, creating a default one...");
        var l_config = default_config;
        try{
            fs.writeFileSync('config.json', JSON.stringify(default_config, null, 4), 'utf8');
        }catch (e){
            console.error("[error]".red,"Cannot write config file ", e);
        }
    };
} catch (e) {
    console.error("[error]".red,"Cannot read config file ", e);
};

app.use(
    express.urlencoded({
        extended: true
    }));

app.use(express.json());

class peer{
    constructor(peer_id, ip, port){
        this.peer_id = peer_id;
        this.ip = ip;
        this.port = port;
    }
    get(){
        const peer_get = {
            "peer_id": this.peer_id,
            "ip": this.ip,
            "port": this.port
        };
        return peer_get;
    }
}

class torrent{
    constructor(info_hash=undefined, peers=[], data={}, loaded=[], complete=[], incomplete=[]){
        this.info_hash = info_hash;
        this.peers = peers;
        this.data = {
            complete: complete,
            incomplete: incomplete 
        };
        this.loaded = loaded;
    }
    get(){
        return {info_hash: this.info_hash,peers: this.peers,data: this.data, loaded: this.loaded}
    }
};

class encode_config{
    constructor(interval="300", tracker_id="thatsitwhatyoulookinghere", complete=0, incomplete=0, peers="le"){
        this.interval = interval;
        this.tracker_id = tracker_id;
        this.complete = complete;
        this.incomplete = incomplete;
        this.peers = peers;
    };
    encode(){
        const obj_config = "d" +  "8" + ":" + "interval" + "i" + this.interval + "e" + "10" + ":" + "tracker id" + this.tracker_id.length + ":" + this.tracker_id + "8" + ":" + "complete" +  "i" + this.complete + "e" + "10" + ":" + "incomplete" + "i" + this.incomplete + "e" + "5" + ":" + "peers" + this.peers + "e";
        return obj_config
    }
};


var torrents = [];

setInterval(() => {
    torrents.forEach((torrent) => {
        torrent.loaded = []
    });
}, 15000);
setInterval(() => {
    console.log("[debug]".green,"clearing peer list.")
    torrents.forEach((torrent) => {
        torrent.peers = []
    });
}, 200000);
app.get('/announce', (req, res) => {
    const get_request = req;
    var loaded_torrent;
    torrents.forEach((torrent) => {if(torrent.info_hash === get_request['query'].info_hash){
        loaded_torrent = torrent;
    }});
    if(loaded_torrent === undefined){
        console.log("[debug]".green,"torrent data not found, creating...");
        loaded_torrent = new torrent(get_request['query'].info_hash).get();
        torrents.push(loaded_torrent);
    }
    if(loaded_torrent.loaded.includes(get_request['query'].peer_id)){}else{
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    const peers = loaded_torrent.peers;
    peers.push(new peer(get_request['query'].peer_id, ip.split("::ffff:").pop(), get_request['query'].port).get());
    /* console.log(get_request['query']); */

    var pp = [];
    pp.push("l");
    if(get_request['query'].left == 0 && loaded_torrent.data.complete.includes(get_request['query'].peer_id) == false){
        loaded_torrent.data.complete.push(get_request['query'].peer_id);
        if(loaded_torrent.data.incomplete.includes(get_request['query'].peer_id)){
            if(loaded_torrent.data.incomplete.indexOf(get_request['query'].peer_id) != -1){
                delete loaded_torrent.data.incomplete[loaded_torrent.data.incomplete.indexOf(get_request['query'].peer_id)];
            }
        }
    }
    else if(get_request['query'].left != 0 && loaded_torrent.data.incomplete.includes(get_request['query'].peer_id) == false){
        loaded_torrent.data.incomplete.push(get_request['query'].peer_id);
        if(loaded_torrent.data.complete.includes(get_request['query'].peer_id)){
            if(loaded_torrent.data.complete.indexOf(get_request['query'].peer_id) != -1){
                delete loaded_torrent.data.complete[loaded_torrent.data.complete.indexOf(get_request['query'].peer_id)];
            }
        }
    }
    var tracker_incomplete = loaded_torrent.data.incomplete.length;
    var tracker_complete = loaded_torrent.data.complete.length;
    const process = peers.forEach((peer) => {
        if(peer.ip.includes(":")){
            peer.ip = peer.ip.split(":").join("");
        }
        st_dict = "d";
        proc = st_dict + "2" + ":" + "ip" + peer.ip.length + ":" + peer.ip + "7" + ":" + "peer id" + peer.peer_id.length + ":" + peer.peer_id + "4" + ":" + "port" + "i" + peer.port + "e" + "e";
        pp.push(proc);
    })
    pp.push("e");
    const processed_peers = pp.join("");
    const config = new encode_config(l_config.interval, l_config.tracker_id, tracker_complete, tracker_incomplete, processed_peers);
    enconded_response = config.encode()
    console.log("______________________________");
    const info_hash = loaded_torrent.info_hash.replace("~", "7e").split("%").join("");
    console.log("[torrent] info_hash:".red, info_hash);
    console.log("[connection]".yellow,"connection called by peer:", get_request['query'].peer_id, "|","complete:", tracker_complete, "|", "incomplete:", tracker_incomplete, "|", "peers:", peers.length, "|");
    loaded_torrent.loaded.push(get_request['query'].peer_id);
    torrents.forEach((torrent) => {if(torrent.info_hash === get_request['query'].info_hash){
        torrent.peers=peers;
    }});
    console.log("[connection]".yellow,"response:", enconded_response);
    console.log("______________________________");
    res.send(enconded_response);
    }
});

app.listen(l_config.port, (e) => {if(e){console.error("[error]".red,"tracker failed to start.", e);} console.log("[debug]".green,"tracker started successfully and is listening to requests...");});