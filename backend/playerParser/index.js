const fs = require('fs');
const rawData = fs.readFileSync('../python/PlayerEntries/1986753.json', 'utf8');

const data = JSON.parse(rawData);

const getPlayerCount = () => {
    return Object.keys(data.playerData).length;
}

const getPlayerData = () => {
    return data.playerData
}

const getOutlierData = () => {
    return data.outliers
}

const getOutliersWinsPositive = () => {
    return data.outliers.outlierWinsPositive
}

const getOutliersPositiveTotalGames = () => {
    return data.outliers.outlierTotalsPositive
}

const getOutliersNegativeWinRate = () => { 
    return data.outliers.outliersWinsNegative
}

const getOutliersNegativeTotalGames = () => {
    return data.outliers.outliersTotalNegative
}

const getOutliersHighWinLowGames = () => {
    return data.outliers.highWinLowGames
}

const getLowWinLowGames = () => {
    return data.outliers.lowWinLowGames
}

console.log(getOutliersHighWinLowGames())