# from dataAggregator import gameStats
# import sys
# import json
# import os

# id = sys.argv[1]
# Data = gameStats(id)

# path = f"./backend/python/PlayerEntries/{id}.json"

# if os.path.exists(path):
#     with open(path, 'r') as file:
#         existing_data = json.load(file)
# else:
#     existing_data = {}

# new_data = json.loads(Data.getData())
# existing_data.update(new_data)


from dataAggregator import gameStats
import sys
import json

id = sys.argv[1]
Data = gameStats(id)

path = f"./backend/python/PlayerEntries/{id}.json"

with open(path, 'w+', encoding='utf8') as f:
    json.dump(Data.getData(), f, ensure_ascii=False)

# f = open(path, "w+", encoding='utf8')
# f.write(Data.getData())

# f.close()