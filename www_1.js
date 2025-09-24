const fs = require("fs");
const http = require("http");
const dateET = require("./src/dateET");
const vanasonadRef = "./txt/vanasonad.txt";

// teisendame faili sisu massiiviks
function parseWisdom(rawValue) {
    return rawValue
        .split(';')
        .map(item => item.trim())
        .filter(item => item !== "");
}

// kõik vanasõnad HTML listiks
function listAllWisdom(wisdomArray) {
    return wisdomArray
        .map(item => `\n\t\t<li>${item}</li>`)
        .join("\n");
}

// juhusliku vanasõna valimine
function pickOneValue(wisdomArray) {
    let index = Math.floor(Math.random() * wisdomArray.length);
    return wisdomArray[index];
}

// faili lugemine ja callbacki andmine
function readTextFile(rawText, callback) {
    fs.readFile(rawText, 'utf-8', (err, data) => {
        if (err) {
            console.error("Faili lugemine ebaõnnestus:", err);
            callback("<li>Vanasõnu ei leitud.</li>", "Vanasõna puudub");
            return;
        }
        const wisdomArray = parseWisdom(data);
        const wisdomList = listAllWisdom(wisdomArray);
        const randomWisdom = pickOneValue(wisdomArray);
        callback(wisdomList, randomWisdom);
    });
}

// HTML põhistruktuur
const pageStart =
    '<!DOCTYPE html>\n' +
    '<html lang="et">\n' +
    '<head>\n' +
    '\t<meta charset="utf-8">\n' +
    '\t<title>Puhas kuld</title>\n' +
    '</head>\n' +
    '<body>\n';

const pageBody =
    '\t<h1>Puhas kuld</h1>\n' +
    '\t<p>See leht on loodud <a href="https://www.tlu.ee">Tallinna Ülikoolis</a> ' +
    'veebiprogrammeerimise kursusel ja ei oma mõistlikku sisu.</p>\n' +
    '\t<p>Roheline tee + L-teaniin ja L-türosiin viivad su parema fookuseni ' +
    'kui kohvi või energiajoogi tarbimine.</p>\n' +
    '\t<hr>\n';

const pageEnd =
    '</body>\n' +
    '</html>\n';

readTextFile(vanasonadRef, function (wisdomList, randomWisdom) {
    http.createServer(function (req, res) {
        res.writeHead(200, { "Content-type": "text/html" });
        res.write(pageStart);
        res.write(pageBody);

        // kuupäev + aeg
        res.write('\t<p>Täna on ' + dateET.weekDay() + " " + dateET.longDate() + " " + dateET.time() + '</p>\n');

        // üks suvaline vanasõna
        res.write('\t<p><strong>Tänane vanasõna:</strong> ' + randomWisdom + '</p>\n');

        // kõik vanasõnad loendina
        res.write('\t<h2>Kõik vanasõnad</h2>\n');
        res.write('\t<ol>' + wisdomList + '\t</ol>\n');

        res.write(pageEnd);
        res.end();
    }).listen(5314);
    console.log("Server töötab: http://localhost:5314");
});
