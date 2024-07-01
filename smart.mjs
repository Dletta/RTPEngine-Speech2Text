import { Whisper } from "smart-whisper"
import { decode } from "node-wav"
import fs from "node:fs"
import chokidar from 'chokidar'
import * as hep_client from './hep.js'
import * as config from './config.js'

console.log(config)

if (config.hep_config) {
hep_client.init(config.hep_config);
console.log('HEP Client ready!');
}

const watcher = chokidar.watch(process.env.META_PATH, {ignored: /^\./, persistent: true });

watcher
    .on('error', function(error) {
                console.error('Error happened', error);
        })
    .on('add', function(path) {
                console.log('File', path, 'has been added');
        })
    // .on('change', function(path) {console.log('File', path, 'has been changed'); })
    .on('unlink', async function(path) {
                console.log('File', path, 'has been removed');
                if(path.endsWith('.meta')) {
                        let pathArray = path.split('/')
                        let fileName = pathArray[pathArray.length - 1]
                        var newpath = fileName.replace(/\.meta/i, '-mix.wav');
                        newpath = process.env.REC_PATH + '/' + newpath
                        console.log(newpath)
                        try {
                                var xcid = path.match(/\/([^\/]+)\/?\.meta$/)[1].split('-')[0];
                        } catch(e) {
                                console.log(e);
                        }
                        // Get file timestamp, detection is delayed
                        var stats = fs.statSync(newpath);
                        var datenow = stats.mtime ? new Date(stats.mtime).getTime() : new Date().getTime();
                        var t_sec = Math.floor( datenow / 1000);
                        var u_sec = ( datenow - (t_sec*1000))*1000;
                        console.log('Meta Hit! Seeking Audio at: ', newpath);

                        const model = process.argv[2];
                        const wav = process.argv[3];

                        const whisper = new Whisper(model, { gpu: false });
                        const pcm = read_wav(wav);

                        const task = await whisper.transcribe(pcm, { language: "auto" });
                        console.log(await task.result);

                        const transcript = task.result

                        if (transcript) {
                                for (let index = 0; index < transcript.length; index++) {
                                        const utterance = transcript[index];
                                        if (hep_client){
                                                console.log('Sending HEP...');
                                                try {
                                                        var payload = utterance;
                                                                payload.timestamp = new Date();
                                                                payload.CallID = xcid;

                                                        var message = {
                                                                rcinfo: {
                                                                        type: 'HEP',
                                                                        version: 3,
                                                                        payload_type: 100,
                                                                        time_sec: t_sec,
                                                                        time_usec: u_sec,
                                                                        ip_family: 2,
                                                                        protocol: 17,
                                                                        proto_type: 100,
                                                                        srcIp: '127.0.0.1',
                                                                        dstIp: '127.0.0.1',
                                                                        srcPort: 0,
                                                                        dstPort: 0,
                                                                        captureId: 2999,
                                                                        capturePass: 'SPEECH-TO-HEP',
                                                                        correlation_id: xcid
                                                                },
                                                                        payload: JSON.stringify(payload)
                                                        };
                                                        hep_client.preHep(message);
                                                } catch(e) {
                                                        console.log(e);
                                                }
                                        }
                                }
                        }

                        await whisper.free();
                        console.log("Manually freed");

                        function read_wav(file) {
                            const { sampleRate, channelData } = decode(fs.readFileSync(file));

                            if (sampleRate !== 16000) {
                                throw new Error(`Invalid sample rate: ${sampleRate}`);
                            }
                            if (channelData.length !== 1) {
                                throw new Error(`Invalid channel count: ${channelData.length}`);
                            }

                            return channelData[0];
                        }
                        
                }
    });

var exit = false;
process.on('SIGINT', function() {
  console.log();
  if (exit) {
    console.log("Exiting...");
    process.exit();
  } else {
    console.log("Press CTRL-C within 2 seconds to Exit...");
    exit = true;
    setTimeout(function () {
      exit = false;
    }, 2000);
  }
});

