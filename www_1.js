const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path"); // vaja pildi jaoks
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
    fs.readFile(rawText, "utf-8", (err, data) => {
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
const pageStart = `
<!DOCTYPE html>
<html lang="et">
<head>
\t<meta charset="utf-8">
\t<title>Puhas kuld</title>
</head>
<body>
`;

const pageBody = `
\t<h1>Puhas kuld</h1>
\t<p>See leht on loodud <a href="https://www.tlu.ee">Tallinna Ülikoolis</a>
\tveebiprogrammeerimise kursusel ja ei oma mõistlikku sisu.</p>
\t<hr>
`;

const pageEnd = `
</body>
</html>
`;

readTextFile(vanasonadRef, function (wisdomList, randomWisdom) {
    const server = http.createServer(function (req, res) {
        console.log("Praegune URL: " + req.url);
        let currentUrl = url.parse(req.url, true);
        console.log("Puhas url: " + currentUrl.pathname);

        if (currentUrl.pathname === "/") {
            // Avaleht – ainult kuupäev ja kellaaeg
            res.writeHead(200, { "Content-type": "text/html" });
            res.write(pageStart);
            res.write(pageBody);

            res.write(
                '\t<p>Täna on ' +
                    dateET.weekDay() +
                    " " +
                    dateET.longDate() +
                    " " +
                    dateET.time() +
                    "</p>\n"
            );

            res.write('\n\t<p>Vaata ka <a href="/vanasonad">vanasõnu</a>.</p>');
            res.write(pageEnd);
            res.end();

        } else if (currentUrl.pathname === "/vanasonad") {
            // Vanasõnade leht
            res.writeHead(200, { "Content-type": "text/html" });
            res.write(pageStart);
            res.write(pageBody);

            res.write(
                '\t<p>Täna on ' +
                    dateET.weekDay() +
                    " " +
                    dateET.longDate() +
                    " " +
                    dateET.time() +
                    "</p>\n"
            );

            res.write(
                '\t<p><strong>Tänane vanasõna:</strong> ' +
                    randomWisdom +
                    "</p>\n"
            );

            res.write("\t<h2>Kõik vanasõnad</h2>\n");
            res.write("\t<ol>" + wisdomList + "\t</ol>\n");

            res.write(pageEnd);
            res.end();

        } else if (currentUrl.pathname === "/vp_banner_2025_AA.jpg") {
            // Serveeri pilt
            const bannerPath = path.join(__dirname, "vp_banner_2025_AA.jpg");
            fs.readFile(bannerPath, (err, data) => {
                if (err) {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("Pilt ei leitud");
                } else {
                    res.writeHead(200, { "Content-Type": "image/jpeg" });
                    res.end(data);
                }
            });

        } else {
            // Tundmatu URL
            res.writeHead(404, { "Content-type": "text/html" });
            res.write(pageStart);
            res.write("<h1>404 - Lehte ei leitud</h1>");
            res.write(pageEnd);
            res.end();
        }
    });

    server.listen(5314);
    console.log("Server töötab: http://localhost:5314");
});

