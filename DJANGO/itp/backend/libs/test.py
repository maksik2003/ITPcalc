def my_dec(func):
    def wrapper():
        print('До выполнения функции')
        func()
        print('После выполнения функции')
    return wrapper

@my_dec
def say_hello():
    print('Привет, мир!')

if __name__ == '__main__':
    say_hello()