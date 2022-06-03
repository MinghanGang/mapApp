import random
import time
import json

NUMBER_POINTS = 30
run_number_times = 3
data = {}

# compute the features
def getRandomNumber(min, ref):
    return random.random() * (ref - min) + min



count = 0
while count < run_number_times:
    data['type'] = 'LineString'
    data['coordinates'] = []

    for i in range(NUMBER_POINTS):
         # random numbers for now
        latitude = float(getRandomNumber(-121.920219, -120.207386))
        longitude = float(getRandomNumber(35.646236, 36.440643))
        coord_set = [latitude, longitude, 449.2]
        data['coordinates'].append(coord_set)

    json_data = json.dumps(data, indent=4, separators=(", ", " = "))
    print(json_data)

    time.sleep(3.0) if count != run_number_times-1 else None
    count += 1

