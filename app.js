window.game = (function() {
    this.GUISTATES = {
        admin: 0,
        gameView: 1,
        gameSetup: 2,
        questionPopup: 3,
        finishScreen: 4
    };

    this.state = {};
    
    this.tempState = {
        oldGuiState: -1
    };

    this.updatePlayerCount = function() {
        var playerCount = $('#playerCount').val();
        $('#playerNameContainer').empty();

        state.players = [];

        for(var i = 0; i < playerCount; i++) {
            $('#playerNameContainer').append('<label for="playerName_' + i + '">Name für Spieler '
            + (i+1) + '</label><input type="text" id="playerName_' + i + '"><br>');

            state.players[i] = {
                name: "",
                points: 0
            };
        }

    };

    this.updateFinishScreen = function() {
        var players = state.players.sort(function(a,b) {
            return b.points - a.points;
        });

        $('#playerScoreList').empty();

        for(var i = 0; i < players.length; i++) {
            $('#playerScoreList').append('<li>' + players[i].name + ' (' + players[i].points + ' Punkte)</li>');
        }
    };

    this.newGame = function() {
        var config = state.config;
        resetState();
        state.config = config;
        state.guiState = GUISTATES.gameSetup;
        applyState();
    };

    this.updatePlayerPanel = function() {
        $('#players').empty();

        for(var i = 0; i < state.players.length; i++) {
            $('#players').append('<div class="playerStatus' + (i == state.currentPlayer ? ' currentPlayer' : '') + '">'+
                '<span class="playerName"><a href="javascript:game.setPlayer(' + i + ')">' + state.players[i].name + '</a></span>'+
                '<span class="playerPoints">' + state.players[i].points + '</span'+
            '</div>');
        }
    };

    this.setPlayer = function(player) {
        state.currentPlayer = player;
        updatePlayerPanel();
        applyState();
    }

    this.updateJeopardyButtons = function() {
        $('#jeopardyButtons').empty();

        var headers = '';
        for(var category = 0; category < state.config.categories.length; category++) {
            headers += '<th>' + state.config.categories[category].name + '</th>';
        }

        $('#jeopardyButtons').append('<tr>' + headers + '</tr>');

        var questionsLeft = 0;

        for(var question = 0; question < getNumQuestions(); question++) {
            var row = '';

            for(var category = 0; category < state.config.categories.length; category++) {
                var disabled = state.lockedQuestions[category + "_" + question] ? ' disabled' : '';

                if(disabled == '') {
                    questionsLeft++;
                }

                row += '<td><button onclick="game.buttonClicked(' + 
                category + ', ' + question + ')" ' + disabled + '>' + ((question + 1) * 100) +
                '</button></td>';
            }

            $('#jeopardyButtons').append('<tr>' + row + '</tr>');
        }

        if(questionsLeft == 0) {
            state.guiState = GUISTATES.finishScreen;
            applyState();
        }
    };

    this.buttonClicked = function(category, question) {
        state.guiState = GUISTATES.questionPopup;
        state.currentQuestion.category = category;
        state.currentQuestion.question = question;
        applyState();
    };

    this.updateQuestionPopup = function() {
        $('#answerContainer').text('');
        $('#questionContainer').html(getQuestion(state.currentQuestion.category, state.currentQuestion.question).question.replace(/\n/g, "<br>\n"));
        $('#questionCategory').text(state.config.categories[state.currentQuestion.category].name);
    };

    this.showAnswer = function() {
        $('#answerContainer').text(getQuestion(state.currentQuestion.category, state.currentQuestion.question).answer);
    };

    this.correctAnswer = function() {
        state.players[state.currentPlayer].points += ((state.currentQuestion.question + 1) * 100);
        state.lockedQuestions[state.currentQuestion.category + "_" + state.currentQuestion.question] = true;
        state.guiState = GUISTATES.gameView;
        applyState();
    };

    this.wrongAnswer = function() {
        nextPlayer();
        updatePlayerPanel();
        applyState();
    };

    this.cancelQuestion = function() {
        state.guiState = GUISTATES.gameView;
        applyState();
    };

    this.nextPlayer = function() {
        state.currentPlayer++;

        if(state.currentPlayer >= state.players.length) {
            state.currentPlayer = 0;
        }
    };

    this.getNumQuestions = function() {
        var min = 999;
        
        for(var i = 0; i < state.config.categories.length; i++) {
            if(state.config.categories[i].questions.length < min) {
                min = state.config.categories[i].questions.length;
            }
        }

        return min;
    };

    this.getQuestion = function(category, question) {
        return state.config.categories[category].questions[question];
    };

    this.start = function() {
        for(var i = 0; i < state.players.length; i++) {
            state.players[i].name = $('#playerName_' + i).val();
        }

        state.lockedQuestions = {};
        state.guiState = GUISTATES.gameView;
        state.currentPlayer = 0;
        applyState();
    };

    this.loadState = function() {
        var savedState = localStorage.savedState;

        if(savedState !== undefined) {
            this.state = JSON.parse(savedState);
        }
    };

    this.saveState = function() {
        localStorage.savedState = JSON.stringify(state);
    };

    this.resetState = function(manual) {
        this.state = {
            config: {
                name: "Jeopardy",
                categories: [],
            },
            guiState: GUISTATES.admin,

            players: [],
            currentPlayer: 0,
            lockedQuestions: {},
            currentQuestion: {
                category: 0,
                question: 0,
            },
        };

        if(manual) {
            if(confirm("Das kann nicht rückgängig gemacht werden.\n\nSind Sie sicher?")) {
                applyState();
                window.location.href = window.location.href;
            }
        }
    };

    this.syncGUI = function() {
        $('.gameStateWidget').css('display', 'none');

        switch(state.guiState) {
            case GUISTATES.admin:
                $('#adminView').css('display', 'block');
                break;
            case GUISTATES.gameView:
                $('#gameView').css('display', 'block');
                break;
            case GUISTATES.gameSetup:
                $('#gameSetup').css('display', 'block');
                break;
            case GUISTATES.questionPopup:
                $('#gameView').css('display', 'block');
                $('#questionView').css('display', 'block');
                break;
            case GUISTATES.finishScreen:
                $('#finishView').css('display', 'block');
                break;
        }
    };

    this.applyState = function() {
        if(state.guiState != tempState.oldGuiState) {
            switch(state.guiState) {
                case GUISTATES.admin:
                    $('#appConfigTextarea').val(JSON.stringify(state.config, null, 4));
                    break;
                case GUISTATES.gameSetup:
                    updatePlayerCount();
                    break;
                case GUISTATES.gameView:
                    updatePlayerPanel();
                    updateJeopardyButtons();
                    break;
                case GUISTATES.questionPopup:
                    updatePlayerPanel();
                    updateJeopardyButtons();
                    updateQuestionPopup();
                case GUISTATES.finishScreen:
                    updateFinishScreen();
                    break;
            }
        }

        tempState.oldGuiState = state.guiState;

        saveState();
        syncGUI();
    };

    this.main = function() {
        resetState();
        loadState();
        applyState();

        $('#title').text(state.config.name);
        document.title = state.config.name;
    };

    this.saveConfig = function() {
        this.state.config = JSON.parse($('#appConfigTextarea').val());
        this.state.guiState = GUISTATES.gameSetup;
        applyState();

        $('#title').text(state.config.name);
        document.title = state.config.name;
    };

    this.goAdmin = function() {
        this.state.guiState = GUISTATES.admin;
        applyState();
    };

    return this;
})();
