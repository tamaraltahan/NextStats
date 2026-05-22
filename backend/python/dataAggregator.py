import codecs
import statistics
import time

import requests

from db import filter_matches_by_mode, load_previous_run, normalize_match_mode
from playerAnalysis import analyze_players, count_impacted_matches


class gameStats:

    APICalls = 0
    times = []
    matchesAnalysed = []
    playerMatchIDs = dict()
    gamesRuined = 0
    match_meta_list = []

    def __init__(self, account_id, match_mode='ranked'):
        self.id = str(account_id)
        self.match_mode = normalize_match_mode(match_mode)
        self.recent_match_lookup = {}

        prev_matches, prev_players, prev_ruined = load_previous_run(self.id, self.match_mode)
        self.matchesAnalysed = list(prev_matches)
        self.playerData = dict(prev_players) if prev_players else {}
        self.gamesRuined = prev_ruined or 0

        data = self.openRecentMatches()
        self.userInfo = self.getPlayersFromMatches(data)

        if self.playerData:
            self.playerData.update(self.getPlayerWinRate(self.userInfo))
        else:
            self.playerData = self.getPlayerWinRate(self.userInfo)

        self.stats = self.getPlayerStats()
        self.playerData = self.removeDuplicates(self.playerData)
        self.analysis = analyze_players(self.playerData)
        self.outlierData = self.analysis['legacyOutliers']
        suspect_ids = {
            p['id'] for p in self.analysis['players']
            if p['tier'] in ('watch', 'likely_outlier', 'strong_outlier')
        }
        self.gamesRuined += count_impacted_matches(self.playerMatchIDs, suspect_ids)

    def calcTime(self, start, end):
        self.times.append(end - start)

    def openRecentMatches(self):
        url = f'https://api.opendota.com/api/players/{self.id}/recentMatches'
        self.APICalls += 1
        recents = requests.get(url).json()
        self.recent_match_lookup = {m['match_id']: m for m in recents}
        return filter_matches_by_mode(recents, self.match_mode)

    def getPlayersFromMatches(self, data):
        start = time.perf_counter()
        match_ids = [match['match_id'] for match in data]
        players = []
        userInfo = {}

        for match_id in match_ids:
            if match_id in self.matchesAnalysed:
                continue

            url = f'https://api.opendota.com/api/matches/{match_id}'
            self.APICalls += 1
            match_data = requests.get(url).json()
            players.append(match_data['players'])
            self.matchesAnalysed.append(match_id)

            recent = self.recent_match_lookup.get(match_id, {})
            meta = {
                'match_id': match_id,
                'lobby_type': match_data.get('lobby_type', recent.get('lobby_type')),
                'game_mode': match_data.get('game_mode', recent.get('game_mode')),
            }
            self.match_meta_list.append(meta)

            player_ids = [
                p.get('account_id') for p in match_data['players']
                if p.get('account_id') is not None
            ]
            self.playerMatchIDs[match_id] = player_ids

        for player in players:
            for p in player:
                aid = p.get('account_id')
                if not aid or str(aid) == self.id or aid in userInfo:
                    continue
                userInfo[aid] = {}
                if p.get('personaname') is not None:
                    userInfo[aid]['userName'] = p['personaname'].encode().decode('unicode_escape')
                else:
                    userInfo[aid]['userName'] = None
                userInfo[aid]['rank'] = p.get('rank_tier')

        self.calcTime(start, time.perf_counter())
        return userInfo

    def getPlayerWinRate(self, userInfo):
        start = time.perf_counter()
        counter = 0
        limit = max(len(userInfo) // 4, 1)
        api_limiter = 20

        for pID in list(userInfo.keys()):
            counter += 1
            if counter == limit and len(userInfo) > api_limiter:
                counter = 0
                time.sleep(20)

            url = f'https://api.opendota.com/api/players/{pID}/wl'
            self.APICalls += 1
            wl = requests.get(url).json()
            try:
                userInfo[pID].update({'win': int(wl['win']), 'lose': int(wl['lose'])})
            except (KeyError, TypeError, ValueError) as err:
                print(f'Failed to parse wl data for {pID}: {err}')

        corrupted = []
        for player in userInfo:
            try:
                total = userInfo[player]['win'] + userInfo[player]['lose']
                assert total > 0
                userInfo[player]['total'] = total
            except (KeyError, AssertionError):
                corrupted.append(player)

        for player in corrupted:
            del userInfo[player]

        for player in userInfo:
            userInfo[player]['winPercent'] = round(
                (userInfo[player]['win'] / userInfo[player]['total']) * 100, 2
            )

        self.calcTime(start, time.perf_counter())
        return userInfo

    def getPlayerStats(self):
        wins = [v['winPercent'] for v in self.playerData.values()]
        total_games = [v['total'] for v in self.playerData.values()]
        return {
            'meanWins': round(statistics.mean(wins), 2) if wins else 0,
            'meanTotal': round(statistics.mean(total_games), 2) if total_games else 0,
            'stdWins': round(statistics.stdev(wins), 2) if len(wins) > 1 else 0,
            'stdTotal': round(statistics.stdev(total_games), 2) if len(total_games) > 1 else 0,
        }

    def getData(self):
        return {
            'playerData': self.playerData,
            'analysis': self.analysis,
            'outliers': self.outlierData,
            'Statistics': self.stats,
            'matchesAnalyzed': self.matchesAnalysed,
            'matchMode': self.match_mode,
            'analyzedPlayers': self.getAnalyses(),
            'APICalls': self.APICalls,
            'Times': self.times,
            'MatchesRuined': self.gamesRuined,
        }

    def getAnalyses(self):
        matches = len(self.matchesAnalysed)
        count_players = len(self.playerData)
        count_outliers = len(self.analysis.get('flaggedPlayerIds', []))
        count_possible = matches * 9
        analyzed_percent = round((count_players / count_possible) * 100, 2) if count_possible else 0
        return {
            'matches': matches,
            'countPlayers': count_players,
            'countOutliers': count_outliers,
            'countPossible': count_possible,
            'analyzedPercent': analyzed_percent,
            'anonPercent': round(100 - analyzed_percent, 2),
            'outlierPercent': round(100 * (count_outliers / count_players), 2) if count_players else 0,
        }

    def removeDuplicates(self, d):
        return dict(d.items())

    def decodeUsernames(self, encoded_string):
        return codecs.decode(encoded_string, 'unicode_escape')
