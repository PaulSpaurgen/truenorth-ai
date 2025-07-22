// Destiny Cards calculation based on birth date
// This maps each day of the year to a specific playing card

const destinyCardTable = {
  // January
  "1-1": "K♠", "1-2": "Q♠", "1-3": "J♠", "1-4": "10♠", "1-5": "9♠", "1-6": "8♠", "1-7": "7♠",
  "1-8": "6♠", "1-9": "5♠", "1-10": "4♠", "1-11": "3♠", "1-12": "2♠", "1-13": "A♠", "1-14": "K♥",
  "1-15": "Q♥", "1-16": "J♥", "1-17": "10♥", "1-18": "9♥", "1-19": "8♥", "1-20": "7♥", "1-21": "6♥",
  "1-22": "5♥", "1-23": "4♥", "1-24": "3♥", "1-25": "2♥", "1-26": "A♥", "1-27": "K♦", "1-28": "Q♦",
  "1-29": "J♦", "1-30": "10♦", "1-31": "9♦",
  
  // February
  "2-1": "J♠", "2-2": "10♠", "2-3": "9♠", "2-4": "8♠", "2-5": "7♠", "2-6": "6♠", "2-7": "5♠",
  "2-8": "4♠", "2-9": "3♠", "2-10": "2♠", "2-11": "A♠", "2-12": "K♥", "2-13": "Q♥", "2-14": "J♥",
  "2-15": "10♥", "2-16": "9♥", "2-17": "8♥", "2-18": "7♥", "2-19": "6♥", "2-20": "5♥", "2-21": "4♥",
  "2-22": "3♥", "2-23": "2♥", "2-24": "A♥", "2-25": "K♦", "2-26": "Q♦", "2-27": "J♦", "2-28": "10♦",
  "2-29": "9♦",
  
  // March
  "3-1": "9♠", "3-2": "8♠", "3-3": "7♠", "3-4": "6♠", "3-5": "5♠", "3-6": "4♠", "3-7": "3♠",
  "3-8": "2♠", "3-9": "A♠", "3-10": "K♥", "3-11": "Q♥", "3-12": "J♥", "3-13": "10♥", "3-14": "9♥",
  "3-15": "8♥", "3-16": "7♥", "3-17": "6♥", "3-18": "5♥", "3-19": "4♥", "3-20": "3♥", "3-21": "2♥",
  "3-22": "A♥", "3-23": "K♦", "3-24": "Q♦", "3-25": "J♦", "3-26": "10♦", "3-27": "9♦", "3-28": "8♦",
  "3-29": "7♦", "3-30": "6♦", "3-31": "5♦",
  
  // April
  "4-1": "7♠", "4-2": "6♠", "4-3": "5♠", "4-4": "4♠", "4-5": "3♠", "4-6": "2♠", "4-7": "A♠",
  "4-8": "K♥", "4-9": "Q♥", "4-10": "J♥", "4-11": "10♥", "4-12": "9♥", "4-13": "8♥", "4-14": "7♥",
  "4-15": "6♥", "4-16": "5♥", "4-17": "4♥", "4-18": "3♥", "4-19": "2♥", "4-20": "A♥", "4-21": "K♦",
  "4-22": "Q♦", "4-23": "J♦", "4-24": "10♦", "4-25": "9♦", "4-26": "8♦", "4-27": "7♦", "4-28": "6♦",
  "4-29": "5♦", "4-30": "4♦",
  
  // May
  "5-1": "5♠", "5-2": "4♠", "5-3": "3♠", "5-4": "2♠", "5-5": "A♠", "5-6": "K♥", "5-7": "Q♥",
  "5-8": "J♥", "5-9": "10♥", "5-10": "9♥", "5-11": "8♥", "5-12": "7♥", "5-13": "6♥", "5-14": "5♥",
  "5-15": "4♥", "5-16": "3♥", "5-17": "2♥", "5-18": "A♥", "5-19": "K♦", "5-20": "Q♦", "5-21": "J♦",
  "5-22": "10♦", "5-23": "9♦", "5-24": "8♦", "5-25": "7♦", "5-26": "6♦", "5-27": "5♦", "5-28": "4♦",
  "5-29": "3♦", "5-30": "2♦", "5-31": "A♦",
  
  // June
  "6-1": "3♠", "6-2": "2♠", "6-3": "A♠", "6-4": "K♥", "6-5": "Q♥", "6-6": "J♥", "6-7": "10♥",
  "6-8": "9♥", "6-9": "8♥", "6-10": "7♥", "6-11": "6♥", "6-12": "5♥", "6-13": "4♥", "6-14": "3♥",
  "6-15": "2♥", "6-16": "A♥", "6-17": "K♦", "6-18": "Q♦", "6-19": "J♦", "6-20": "10♦", "6-21": "9♦",
  "6-22": "8♦", "6-23": "7♦", "6-24": "6♦", "6-25": "5♦", "6-26": "4♦", "6-27": "3♦", "6-28": "2♦",
  "6-29": "A♦", "6-30": "K♣",
  
  // July
  "7-1": "A♠", "7-2": "K♥", "7-3": "Q♥", "7-4": "J♥", "7-5": "10♥", "7-6": "9♥", "7-7": "8♥",
  "7-8": "7♥", "7-9": "6♥", "7-10": "5♥", "7-11": "4♥", "7-12": "3♥", "7-13": "2♥", "7-14": "A♥",
  "7-15": "K♦", "7-16": "Q♦", "7-17": "J♦", "7-18": "10♦", "7-19": "9♦", "7-20": "8♦", "7-21": "7♦",
  "7-22": "6♦", "7-23": "5♦", "7-24": "4♦", "7-25": "3♦", "7-26": "2♦", "7-27": "A♦", "7-28": "K♣",
  "7-29": "Q♣", "7-30": "J♣", "7-31": "10♣",
  
  // August
  "8-1": "Q♣", "8-2": "J♣", "8-3": "10♣", "8-4": "9♣", "8-5": "8♣", "8-6": "7♣", "8-7": "6♣",
  "8-8": "5♣", "8-9": "4♣", "8-10": "3♣", "8-11": "2♣", "8-12": "A♣", "8-13": "K♦", "8-14": "Q♦",
  "8-15": "J♦", "8-16": "10♦", "8-17": "9♦", "8-18": "8♦", "8-19": "7♦", "8-20": "6♦", "8-21": "5♦",
  "8-22": "4♦", "8-23": "3♦", "8-24": "2♦", "8-25": "A♦", "8-26": "K♣", "8-27": "Q♣", "8-28": "J♣",
  "8-29": "10♣", "8-30": "9♣", "8-31": "8♣",
  
  // September
  "9-1": "10♣", "9-2": "9♣", "9-3": "8♣", "9-4": "7♣", "9-5": "6♣", "9-6": "5♣", "9-7": "4♣",
  "9-8": "3♣", "9-9": "2♣", "9-10": "A♣", "9-11": "K♦", "9-12": "Q♦", "9-13": "J♦", "9-14": "10♦",
  "9-15": "9♦", "9-16": "8♦", "9-17": "7♦", "9-18": "6♦", "9-19": "5♦", "9-20": "4♦", "9-21": "3♦",
  "9-22": "2♦", "9-23": "A♦", "9-24": "K♣", "9-25": "Q♣", "9-26": "J♣", "9-27": "10♣", "9-28": "9♣",
  "9-29": "8♣", "9-30": "7♣",
  
  // October
  "10-1": "8♣", "10-2": "7♣", "10-3": "6♣", "10-4": "5♣", "10-5": "4♣", "10-6": "3♣", "10-7": "2♣",
  "10-8": "A♣", "10-9": "K♦", "10-10": "Q♦", "10-11": "J♦", "10-12": "10♦", "10-13": "9♦", "10-14": "8♦",
  "10-15": "7♦", "10-16": "6♦", "10-17": "5♦", "10-18": "4♦", "10-19": "3♦", "10-20": "2♦", "10-21": "A♦",
  "10-22": "K♣", "10-23": "Q♣", "10-24": "J♣", "10-25": "10♣", "10-26": "9♣", "10-27": "8♣", "10-28": "7♣",
  "10-29": "6♣", "10-30": "5♣", "10-31": "4♣",
  
  // November
  "11-1": "6♠", "11-2": "5♠", "11-3": "4♠", "11-4": "3♠", "11-5": "2♠", "11-6": "A♠", "11-7": "K♥",
  "11-8": "Q♥", "11-9": "J♥", "11-10": "10♥", "11-11": "9♥", "11-12": "8♥", "11-13": "7♥", "11-14": "6♥",
  "11-15": "5♥", "11-16": "4♥", "11-17": "3♥", "11-18": "2♥", "11-19": "A♥", "11-20": "K♦", "11-21": "Q♦",
  "11-22": "J♦", "11-23": "10♦", "11-24": "9♦", "11-25": "8♦", "11-26": "7♦", "11-27": "6♦", "11-28": "5♦",
  "11-29": "4♦", "11-30": "3♦",
  
  // December
  "12-1": "4♠", "12-2": "3♠", "12-3": "2♠", "12-4": "A♠", "12-5": "K♥", "12-6": "Q♥", "12-7": "J♥",
  "12-8": "10♥", "12-9": "9♥", "12-10": "8♥", "12-11": "7♥", "12-12": "6♥", "12-13": "5♥", "12-14": "4♥",
  "12-15": "3♥", "12-16": "2♥", "12-17": "A♥", "12-18": "K♦", "12-19": "Q♦", "12-20": "J♦", "12-21": "10♦",
  "12-22": "9♦", "12-23": "8♦", "12-24": "7♦", "12-25": "6♦", "12-26": "5♦", "12-27": "4♦", "12-28": "3♦",
  "12-29": "2♦", "12-30": "A♦", "12-31": "Joker"
};

export interface DestinyCard {
  card: string;
  rank: string;
  suit: string;
  suitSymbol: string;
  description: string;
}

export const getDestinyCard = (month: number, day: number): DestinyCard => {
  const key = `${month}-${day}`;
  const cardValue = destinyCardTable[key as keyof typeof destinyCardTable];
  
  if (!cardValue) {
    throw new Error(`Invalid date: ${month}/${day}`);
  }
  
  if (cardValue === "Joker") {
    return {
      card: "Joker",
      rank: "Joker",
      suit: "Joker",
      suitSymbol: "🃏",
      description: "The Joker represents wild energy, adaptability, and the ability to transform any situation. You have the power to change your destiny and bring unexpected solutions to life's challenges."
    };
  }
  
  const rank = cardValue.slice(0, -1);
  const suitSymbol = cardValue.slice(-1);
  
  let suit: string;
  let description: string;
  
  switch (suitSymbol) {
    case "♠":
      suit = "Spades";
      description = "Spades represent intellect, wisdom, and mental clarity. You have strong analytical abilities and a sharp mind.";
      break;
    case "♥":
      suit = "Hearts";
      description = "Hearts represent love, compassion, and emotional depth. You have a warm heart and strong intuitive abilities.";
      break;
    case "♦":
      suit = "Diamonds";
      description = "Diamonds represent material success, wealth, and practical achievements. You have strong determination and drive for success.";
      break;
    case "♣":
      suit = "Clubs";
      description = "Clubs represent creativity, growth, and spiritual development. You have natural leadership qualities and innovative thinking.";
      break;
    default:
      suit = "Unknown";
      description = "This card represents your unique destiny and life path.";
  }
  
  // Add rank-specific descriptions
  const rankDescriptions: Record<string, string> = {
    "A": "Aces represent new beginnings, potential, and raw power. You have the ability to start fresh and manifest your desires.",
    "K": "Kings represent authority, leadership, and mastery. You have natural leadership abilities and command respect.",
    "Q": "Queens represent wisdom, nurturing, and intuitive guidance. You have strong intuitive abilities and care deeply for others.",
    "J": "Jacks represent youth, adventure, and quick thinking. You have a playful spirit and adapt quickly to change.",
    "10": "Tens represent completion, fulfillment, and achievement. You have the ability to bring projects to successful completion.",
    "9": "Nines represent wisdom, spiritual growth, and humanitarian service. You have a deep understanding of life's mysteries.",
    "8": "Eights represent power, abundance, and material success. You have strong organizational skills and manifest abundance.",
    "7": "Sevens represent spirituality, intuition, and inner wisdom. You have strong psychic abilities and spiritual insight.",
    "6": "Sixes represent harmony, balance, and domestic happiness. You have a natural ability to create harmony in relationships.",
    "5": "Fives represent change, freedom, and adventure. You have a restless spirit and love new experiences.",
    "4": "Fours represent stability, foundation, and hard work. You have strong practical skills and build lasting foundations.",
    "3": "Threes represent creativity, self-expression, and joy. You have natural artistic abilities and bring joy to others.",
    "2": "Twos represent partnership, cooperation, and balance. You have strong diplomatic skills and work well with others."
  };
  
  const rankDescription = rankDescriptions[rank] || "";
  
  return {
    card: cardValue,
    rank,
    suit,
    suitSymbol,
    description: `${description} ${rankDescription}`
  };
};

export const DestinyCards = () => {
  // This function can be used for testing or as a utility
  return {
    getDestinyCard
  };
};