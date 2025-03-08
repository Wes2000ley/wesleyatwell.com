const game = new Chess();

const board = Chessboard('board', {
    draggable: true,
    dropOffBoard: 'snapback',
    position: 'start',
    onDragStart: highlightMoves,
    onDrop: handleMove,
    onMouseoutSquare: removeHighlights
});

const stockfish = new Worker("stockfish.js");

let isCalculating = false;
let aiDepth = 10;

stockfish.onmessage = function(event) {
    console.log("Stockfish Response:", event.data);

    if (event.data.includes("uciok")) {
        console.log("Stockfish is ready!");
        return;
    }

    const match = event.data.match(/bestmove (\S+)/);
    if (match) {
        let aiMove = match[1];

        if (aiMove !== "(none)" && game.turn() === "b") {
            console.log("AI Move:", aiMove);
            
            let legalMoves = game.moves({ verbose: true });
            let isMoveLegal = legalMoves.some(m => m.from === aiMove.substring(0, 2) && m.to === aiMove.substring(2, 4));

            if (!isMoveLegal) {
                console.log("AI Move Invalid, retrying...");
                retryAIMove();
                return;
            }

            let move = game.move({
                from: aiMove.substring(0, 2),
                to: aiMove.substring(2, 4),
                promotion: 'q'
            });

            if (move) {
                console.log("AI Played:", aiMove);
                updateCapturedPieces(move.captured, 'w');
                board.position(game.fen(), true);
                isCalculating = false;
            } else {
                console.log("AI Move Invalid, retrying...");
                retryAIMove();
            }
        }
    }
};

stockfish.postMessage("uci");

function handleMove(source, target) {
    if (isCalculating) return "snapback";

    let move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return "snapback";

    console.log("Player moved:", move.san);

    // Handle En Passant
    if (move.flags.includes('e')) {
        console.log("En Passant executed!");
    }

    // Handle Pawn Promotion
    if (move.piece === 'p' && (target[1] === '1' || target[1] === '8')) {
        let newPiece = prompt("Promote to (q, r, b, n)?", "q").toLowerCase();
        if (!['q', 'r', 'b', 'n'].includes(newPiece)) newPiece = 'q';
        game.remove(target);
        game.put({ type: newPiece, color: move.color }, target);
    }

    updateCapturedPieces(move.captured, 'b');

    board.position(game.fen(), true); // Ensures castling works correctly

    removeHighlights();
    
    isCalculating = true;
    setTimeout(makeAIMove, 500);
}

function makeAIMove() {
    if (game.game_over()) {
        let message = "Game Over! ";
        if (game.in_checkmate()) message += "Checkmate!";
        else if (game.in_stalemate()) message += "Stalemate!";
        else if (game.insufficient_material()) message += "Draw (Insufficient Material).";
        else if (game.in_threefold_repetition()) message += "Draw (Threefold Repetition).";
        else message += "It's a draw!";
        
        alert(message);
        return;
    }

    if (game.turn() === "b") {
        console.log("Stockfish is thinking at depth", aiDepth);
        stockfish.postMessage("stop");
        stockfish.postMessage(`position fen ${game.fen()}`);
        stockfish.postMessage(`go depth ${aiDepth}`);
    }
}

function retryAIMove() {
    console.log("Retrying AI move...");
    stockfish.postMessage("stop");
    stockfish.postMessage(`position fen ${game.fen()}`);
    stockfish.postMessage(`go depth ${aiDepth}`);
}

function resetGame() {
    game.reset();
    board.position('start');
    document.getElementById("captured-white").innerHTML = "";
    document.getElementById("captured-black").innerHTML = "";
    isCalculating = false;
}

function setDifficulty() {
    aiDepth = document.getElementById("difficulty").value;
    console.log("AI Difficulty set to:", aiDepth);
}

// Highlight Moves
function highlightMoves(source) {
    removeHighlights();
    let moves = game.moves({ square: source, verbose: true });
    if (moves.length === 0) return;
    moves.forEach(move => {
        let square = document.querySelector(`.square-${move.to}`);
        if (square) {
            square.classList.add(move.captured ? "square-capture" : "square-highlight");
        }
    });
}

// Remove Highlights
function removeHighlights() {
    document.querySelectorAll(".square-55d63").forEach(square => {
        square.classList.remove("square-highlight", "square-capture");
    });
}

// Track Captured Pieces (Uses Correct Images)
function updateCapturedPieces(piece, color) {
    if (!piece) return;

    const pieceMap = {
        'p': 'P', 'r': 'R', 'n': 'N',
        'b': 'B', 'q': 'Q', 'k': 'K'
    };

    let pieceName = pieceMap[piece.toLowerCase()];
    let pieceColor = color === 'w' ? 'w' : 'b'; // White = 'w', Black = 'b'
    let imgSrc = `img/chesspieces/wikipedia/${pieceColor}${pieceName}.png`;

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = piece;
    img.style.width = "40px";
    img.style.margin = "5px";

    if (color === "w") {
        document.getElementById("captured-white").appendChild(img);
    } else {
        document.getElementById("captured-black").appendChild(img);
    }
}

console.log("Game loaded. Waiting for player's move...");
