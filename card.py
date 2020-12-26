class Card:
    def __init__(self, card: str):
        self.card = card
        self.card_face = card.split(':')[0]
        self.card_suit = card.split(':')[-1]

    def get_score(self) -> list:
        try:
            score = [int(self.card_face)]
        except:
            if self.card_face == 'Ac':
                score = [1,11]
            else:
                score = [10]

        return score

    def low_card_check(self) -> bool:
        return True if self.card_face in ['02','03','04','05','06'] else False

    def high_card_check(self) -> bool:
        return True if self.card_face in ['07','08','09','10','Ja','Qe','Ki','Ac'] else False
        
    def __str__(self):
        return self.card

# set face: Ac = Ace, Ja = Jack, Qe = Queen, Ki = King
# set suit: C = Club, H = Heart, D = Diamond, S = Spade
# main function: Test Card

def main():
    import random
    set_face = ['Ac','02','03','04','05','06','07','08','09','10','Ja','Qe','Ki']
    set_suit = ['C','H','D','S']
    result = Card('{}:{}'.format(
        random.choice(set_face), random.choice(set_suit)
        )
    )
    print(result)

if __name__ == "__main__":
    main()

