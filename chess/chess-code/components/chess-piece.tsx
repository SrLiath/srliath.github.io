interface ChessPieceProps {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | null
  color: "white" | "black" | null
}

export default function ChessPiece({ type, color }: ChessPieceProps) {
  if (!type || !color) return null

  // Unicode chess symbols
  const pieceSymbols: Record<string, string> = {
    "white-king": "♔",
    "white-queen": "♕",
    "white-rook": "♖",
    "white-bishop": "♗",
    "white-knight": "♘",
    "white-pawn": "♙",
    "black-king": "♚",
    "black-queen": "♛",
    "black-rook": "♜",
    "black-bishop": "♝",
    "black-knight": "♞",
    "black-pawn": "♟",
  }

  const pieceKey = `${color}-${type}`
  const symbol = pieceSymbols[pieceKey]

  return <div className={`text-4xl ${color === "white" ? "text-white" : "text-black"}`}>{symbol}</div>
}

