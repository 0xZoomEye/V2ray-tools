#!/usr/bin/env node
const request = require("./utils/request");
const { default: produce } = require("immer");

// generate port from 10800 to 65535
function getRandomPort(min = 10800) {
  return min + Math.floor(Math.random() * (65535 - min));
}

function getTag(data) {
  return `${data.ps}-${data.add}-${data.port}`;
}

async function getSubscribe(url) {
  const res = await request(url);
  const buffer = Buffer.from(res, "base64");
  const vmesses = buffer.toString().trim().split("\r\n");
  return vmesses;
}

function streamSettings(config, data) {
  config.network = data.net;

  if (data.tls === "tls") {
    config.security = "tls";
    if (data.host) config.tlsSettings.serverName = data.host;
  }

  if (data.net === "kcp") {
    const { kcpSettings } = config;
    kcpSettings.header.type = data.type;
  } else if (data.net === "ws") {
    const { wsSettings } = config;
    if (data.host) wsSettings.headers.Host = data.host;
    if (data.path) wsSettings.path = data.path;
  } else if (data.net === "h2") {
    const { httpSettings } = config;
    if (data.host) httpSettings.host = data.host.split(",");
    httpSettings.path = data.path;
  } else if (data.net === "quic") {
    const { quicSettings } = config;
    quicSettings.security = data.host;
    quicSettings.key = data.path;
    quicSettings.header.type = data.type;
  } else if (data.net === "tcp") {
    if (data.type === "http") {
      const { tcpSettings } = config;
      tcpSettings.header.request.headers.Host = data.host;
      tcpSettings.header.request.path = [data.path];
    }
  } else {
  }
}

function vmess(config, data) {
  const [vnext] = config.settings.vnext;
  const [user] = vnext.users;
  vnext.address = data.add;
  vnext.port = data.port * 1;
  user.id = data.id;
  user.alterId = data.aid * 1;
  config.protocol = "vmess";
  config.tag = getTag(data);
}

function setOutbound(config, data) {
  if (data.protocol === "vmess") {
    vmess(config, data);
  }
  // streamSettings(config.streamSettings, data);
}

function parseVMess(url) {
  if (!url) return;
  const { protocol, host } = new URL(url);
  const pureProto = protocol.split(":")[0];
  if (pureProto !== "vmess") return;

  const vmDec = Buffer.from(host, "base64").toString();
  if (!vmDec) return;

  return { protocol: pureProto, ...JSON.parse(vmDec) };
}

function vmess2config({ base, url, port, listen }) {
  const baseConfig = require(base);
  return produce(baseConfig, (config) => {
    const data = parseVMess(url);
    const {
      inbounds: [inbound],
      outbounds: [outbound],
    } = config;

    if (port) inbound.port = port;
    if (listen) inbound.listen = listen;
    setOutbound(outbound, data);
  });
}

async function vmesses2PoolConfig({ base, url }) {
  const baseConfig = require(base);
  const urls = await getSubscribe(url);

  return produce(baseConfig, (config) => {
    const {
      inbounds: [inbound],
      outbounds: [outbound],
      routing: {
        rules: [rule],
      },
    } = config;

    const inbounds = [],
      outbounds = [],
      rules = [];
    urls.forEach((url) => {
      const data = parseVMess(url);
      const tag = getTag(data);
      const port = getRandomPort();
      inbounds.push(
        produce(inbound, (item) => {
          item.port = port;
          item.tag = tag;
        })
      );
      outbounds.push(
        produce(outbound, (item) => {
          setOutbound(item, data);
        })
      );
      rules.push(
        produce(rule, (item) => {
          item.inboundTag = tag;
          item.outboundTag = tag;
        })
      );
    });

    config.inbounds = inbounds;
    config.outbounds = outbounds;
    config.routing.rules = rules;
  });
}

module.exports = {
  vmess2config,
  vmesses2PoolConfig,
};
