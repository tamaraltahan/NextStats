
import requests
import json
import time
import statistics

import os


class gameStats:

    APICalls = 0
    isRunning = False
    times = []
    matchesAnalysed = []

    def __init__(self, id):
        self.id = id
        self.getPrevDataIfExists(id)
        data = self.openRecentMatches()
        self.PIDs = self.getPlayersFromMatches(data)
        if not hasattr(self, 'playerData'):
            self.playerData = self.getPlayerWinRate(self.PIDs)
        else:
            self.playerData.update(self.getPlayerWinRate(self.PIDs))

        self.stats = self.getPlayerStats()
        self.outlierData = self.findOutliers(self.stats)

    def calcTime(self, start, end):
        total = end - start
        self.times.append(total)

    def openRecentMatches(self):
        url = 'https://api.opendota.com/api/players/{}/recentMatches'.format(self.id)
        self.APICalls += 1
        # Get the data from the API
        r = requests.get(url)
        # Convert the data to a JSON object
        recents = r.json()
        return recents

    def getPlayersFromMatches(self, data):
        start = time.perf_counter()
        """
        Returns all players ID's in the user's last 20 matches


        Args:
            id (int): player's steam32 ID
            data (JSON): JSON object of thee recentMatches API call

        Returns:
            pIDs: A list of non-duplicate player ID's in 20 game match history.
        """
        match_ids = []
        players = []
        pIDs = []

        # Loop through the matches and add the match ids to the list
        for match in data:
            match_ids.append(match['match_id'])

        # Loop through the match ids and get the player ids
        for match in match_ids:
            if match not in self.matchesAnalysed:
                url = 'https://api.opendota.com/api/matches/{}'.format(match)
                self.APICalls += 1
                r = requests.get(url)
                data = r.json()
                players.append(data['players'])
                self.matchesAnalysed.append(match)

        # Loop through the player ids and add them to the list
        # Conditions: not null, is not the same as player (user), and is not already in the list
        for player in players:
            for p in player:
                if p['account_id'] and p['account_id'] != self.id and p['account_id'] not in pIDs:
                    pIDs.append(p['account_id'])
        end = time.perf_counter()
        self.calcTime(start, end)
        return pIDs

    def getPlayerWinRate(self, pIDs):
        """
        Gets the winrate of all available players

        Args:
            pIDs (List): a list of player ID's


        Returns:
            WL (dict): Dictionary containing player's wins, losses, total games, and winrate percent
        """
        start = time.perf_counter()
        WL = {}
        counter = 0
        limit = len(pIDs)//4
        # Loop through the player ids and get the win/loss
        # this bit is just to keep from hitting the rate limit of API calls
        # would rather sacrifice some efficiency than deal with invalid requests
        for pID in pIDs:
            counter += 1
            if counter == limit:
                counter = 0
                time.sleep(20)

            url = 'https://api.opendota.com/api/players/{}/wl'.format(pID)
            self.APICalls += 1
            r = requests.get(url)
            data = r.json()
            WL[pID] = data

        corruptedPlayerKeys = []
        for player in WL:
            try:
                total = WL[player]['win'] + WL[player]['lose']
                assert total > 0
            except:
                # print('0 game player found')
                corruptedPlayerKeys.append(player)
            else:
                WL[player]['total'] = total

        for player in corruptedPlayerKeys:
            del (WL[player])

            # adds the win percent to the WL dictionary
        for player in WL:
            WL[player]['winPercent'] = round(
                (WL[player]['win']/WL[player]['total'])*100, 2)

        end = time.perf_counter()
        self.calcTime(start, end)
        return WL

    def findOutliers(self, stats):

        outliersWinsPositive = {}
        outliersTotalPositive = {}
        outliersWinsNegative = {}
        outliersTotalNegative = {}
        highWinLowGames = {}
        lowWinLowGames = {}

        # player data is organized as
        # Key: Player ID
        # Value: win , lose, total, winPercent

        # 1.5x std dev encapsulated 85% of players
        # meaning I'm 'flagging' anyone who's in the best and worst 15% of measured criterea
        winPercentThreshold = stats['stdWins'] * 1.5
        totalGamesThreshold = stats['stdTotal'] * 1.5

        for player, values in self.playerData.items():
            if values['winPercent'] >= stats['meanWins'] + winPercentThreshold:
                outliersWinsPositive[player] = values
            if values['total'] >= stats['meanTotal'] + totalGamesThreshold:
                outliersTotalPositive[player] = values
            if values['winPercent'] <= stats['meanWins'] - winPercentThreshold:
                outliersWinsNegative[player] = values
            if values['total'] <= stats['meanTotal'] - totalGamesThreshold:
                outliersTotalNegative[player] = values

        for player, values in self.playerData.items():
            if player in outliersWinsPositive and player in outliersTotalNegative:
                highWinLowGames[player] = values
            if player in outliersTotalNegative and player in outliersWinsNegative:
                lowWinLowGames[player] = values

        return {
            "outlierWinsPositive": outliersWinsPositive,
            "outlierTotalsPositive": outliersTotalPositive,
            "outliersWinsNegative": outliersWinsNegative,
            "outliersTotalNegative": outliersTotalNegative,
            "highWinLowGames": highWinLowGames,
            "lowWinLowGames": lowWinLowGames,
            "winPercentThreshold": round(winPercentThreshold, 2),
            "totalGamesThreshold": round(totalGamesThreshold)
        }

    def getPlayerStats(self):
        wins = []
        totalGames = []

        for player, value in self.playerData.items():
            wins.append(value['winPercent'])
            totalGames.append(value['total'])

        meanWin = round(statistics.mean(wins), 2)
        stdWins = round(statistics.stdev(wins), 2)
        meanTotal = round(statistics.mean(totalGames), 2)
        stdTotal = round(statistics.stdev(totalGames), 2)

        stats = {
            "meanWins": meanWin,
            "meanTotal": meanTotal,
            "stdWins": stdWins,
            "stdTotal": stdTotal
        }

        return stats

    def getData(self):
        retData = {
            "playerData": self.playerData,
            "outliers": self.outlierData,
            "Statistics": self.stats,
            "matchesAnalyzed": self.matchesAnalysed,
            "analyzedPlayers": self.setPlayerCount(),
            "APICalls": self.APICalls,
            "Times": self.times
        }

        r = json.dumps(retData)
        return r

    # EXPERIMENTAL

    def getPrevDataIfExists(self, id):
        path = f"./gamestats/backend/python/PlayerEntries/{id}.json"
        if os.path.exists(path):
            with open(path, 'r') as file:
                # Load the JSON data from the file
                data = json.loads(file.read())
                self.matchesAnalysed = data["matchesAnalyzed"]
                self.playerData = data['playerData']


    def getFullMatchHistory(self, id):
        url = f"https://api.opendota.com/api/players/{id}/matches"
        self.APICalls += 1
        r = requests.get(url)
        data = r.json()
        return data

    def setNMatches(self, n):
        data = self.getFullMatchHistory()
        return data[:n]



    def setPlayerCount(self):
        matches = len(self.matchesAnalysed)
        return {
            "totalPossible": matches*9,
            "analyzed": len(self.playerData)
        }


"""
if ./.../pid.json exists:
    prevData = fs.open(pid.json)
    fs.close()

for match in matches:
    if match not in matchesAnalysed:
        playerList.add(player)
        matchesAnalysed.add(matchID)

for player in PIDs:
    if player in 
        
 1. see if file exists
 2. if file exists, read it into memory
 3. run as normally BUT
    a. if match has already been analyzed, skip
 4. append all new data to existing data

 


 """


# json structure
"""
        playerData:
            {
            win: int
            lose: int
            total: int
            winPercent: float
            }
        
        outliers:
            {
            outlierWinsPositive: dictionary
            outlierTotalsPositive: dictionary
            outliersWinsNegative: dictionary
            outliersTotalNegative: dictionary
            highWinLowGames: dictionary
            lowWinLowGames: dictionary
            winPercentThreshold: dictionary
            totalGamesThreshold: dictionary
            }

        Statistics:
            {
            meanWins: float
            meanTotal: float
            stdWins: float
            stdTotal: float
            }
        APICalls:
            {
            APICalls: int
            }
        
        Times:
            {
            times: list
            }

        """
