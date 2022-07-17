const Contacts = artifacts.require("./Event.sol");

module.exports = function (deployer) {
    deployer.deploy(Contacts);
};