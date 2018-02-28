const readline = require('readline');
const fs = require('fs');

const PATH = process.argv[1].slice(0,process.argv[1].search('index.js'));

function getCard(probability) {
    const coef = 1/13;
    return Math.round((probability - probability % coef) / coef);
}

function displayCard(card) {
    switch(card){
        case 0:
            return'A';
        case 11:
            return 'J';
        case 12:
            return 'Q';
        case 13:
            return 'K';
        default:
            return card.toString();
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.async = false;

function getSum(sum, value){
    if(value === 0){
        return sum + 11;
    }
    else if(value > 10){
        return sum + 10;
    }
    return sum + value;

}

function afterGame(playerCash, stavka) {

    if(playerCash > 0) {
        rl.question('Do you wanna continue or finish?(c/f)', function (answer) {
            if (answer === 'c') {
                initializeGame(stavka, playerCash);
            }
            else {
                if (isNewHighScore(playerCash)) {
                    rl.question('you are new recordsman! Please enter your nick name:', function (answer) {
                        let records = readHighScore();
                        const file = fs.createWriteStream(PATH + 'score.txt');
                        records.push({nick: answer, score: playerCash});
                        file.write(JSON.stringify(records));
                        file.end();
                        mainMenu();
                    });
                }
                else mainMenu();
            }
        });
    }
    else{
        console.log('Your cash is 0. This is end :(');
        mainMenu();
    }
}

function endGame(diller, dillerScore, playerScore, stavka, playerCash) {
    console.log('diller cards is ', diller.map(displayCard));
    if (playerScore > dillerScore) {
        console.log('you win!');
        playerCash += stavka;
    }
    else if (playerScore < dillerScore) {
        console.log('you lose');
        playerCash -= stavka;
    }
    else{
        console.log('dead heat');
    }
    afterGame(playerCash, stavka);
}

function game(diller, player, playerCash, stavka) {
        console.log('//-------------//');
        console.log('your cards is ', player.map(displayCard));
        const playerScore = player.reduce(getSum, 0);
        const dillerScore = diller.reduce(getSum, 0);
        if (playerScore > 21) {
            console.log('diller cards is ' + diller.map(displayCard));
            console.log('you lose');
            playerCash -= stavka;
            afterGame(playerCash, stavka);
        }
        else {
            if(dillerScore < 21) {
                rl.question('Do you wanna get card?(y/n) ', function (answer) {
                    if (answer === 'y') {
                        player.push(getCard(Math.random()));
                        if (dillerScore < 17) {
                            diller.push(getCard(Math.random()));
                        }
                        game(diller, player, playerCash, stavka);
                    }
                    else {
                        endGame(diller, dillerScore, playerScore, stavka, playerCash)
                    }
                });
            }
            else{
                endGame(diller, dillerScore, playerScore, stavka, playerCash)
            }
    }
}

function initializeGame(stavka = 10,playerCash = 100) {
    const temp = [1, 2];
    const diller = temp.map(function () {
     return getCard(Math.random())
    });
    const player = temp.map(function () {
        return getCard(Math.random())
    });
    rl.question('your cash is ' + playerCash  + '. Please, enter your bet  ', function (answer) {
        if(0 < answer && answer <= playerCash) {
            stavka = +answer;
            game(diller, player, playerCash, stavka);
        }
        else {
            console.log('wrong bet');
            initializeGame(stavka, playerCash);
        }

    });
}

function sortScores(el1, el2) {
    return el1.score > el2.score ? -1 : 1;
}

function displayRecords(records) {
    records.sort(sortScores);
    console.log('nickname       score');
    records.forEach(function (el,i) {
        console.log(i+1 + '. ' + el.nick + ' ------ ' + el.score);
    });
}

function isNewHighScore(score) {
    let records = readHighScore();
    records.sort(sortScores);
    if(records.length < 10) return true;
    let isHighScore = false;
    records.forEach(function (value) {
        if (score > value){
            isHighScore = true;
        }
    });
    return isHighScore;
}

function readHighScore() {
    const file = readline.createInterface({
        input : fs.createReadStream(PATH + 'score.txt'),
        output: process.stdout,
    });
    file.async = false;
    let records = [];
    const lines = require('fs').readFileSync(PATH + 'score.txt', 'utf-8')
        .split('\n')
        .filter(Boolean);
    const answer = lines[0];

    if(answer !== '') {
        try {
            records = JSON.parse(answer);
        }
        catch(err) {
            const file1 = fs.createWriteStream(PATH + 'score.txt');
            file1.write('');
            file1.end();
        }
    }

    return records;
}

function highScoreMenu() {
    const records = readHighScore();
    console.log('****Highscore****');
    displayRecords(records);
    rl.question('enter any button to return in main menu',function () {
        mainMenu();
    });
}

function mainMenu() {
    console.log('****Main menu****');
    rl.question('Do you wanna start the game or look to high score?(game/score)  ', function (answer) {
        switch(answer) {
            case 'game':
                initializeGame();
                break;
            case 'score':
                highScoreMenu();
                break;
            default:
                process.exit();
        }
    });
}

mainMenu();