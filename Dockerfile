FROM node:20
ENV REC_PATH /recording
ENV META_PATH /meta
COPY . /app
WORKDIR /app
RUN  npm install
WORKDIR /app/node_modules/nodejs-whisper/cpp/whisper.cpp/models
RUN ./download-ggml-model.sh base.en
WORKDIR /app/node_modules/nodejs-whisper/cpp/whisper.cpp/
RUN make
WORKDIR /app
CMD ["nodejs", "speech2hep.js"]
