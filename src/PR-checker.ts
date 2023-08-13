import fetch from 'cross-fetch';

class Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    isOldRegistry: boolean;
    isCommunity: boolean;
    isUnknown: boolean;
    isToken2022: boolean;
    statDay: number;
    statWeek: number;
    statMonth: number;
  
    constructor(address: string, name: string, symbol: string, decimals: number, logoURI: string, tags: string[], statDayForMint: number, statWeekForMint: number, statMonthForMint: number) {
      this.address = address;
      this.name = name;
      this.symbol = symbol;
      this.decimals = decimals;
      this.logoURI = logoURI;
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


        const token = new Token(element.address, element.name, element.symbol, element.decimals, element.logoURI, element.tags, amountDayForMint, amountWeekForMint, amountMonthForMint)
        tokens.push(token)
    });

    // Parse command line argument
    const data = process.argv.slice(2).join(' ').split(',')
    const tokenPR = new Token(data[2], data[0], data[1], Number(data[3]), data[4], [], 0,0,0)
    const tokenAPI = tokens.find((elt) => elt.address == tokenPR.address);

    // Check and show results
    if (tokenAPI){
        console.log('Address:\x1b[32m OK\x1b[0m')
        tokenPR.name === tokenAPI.name ? console.log('Name:\x1b[32m OK\x1b[0m') : console.log('Name:\x1b[31m NOK\x1b[0m ------ ', tokenAPI.name)
        tokenPR.symbol === tokenAPI.symbol ? console.log('Symbol:\x1b[32m OK\x1b[0m') : console.log('Symbol:\x1b[31m NOK\x1b[0m ------ ', tokenAPI.symbol)
        tokenPR.decimals === tokenAPI.decimals ? console.log('Decimals:\x1b[32m OK\x1b[0m') : console.log('Decimals:\x1b[31m NOK\x1b[0m ------ ', tokenAPI.decimals)
        tokenPR.logoURI === tokenAPI.logoURI ? console.log('LogoURI:\x1b[32m OK\x1b[0m') : console.log('LogoURI:\x1b[31m NOK\x1b[0m ------ ', tokenAPI.logoURI)
        data[5] === 'true' ? console.log('Community label: :\x1b[32m OK\x1b[0m') : console.log('Community label:\x1b[31m NOK\x1b[0m ------ ', data[5])
        console.log('-------')
        tokenAPI.isUnknown ? console.log('Tags:\x1b[32m OK\x1b[0m') : console.log('Tags:\x1b[31m NOK\x1b[0m Token not unknown')
        const duplicates = []
        tokens.filter(item => item.symbol === tokenPR.symbol).forEach(x => duplicates.push(x.address))
        duplicates.length === 1 ? console.log('Duplicates:\x1b[32m OK\x1b[0m') : console.log('Duplicates:\x1b[31m NOK\x1b[0m ------ ', duplicates)
        console.log('-------')
        console.log('Jup daily Volume: ', tokenAPI.statDay)
        console.log('Jup weekly Volume: ', tokenAPI.statWeek)
        console.log('Jup monthly Volume: ', tokenAPI.statMonth)
    } else {
        console.log('Address:\x1b[31m NOK\x1b[0m')
    }
})();