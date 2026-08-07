from agents.weather_agent import weather_node

state = {"message": "Will it rain in Pune?", "city": "Pune"}
result = weather_node(state)
print(result["weather_result"])