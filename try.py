import json
import os

for i in os.listdir("storage"):
    if i.endswith(".json"):

        filepath = f"storage/{i}"

        # Load JSON
        with open(filepath, "r") as f:
            data = json.load(f)

        # Update Shaykh only for fiqh.json
        if i == "fiqh.json":
            for j in data:
                j["Shaykh"] = "Sheekh Abdulqaadir Dalmar"

        # Save changes back to file
        with open(filepath, "w") as f:
            json.dump(data, f, indent=4)

        # Print to verify
        for j in data:
            print(j["Shaykh"])
