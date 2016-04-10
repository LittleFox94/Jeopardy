# Jeopardy

Fully client-side HTML and Javascript implementation for Jeopardy-like games.

## Features
* configure your categories and questions in JSON and save it in the app
* play with 3 to 6 players, with automatic or manual player change
* reload the page by accident without problems or lost game state

## Configuration file

```json
{
    "name":       "My super cool jeopardy questions",
    "categories": [
        {
            "name":      "Category 1",
            "questions": [
                {
                    "question": "Question number 1",
                    "answer":   "Answer for that question",
                },
                ...
            ],
        },
        {
            ...
        },
    ]
}
```

## Implementation details
It is implemented with jQuery and a state-machine. All the application state
(i.e. loaded configuration, game state, players, ...) is stored in the HTML5 LocalStorage
enabling full client-side gaming without internet

GUI is updated to show only ```div```s which are belonging to the current ```guiState```,
such as ```adminView``` or ```gameSetup```.

## License
This code is AGPL licensed. You must send changes to me as soon as they are used not in testing.
