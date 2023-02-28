
import requests
import json
import time
import matplotlib.pyplot as plt
#%matplotlib inline

class gameStats:
    def openRecentMatches(self, id):
        url = 'https://api.opendota.com/api/players/{}/recentMatches'.format(id)
        # Get the data from the API
        r = requests.get(url)
        # Convert the data to a JSON object
        recents = r.json
        return recents

    def getPlayersFromMatches(self, id, data):
        """
        Returns all players ID's in the user's last 20 matches


        Args:
            id (int): player's steam32 ID
            data: JSON object of thee recentMatches API call

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
            url = 'https://api.opendota.com/api/matches/{}'.format(match)
            r = requests.get(url)
            data = r.json()
            players.append(data['players'])
        
        # Loop through the player ids and add them to the list
        for player in players:
            for p in player:
                if p['account_id'] and p['account_id'] != id and p['account_id'] not in pIDs:
                    pIDs.append(p['account_id'])

        return pIDs


    def getPlayerWinRate(self, pIDs):
        """
        Gets the winrate of all available players

        Args:
            pIDs (List): a list of player ID's


        Returns:
        """
        WL = {}
        counter = 0
        limit = len(pIDs)//4
        # Loop through the player ids and get the win/loss
        for pID in pIDs:
            counter += 1
            if counter == limit:
                counter = 0
                time.sleep(20)
            if pID in WL:
                print('{} already in WL'.format(pID))
            url = 'https://api.opendota.com/api/players/{}/wl'.format(pID)
            r = requests.get(url)
            data = r.json()    
            WL[pID] = data
            # adds the win/loss to the WL dictionary
            for player in WL:
                WL[player]['total'] = WL[player]['win'] + WL[player]['lose']

            playerData = WL

            # adds the win percent to the WL dictionary
            for player in playerData:
                playerData[player]['winPercent'] = round((playerData[player]['win']/playerData[player]['total'])*100,2)
        
    def anonProfiles(self, games,profiles):
        expected = games * 9
        actual = profiles
        return round((actual/expected)*100,2)


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

    #TODO: write function that returns needed data points as JSON
    def getData(self):
        return 1


    def plot(self, playerCount, accountBuyers, smurfCount):
        normal = playerCount - accountBuyers
        normalPercent = round((normal/playerCount)*100,2)
        explode1 = [0,0.1]
        explode2 = [0.1,0]
        actors = plt.pie([accountBuyers,normal],labels=['Account Buyers','Normal'],autopct='%1.1f%%',explode=explode1,shadow=True,startangle=90)
        smurfs = plt.pie([accountBuyers,smurfCount],labels=['Account Buyers','Smurfs'],autopct='%1.1f%%',explode=explode2,shadow=True,startangle=90)
        fig, (AB,SMF) = plt.subplots(1,2,figsize=(10,10)) #ax1,ax2 refer to your two pies
        fig.set_facecolor('#f2f2f2')
        fig.tight_layout()
        fig.subplots_adjust(wspace=0.5)

        # 1,2 denotes 1 row, 2 columns - if you want to stack vertically, it would be 2,1
        AB.pie([accountBuyers,normal],labels=['Account Buyers','Normal'],autopct='%1.1f%%',explode=explode1,shadow=True,startangle=90)
        AB.title.set_text('Account Buyers to normal players')


        SMF.pie([accountBuyers,smurfCount],labels=['Account Buyers','Smurfs'],autopct='%1.1f%%',explode=explode2,shadow=True,startangle=90)
        SMF.title.set_text('Account Buyers to smurfs')
