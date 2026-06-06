from model import generate_diet_response

sample = {
    "age":"22",
    "gender":"female",
    "height":"160",
    "weight":"52",
    "activity":"moderate",
    "goal":"maintain",
    "diet":"veg",
    "medical":"none",
    "meals":"3",
    "budget":"500"
}

print(generate_diet_response(sample))
