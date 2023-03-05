
import requests
import json
import time
import statistics


class gameStats:

    APICalls = 0
    curState = ""
    isRunning = False
    times = []



    def __init__(self, id):
        self.id = id
        data = self.openRecentMatches()
        self.PIDs = self.getPlayersFromMatches(data)
        self.playerData = self.getPlayerWinRate(self.PIDs)


    def sentintel(self):
        prevState = self.curState
        while self.isRunning:
            if self.curState != prevState:
                prevState = self.curState

    def calcTime(self, start, end):
        total = end - start
        self.times.append(total)



    def openRecentMatches(self):
        self.curState = "Getting player data"
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

        self.curState = "Analyzing matches & retrieving all public dota profiles"

        match_ids = []
        players = []
        pIDs = []
        
        # Loop through the matches and add the match ids to the list
        for match in data:
            match_ids.append(match['match_id'])
        # Loop through the match ids and get the player ids
        for match in match_ids:
            url = 'https://api.opendota.com/api/matches/{}'.format(match)
            self.APICalls += 1
            r = requests.get(url)
            data = r.json()
            players.append(data['players'])
        
        # Loop through the player ids and add them to the list
        # Conditions: not null, is not the same as player, and is not already in the list
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
        self.curState = "Getting player win/loss data for all known players"
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

            # adds the win/loss to the WL dictionary
        for player in WL:
            WL[player]['total'] = WL[player]['win'] + WL[player]['lose']

            # adds the win percent to the WL dictionary
        for player in WL:
            WL[player]['winPercent'] = round((WL[player]['win']/WL[player]['total'])*100,2)

        end = time.perf_counter()
        self.calcTime(start, end)
        return WL
        
    def judgePlayers(self, playerData):
        accountBuyers = 0
        ABList = []
        smurfCount = 0
        smurfList = []
        totalGamesThreshold = 1000
        winThreshold = 55

        for player in playerData:
            if playerData[player]['total'] <= totalGamesThreshold:
                accountBuyers += 1
                ABList.append(player)
                if playerData[player]['winPercent'] >= winThreshold:
                    smurfCount += 1
                    smurfList.append(player)


    def findOutliers(self, stats):
        
        outliersWins = []
        outliersTotal = []
        sus = []

        for player in self.playerData:
            if player['winPercent'] >= stats['meanWins'] + stats['stdWins'] * 3:
                outliersWins.append(player)
            if player['total'] >= stats['meanTotal'] + stats['stdTotal'] * 3:
                outliersTotal.append(player)

        for player in self.playerData:
            if player in outliersTotal and player in outliersWins:
                sus.append(player)


    def getPlayerStats(self, playerData):
        wins = []
        totalGames = []

        for player in playerData:
            wins.append(player['winPercent'])
            totalGames.append(player['total'])
        

        meanWin = statistics.mean(wins)
        stdWins = statistics.stdev(wins)
        meanTotal = statistics.mean(totalGames)
        stdTotal = statistics.stdev(totalGames)

        stats = {
            "meanWin" : meanWin,
            "meanTotal" : meanTotal,
            "stdWins" : stdWins,
            "stdTotal" : stdTotal
        }

        return stats

    def getData(self):
        retData = {
            "playerData" : self.playerData,
            "APICalls" : self.APICalls,
            "Times" : self.times
        }

        r = json.dumps(retData)
        return json.loads(r)
    
    def getState(self):
        return self.curState
        