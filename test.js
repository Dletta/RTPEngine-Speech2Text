const {exec} = require('node:child_process')
const chokidar = require('chokidar');
/*
exec('"/usr/src/dletta-rtp/node_modules/nodejs-whisper/cpp/whisper.cpp/main"  -ml 20 -sow true -l auto -m /usr/src/dletta-rtp/node_modules/nodejs-whisper/cpp/whisper.cpp/models/ggml-base.en.bin  -f /tmp/recording/1-3806367%40172.93.49.177-4f66998d51e762bd-mix.wav', function(err, stdout, stderr) {
        console.log('LOG:', err, stdout, stderr)
})
*/

async function main () {
const transcriptPromise =  new Promise((resolve, reject) => {
                                exec('"/usr/src/dletta-rtp/node_modules/nodejs-whisper/cpp/whisper.cpp/main"  -ml 20 -sow true -l auto -m /usr/src/dletta-rtp/node_modules/nodejs-whisper/cpp/whisper.cpp/models/ggml-base.en.bin  -f /tmp/recording/1-3806367%40172.93.49.177-4f66998d51e762bd-mix.wav', function(err, stdout, stderr) {
                                const obj = {
                                        err,
                                        stdout,
                                        stderr
                                }
                                resolve(obj)
                                })
                        })
console.log( await transcriptPromise) }

main()