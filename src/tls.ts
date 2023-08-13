import fetch from 'cross-fetch';

class Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    isOldRegistry: boolean;
    isCommunity: boolean;
    isUnknown: boolean;
    isToken2022: boolean;
    statDay: number;
    statWeek: number;
    statMonth: number;
  
    constructor(address: string, name: string, symbol: string, decimals: number, tags: string[], statDayForMint: number, statWeekForMint: number, statMonthForMint: number) {
      this.address = address;
      this.name = name;
      this.symbol = symbol;
      this.decimals = decimals;
      this.isOldRegistry = tags.includes('old-registry');
      this.isCommunity = tags.includes('community');
      this.isUnknown = tags.includes('unknown');
      this.isToken2022 = tags.includes('token-2022');
      this.statDay = statDayForMint;
      this.statWeek = statWeekForMint;
      this.statMonth = statMonthForMint;
    }
}

(async () => { 
    const tokens = []

    // Retrieve 'All' tokens list
    const tokenList = await (await fetch('https://token.jup.ag/all')).json();

    // Retrieve Jup stats
    const tokenStatsDay = await (await fetch('https://stats.jup.ag/info/day')).json();
    const tokenStatsWeek = await (await fetch('https://stats.jup.ag/info/week')).json();
    const tokenStatsMonth = await (await fetch('https://stats.jup.ag/info/month')).json();

    // Construct tokens Array
    tokenList.forEach( (element) => {
        const statDayForMint = tokenStatsDay.lastXTopTokens.find((elt) => elt.mint == element.address);
        const amountDayForMint = statDayForMint ? Number(statDayForMint.amount) : 0

        const statWeekForMint = tokenStatsWeek.lastXTopTokens.find((elt) => elt.mint == element.address);
        const amountWeekForMint = statWeekForMint ? Number(statWeekForMint.amount) : 0

        const statMonthForMint = tokenStatsMonth.lastXTopTokens.find((elt) => elt.mint == element.address);
        const amountMonthForMint = statMonthForMint ? Number(statMonthForMint.amount) : 0


        const token = new Token(element.address, element.name, element.symbol, element.decimals, element.tags, amountDayForMint, amountWeekForMint, amountMonthForMint)
        tokens.push(token)
    });

    // Show results
    console.log("Token in Token List API: ", Object.keys(tokenList).length)
    console.log("Token with Daily volume in Jup stats :", Object.keys(tokenStatsDay.lastXTopTokens).length)
    console.log("Token with Weekly volume in Jup stats:", Object.keys(tokenStatsWeek.lastXTopTokens).length)
    console.log("Token with Monthly volume in Jup stats:", Object.keys(tokenStatsMonth.lastXTopTokens).length)

    console.log("___________")

    console.log("'community' labeled token: ", tokens.filter(item => item.isCommunity == true).length)
    console.log("'old-registry' labeled token: ", tokens.filter(item => item.isOldRegistry == true).length)
    console.log("'unknown' labeled token: ", tokens.filter(item => item.isUnknown == true).length)

    console.log("___________")


    const communityNoVolume = []
    tokens.filter(item => item.isCommunity == true && item.statMonth === 0).forEach(x => communityNoVolume.push(x.symbol))
    console.log("Token 'community' labelled with no monthly volume: ", communityNoVolume.length)


    const oldNoVolume = []
    tokens.filter(item => item.isOldRegistry == true && item.statMonth === 0).forEach(x => oldNoVolume.push(x.symbol))
    console.log("Token 'old-registry' labelled with no monthly volume: ", oldNoVolume.length)
       
    const unknownWithVolume = []
    tokens.filter(item => item.isUnknown == true && item.statMonth != 0).forEach(x => unknownWithVolume.push(x.symbol))
    console.log("Token 'unknown' labelled with monthly volume: ", unknownWithVolume.length)
})();