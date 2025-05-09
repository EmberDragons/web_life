import random

numbers = [1,2,3,4,5,6,7,8,9]
alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
list_rand_letters = [random.randint(0,len(alphabet)) for _ in range(10)]
list_rand_numbers = [random.randint(0,len(numbers)) for _ in range(5)]
print(list_rand_letters, list_rand_numbers)
