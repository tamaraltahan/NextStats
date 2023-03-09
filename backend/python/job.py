from dataAggregator import gameStats
import sys

id = sys.argv[1]
Data = gameStats(id)

path = f"gamestats/src/python/PlayerEntries/{id}.txt"

f = open(path, "w")
f.write(Data.getData())

f.close()




