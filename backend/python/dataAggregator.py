
import requests
import json
import time
import statistics
import os
import codecs

class gameStats:

    APICalls = 0
    isRunning = False
    times = []
    matchesAnalysed = []
    
    playerMatchIDs = dict()
    gamesRuined = 0
    
    # initialized in constructor
    """
    id: entered player ID
    PIDs: aggregated list of player ID's
    stats: dict
    outlierData: dict
    """
     
    def __init__(self, id):
        self.id = id
        self.getPrevDataIfExists(id)
        data = self.openRecentMatches()
        self.userInfo = self.getPlayersFromMatches(data)
        if not hasattr(self, 'playerData'):
            self.playerData = self.getPlayerWinRate(self.userInfo)
        else:
            self.playerData.update(self.getPlayerWinRate(self.userInfo))

        self.stats = self.getPlayerStats()
        self.outlierData = self.findOutliers(self.stats)
        self.removeDuplicates(self.playerData)
        self.gamesRuined = self.countMatchesWithOutliers()

    def calcTime(self, start, end):
        total = end - start
        self.times.append(total)

    def openRecentMatches(self):
        url = 'https://api.opendota.com/api/players/{}/recentMatches'.format(self.id)
        self.APICalls += 1
        r = requests.get(url)
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
            userInfo: A dictionary of non-duplicate player ID's in 20 game match history with usernames and ranks as values
        """
        match_ids = []
        players = []
        userInfo = dict()
        
        for match in data:
            match_ids.append(match['match_id'])

        for match in match_ids:
            if match not in self.matchesAnalysed:
                url = 'https://api.opendota.com/api/matches/{}'.format(match)
                self.APICalls += 1
                r = requests.get(url)
                data = r.json()
                players.append(data['players'])
                ranks = [player['rank_tier'] for player in data['players']]
                self.matchesAnalysed.append(match)
                
                player_ids = [player.get('account_id') for player in data['players'] if player.get('account_id') is not None]
                
                if match not in self.playerMatchIDs:
                    self.playerMatchIDs[match] = player_ids
                else:
                    self.playerMatchIDs[match].extend(player_ids)
            
                        
        # Loop through the player ids and add them to the list
        # Conditions: not null, is not the same as player (user), and is not already in the list
        for player in players:
            for p in player:
                # if p['account_id'] and p['account_id'] != self.id and p['account_id'] not in userInfo.keys():
                if p.get('account_id') and p.get('account_id') != self.id and p.get('account_id') not in userInfo.keys():
                    userInfo[p['account_id']] = {}
                    if p.get('personaname') is not None:
                        userInfo[p['account_id']]['userName'] = p['personaname'].encode().decode('unicode_escape')
                    else:
                        userInfo[p['account_id']]['userName'] = None
                    userInfo[p['account_id']]['rank'] = p['rank_tier']

                    
        end = time.perf_counter()
        self.calcTime(start, end)
        return userInfo
    
    
    
    def getPlayerWinRate(self, userInfo):
        """
        Gets the winrate of all available players

        Args:
            userInfo (dict): Dictionary of player IDs, usernames, and ranks


        Returns:
            userInfo (dict): Dictionary recieved appending with sub dictionary containing player's wins, losses, total games, winrate percent
        """
        start = time.perf_counter()
        counter = 0
        limit = len(userInfo)//4
        APILimiter = 20
        # Loop through the player ids and get the win/loss
        # this bit is just to keep from hitting the rate limit of API calls
        # would rather sacrifice some efficiency than deal with invalid requests
        for pID in userInfo.keys():
            counter += 1
            if counter == limit and len(userInfo) > APILimiter:
                counter = 0
                time.sleep(20)
                

            url = 'https://api.opendota.com/api/players/{}/wl'.format(pID)
            self.APICalls += 1
            r = requests.get(url)
            data = r.json()
            if pID not in userInfo:
                userInfo[pID] = {'win': int(data['win']), 'lose': int(data['lose'])}
            else:
                userInfo[pID].update({'win': int(data['win']), 'lose': int(data['lose'])})
                

        corruptedPlayerKeys = []
        for player in userInfo:
            try:
                total = userInfo[player]['win'] + userInfo[player]['lose']
                assert total > 0
            except:
                corruptedPlayerKeys.append(player)
            else:
                userInfo[player]['total'] = total

        for player in corruptedPlayerKeys:
            del (userInfo[player])
            
        for player in userInfo:
            userInfo[player]['winPercent'] = round(
                (userInfo[player]['win']/userInfo[player]['total'])*100, 2)

        end = time.perf_counter()
        self.calcTime(start, end)
        return userInfo

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

    def findOutliers(self, stats):

        stdDev = 1.5

        outliersWinsPositive = {}
        outliersTotalPositive = {}
        outliersWinsNegative = {}
        outliersTotalNegative = {}
        highWinLowGames = {}
        lowWinLowGames = {}
        winPercentThreshold = stats['stdWins'] * (stdDev)
        totalGamesThreshold = stats['stdTotal'] * (stdDev - 0.5)

        for player, values in self.playerData.items():
            if values['winPercent'] >= stats['meanWins'] + winPercentThreshold:
                outliersWinsPositive[player] = values
            if values['total'] >= stats['meanTotal'] + totalGamesThreshold:
                outliersTotalPositive[player] = values
            if values['winPercent'] <= stats['meanWins'] - winPercentThreshold:
                outliersWinsNegative[player] = values
            if values['total'] <= stats['meanTotal'] - totalGamesThreshold:
                outliersTotalNegative[player] = values

        for player1, values1 in self.playerData.items():
            if player1 in outliersWinsPositive and player1 in outliersTotalNegative:
                highWinLowGames[player1] = values1
            if player1 in outliersTotalNegative and player1 in outliersWinsNegative:
                lowWinLowGames[player1] = values1

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

    def getData(self):
        retData = {
            "playerData": self.playerData,
            "outliers": self.outlierData,
            "Statistics": self.stats,
            "matchesAnalyzed": self.matchesAnalysed,
            "analyzedPlayers": self.getAnalyses(),
            "APICalls": self.APICalls,
            "Times": self.times,
            "MatchesRuined" : self.gamesRuined
        }

        # r = json.dumps(retData, ensure_ascii=False)
        return retData

    def getPrevDataIfExists(self, id):
        path = f"../python/PlayerEntries/{self.id}.json"
        if os.path.exists(path):
            with open(path, 'r', encoding='utf8') as file:
                try:
                    data = json.loads(file.read())
                    self.matchesAnalysed = data["matchesAnalyzed"]
                    self.playerData = data['playerData']
                except json.decoder.JSONDecodeError:
                    print('Error decoding JSON from file')
        else:
            print('file not found')


    def getAnalyses(self):
        matches = len(self.matchesAnalysed)

        # counts
        countPlayers = len(self.playerData)
        countOutliers = self.countUniqueIds()
        countPossible = matches * 9
        # percentages
        analyzedPercent = round((countPlayers/countPossible) * 100, 2)
        anonPercent = round((100 - analyzedPercent), 2)
        outlierPercent = round(100*(countOutliers/countPlayers), 2)

        return {
            "matches": matches,
            "countPlayers": countPlayers,
            "countOutliers": countOutliers,
            "countPossible": countPossible,
            "analyzedPercent": analyzedPercent,
            "anonPercent": anonPercent,
            "outlierPercent": outlierPercent
        }

    def removeDuplicates(self, d):
        res = {}
        temp = {}

        for key, value in d.items():
            if key not in temp:
                temp[key] = 1
                res[key] = value
            else:
                temp[key] += 1
                res[key] = value

        return res

    def countUniqueIds(self):
        uniques = {}
        for key in self.outlierData:
            if isinstance(self.outlierData[key], dict):
                uniques.update(self.outlierData[key])
        self.removeDuplicates(uniques)
        return len(uniques)
    
    
    def decodeUsernames(self, encodedString):
        return codecs.decode(encodedString, 'unicode_escape')
        
      
    def saveData(self):
        path = f"../python/PlayerEntries/{self.id}.json"
        with open(path, 'w', encoding='utf8') as file:
            json.dump(self.playerData, file, ensure_ascii=False)

    # EXPERIMENTAL
    def getFullMatchHistory(self, id):
        url = f"https://api.opendota.com/api/players/{id}/matches"
        self.APICalls += 1
        r = requests.get(url)
        data = r.json()
        return data

    def setNMatches(self, n):
        data = self.getFullMatchHistory()
        return data[:n]
    
    def countMatchesWithOutliers(self):
        count = 0
        for match, players in self.playerMatchIDs.items():
            for player in players:
                if player in self.outlierData['highWinLowGames'].keys() or player in self.outlierData['lowWinLowGames'].keys():
                    count += 1
        return count
                            



# json structure
"""
        playerData:
            {
            userName: string
            rank: int
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

        matchesAnalyzed:
            list

        analyzedPlayers:
            "matches" : int,
            "countPlayers" : int,
            "countOutliers" : int,
            "analyzedPercent" : float,
            "anonPercent" : float

        APICalls:
            {
            APICalls: int
            }
        
        Times:
            {
            times: list
            }

        """
