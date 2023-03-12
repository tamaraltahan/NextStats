from dataAggregator import gameStats
import sys

id = sys.argv[1]
Data = gameStats(id)

path = f"./gamestats/backend/python/PlayerEntries/{id}.json"

f = open(path, "w+")
f.write(Data.getData())

f.close()




