Website's dependencies scraper

Instructions:

Step 1: run `$npm install` in root folder.

Step 2: run `$npm run start` or `$node ./app.js`

Step 3: The previous step should start an express server on localhost:8000.
You can use this to access to the different endpoints by GET method.

-To get websites length use: `localhost:8000/websites/length`.
This will return and array of objects where each object contains the website's name and its size on bytes.

Response example:
[
    {
        "website": "facebook",
        "length: 147292
    }
]

-To get websites dependencies use: `localhost:8000/websites/dependencies`.
This will return an array for each dependency called on the website's head tag. These arrays contains the website's name and the dependency's name.
(For this case it's called dependencies to the script tags within the head tag of the websites source code)

Response example: 
[
    [
        [
            "lanacion",
            "polyfill.js"
        ],
        [
            "lanacion",
            "react.js"
        ],
    ]
]

-To get websites unique dependencies and its frequency use: `localhost:8000/websites/dependenciesfrequency`.
This will return an array of objects in where each object contains the dependency's name and its frequency, meaning the times
that it's used on all the websites.

Response example:
[
    {
        "dependency": "polyfill.js",
        "frequency": 1
    },
    {
        "dependency": "beacon.js",
        "frequency": 2
    },
]

Ttttthat's all folks!

