//const sql = require('mssql/msnodesqlv8')
//const express = require('express')
const Sequelize = require("sequelize");

const sequelizeConnection = new Sequelize({
    dialect: 'mssql',
    dialectModulePath: 'msnodesqlv8',
    operatorsAliases: false,
    connectionString: "server=.\\MSSQL2014;Database=LostIdentity;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}"
});

const Country = sequelizeConnection.define('country', {
    name: {
      type: Sequelize.STRING
    }
});
  
  // force: true will drop the table if it already exists
  Country.sync();