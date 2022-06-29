#!/usr/bin/env node

const findDefaultConfig = require("./utils/findDefaultConfig");

function vmess2ConfigArgs(yargs) {
  return yargs
    .option("base", {
      default: findDefaultConfig(),
      describe: "base v2ray config file path",
    })
    .option("url", {
      describe: "vmess url",
      demandOption: true,
    })
    .option("port", {
      type: "number",
      default: 10800,
      describe: "port for listen",
    })
    .option("listen", {
      describe: "listen interface",
    });
}

function vmessPoolArgs(yargs) {
  return yargs
    .option("base", {
      default: findDefaultConfig(),
      describe: "base v2ray config file path",
    })
    .option("url", {
      describe: "vmess subscribe url",
      demandOption: true,
    })
    .default("v2ray-path", "v2ray");
}

function vmess2ConfigHandler(argv) {
  const { vmess2config } = require("./vmess2config");
  const config = vmess2config(argv);
  console.log(JSON.stringify(config, null, 2));
}

async function vmessPoolHandler(argv) {
  const { vmesses2PoolConfig } = require("./vmess2config");
  const config = await vmesses2PoolConfig(argv);
  console.log(JSON.stringify(config, null, 2));
}

require("yargs")
  .command("vmess2config", "convert vmess url into v2ray config", vmess2ConfigArgs, vmess2ConfigHandler)
  .command("poolconfig", "convert subscribe url into proxy pool config", vmessPoolArgs, vmessPoolHandler)
  .help().argv;
