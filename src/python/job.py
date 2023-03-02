from dataAggregator import gameStats
import sys
id = sys.argv[1]
Data = gameStats(id)

state = ""

while Data.isRunning:
    if Data.curState != state:
        state = Data.curState

dotaJSON = Data.getData()