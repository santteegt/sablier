/* global artifacts */
const BigNumber = require("bignumber.js");

const Payroll = artifacts.require("./Payroll.sol");
const DAIToken = artifacts.require("./DAIToken.sol");

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Payroll);

  if (process.env.CI) {
    return;
  }
  if (!process.env.SABLIER_ADDRESS) {
    console.log("Please set the SABLIER_ADDRESS environment variable");
    return;
  }

  const payroll = await Payroll.deployed();
  const ownerAddress = accounts[0];
  const signerAddress = accounts[0];
  const sablierAddress = process.env.SABLIER_ADDRESS;
  const opts = { from: accounts[0] };
  await payroll.methods["initialize(address,address,address)"](ownerAddress, signerAddress, sablierAddress, opts);

  if (network !== "development") {
    return;
  }

  const allowance = new BigNumber(3600).multipliedBy(1e18).toString(10);
  await deployer.deploy(DAIToken);
  const erc20 = await DAIToken.deployed();
  await erc20.methods["initialize(string,string,uint8)"]("DAI", "DAI", "18");
  await erc20.mint(accounts[0], allowance);
};
