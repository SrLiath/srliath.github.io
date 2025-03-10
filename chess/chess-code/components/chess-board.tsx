"use client"

import type React from "react"

import { useState, useEffect } from "react"
import ChessPiece from "./chess-piece"
import { Button } from "@/components/ui/button"
import { RotateCcw, Bot, Users, ArrowLeft, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Chess piece types
type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | null
type PieceColor = "white" | "black" | null

interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

interface Square {
  piece: Piece | null
  highlighted: boolean
  selected: boolean
  isValidMove: boolean
  position: { row: number; col: number }
}

interface PromotionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (pieceType: PieceType) => void
  color: PieceColor
}

interface MoveHistory {
  from: { row: number; col: number }
  to: { row: number; col: number }
  piece: Piece
  capturedPiece: Piece | null
  notation: string
  isCheck: boolean
  isCheckmate: boolean
  isEnPassant?: boolean
  isCastling?: boolean
  promotedTo?: PieceType
}

// Piece values for bot evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
  null: 0,
}

function PromotionDialog({ isOpen, onClose, onSelect, color }: PromotionDialogProps) {
  const options: PieceType[] = ["queen", "rook", "bishop", "knight"]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#2f2f2f] border-[#444444] text-white">
        <DialogTitle>Escolha uma peça para promoção</DialogTitle>
        <div className="flex justify-center gap-4 p-4">
          {options.map((pieceType) => (
            <button
              key={pieceType}
              className="p-2 rounded-lg hover:bg-[#444444] transition-colors"
              onClick={() => onSelect(pieceType)}
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <ChessPiece type={pieceType} color={color} />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ChessBoard() {
  const [board, setBoard] = useState<Square[][]>([])
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [gameStatus, setGameStatus] = useState<string>("")
  const [isGameOver, setIsGameOver] = useState(false)
  const [botEnabled, setBotEnabled] = useState(false)
  const [botThinking, setBotThinking] = useState(false)

  // Histórico de movimentos
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [viewingHistory, setViewingHistory] = useState(false)

  // Promotion state
  const [showPromotion, setShowPromotion] = useState(false)
  const [promotionPending, setPromotionPending] = useState<{
    fromRow: number
    fromCol: number
    toRow: number
    toCol: number
  } | null>(null)

  // Adicionar um estado para rastrear o último movimento de peão que avançou duas casas
  const [lastPawnDoubleMove, setLastPawnDoubleMove] = useState<{ row: number; col: number } | null>(null)

  // Adicionar novos estados para as setas
  const [arrows, setArrows] = useState<
    {
      from: { row: number; col: number }
      to: { row: number; col: number }
      color: string
      isLShaped?: boolean
    }[]
  >([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ row: number; col: number } | null>(null)

  // Initialize the chess board
  useEffect(() => {
    initializeBoard()
  }, [])

  // Bot move effect
  useEffect(() => {
    if (botEnabled && currentPlayer === "black" && !isGameOver && !showPromotion && !viewingHistory) {
      // Add a small delay to make the bot's move feel more natural
      const timeoutId = setTimeout(() => {
        makeBotMove()
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [botEnabled, currentPlayer, isGameOver, showPromotion, viewingHistory])

  const initializeBoard = () => {
    const newBoard: Square[][] = Array(8)
      .fill(null)
      .map((_, row) =>
        Array(8)
          .fill(null)
          .map((_, col) => ({
            piece: null,
            highlighted: false,
            selected: false,
            isValidMove: false,
            position: { row, col },
          })),
      )

    // Set up pawns
    for (let col = 0; col < 8; col++) {
      newBoard[1][col].piece = { type: "pawn", color: "black", hasMoved: false }
      newBoard[6][col].piece = { type: "pawn", color: "white", hasMoved: false }
    }

    // Set up rooks
    newBoard[0][0].piece = { type: "rook", color: "black", hasMoved: false }
    newBoard[0][7].piece = { type: "rook", color: "black", hasMoved: false }
    newBoard[7][0].piece = { type: "rook", color: "white", hasMoved: false }
    newBoard[7][7].piece = { type: "rook", color: "white", hasMoved: false }

    // Set up knights
    newBoard[0][1].piece = { type: "knight", color: "black" }
    newBoard[0][6].piece = { type: "knight", color: "black" }
    newBoard[7][1].piece = { type: "knight", color: "white" }
    newBoard[7][6].piece = { type: "knight", color: "white" }

    // Set up bishops
    newBoard[0][2].piece = { type: "bishop", color: "black" }
    newBoard[0][5].piece = { type: "bishop", color: "black" }
    newBoard[7][2].piece = { type: "bishop", color: "white" }
    newBoard[7][5].piece = { type: "bishop", color: "white" }

    // Set up queens
    newBoard[0][3].piece = { type: "queen", color: "black" }
    newBoard[7][3].piece = { type: "queen", color: "white" }

    // Set up kings
    newBoard[0][4].piece = { type: "king", color: "black", hasMoved: false }
    newBoard[7][4].piece = { type: "king", color: "white", hasMoved: false }

    setBoard(newBoard)
    setCurrentPlayer("white")
    setGameStatus("")
    setIsGameOver(false)
    setMoveHistory([])
    setCurrentMoveIndex(-1)
    setViewingHistory(false)
  }

  const handleSquareClick = (row: number, col: number) => {
    if (isGameOver || viewingHistory) return

    // If bot is enabled and it's black's turn, prevent player from moving
    if (botEnabled && currentPlayer === "black") return

    // Create a copy of the board
    const newBoard = [...board.map((r) => [...r])]

    // If a square with a piece is selected
    if (selectedSquare) {
      // If clicking on the same square, deselect it
      if (selectedSquare.row === row && selectedSquare.col === col) {
        clearHighlights(newBoard)
        setSelectedSquare(null)
      }
      // If clicking on a highlighted valid move square, move the piece
      else if (newBoard[row][col].isValidMove) {
        const piece = newBoard[selectedSquare.row][selectedSquare.col].piece

        // Check for pawn promotion
        if (piece?.type === "pawn" && (row === 0 || row === 7)) {
          setPromotionPending({
            fromRow: selectedSquare.row,
            fromCol: selectedSquare.col,
            toRow: row,
            toCol: col,
          })
          setShowPromotion(true)
        } else {
          movePiece(selectedSquare.row, selectedSquare.col, row, col)
          clearHighlights(newBoard)
          setSelectedSquare(null)
        }
      }
      // If clicking on another piece of the same color, select that piece instead
      else if (newBoard[row][col].piece && newBoard[row][col].piece?.color === currentPlayer) {
        clearHighlights(newBoard)
        newBoard[row][col].selected = true
        setSelectedSquare({ row, col })
        highlightValidMoves(newBoard, row, col)
      }
      // If clicking on an empty square or opponent's piece that's not a valid move
      else {
        clearHighlights(newBoard)
        setSelectedSquare(null)
      }
    }
    // If no square is selected and clicking on a piece of the current player's color
    else if (newBoard[row][col].piece && newBoard[row][col].piece?.color === currentPlayer) {
      newBoard[row][col].selected = true
      setSelectedSquare({ row, col })
      highlightValidMoves(newBoard, row, col)
    }

    setBoard(newBoard)
  }

  // Adicionar função para lidar com o clique direito
  const handleMouseDown = (e: React.MouseEvent, row: number, col: number) => {
    // Apenas processa clique direito
    if (e.button === 2) {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({ row, col })
    }
  }

  const handleMouseMove = (e: React.MouseEvent, row: number, col: number) => {
    if (isDragging && dragStart) {
      setDragEnd({ row, col })
    }
  }

  const handleMouseUp = (e: React.MouseEvent, row: number, col: number) => {
    // Apenas processa clique direito
    if (e.button === 2 && isDragging && dragStart) {
      e.preventDefault()

      // Verificar se não é a mesma posição
      if (dragStart.row !== row || dragStart.col !== col) {
        // Verificar se já existe uma seta idêntica
        const existingArrowIndex = arrows.findIndex(
          (arrow) =>
            arrow.from.row === dragStart.row &&
            arrow.from.col === dragStart.col &&
            arrow.to.row === row &&
            arrow.to.col === col,
        )

        // Determinar se deve ser uma seta em L (movimento de torre)
        const isRookMove = dragStart.row !== row && dragStart.col !== col
        const isLShaped = isRookMove

        if (existingArrowIndex !== -1) {
          // Remover a seta existente
          setArrows(arrows.filter((_, index) => index !== existingArrowIndex))
        } else {
          // Adicionar nova seta
          setArrows([
            ...arrows,
            {
              from: dragStart,
              to: { row, col },
              color: currentPlayer === "white" ? "#5882d8" : "#d85858",
              isLShaped,
            },
          ])
        }
      }

      setIsDragging(false)
      setDragStart(null)
      setDragEnd(null)
    }
  }

  // Adicionar função para lidar com o mouse saindo do tabuleiro
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      setDragStart(null)
      setDragEnd(null)
    }
  }

  const clearHighlights = (boardState: Square[][]) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        boardState[r][c].highlighted = false
        boardState[r][c].selected = false
        boardState[r][c].isValidMove = false
      }
    }
  }

  const highlightValidMoves = (boardState: Square[][], row: number, col: number) => {
    const piece = boardState[row][col].piece
    if (!piece) return

    switch (piece.type) {
      case "pawn":
        highlightPawnMoves(boardState, row, col, piece.color)
        break
      case "rook":
        highlightRookMoves(boardState, row, col, piece.color)
        break
      case "knight":
        highlightKnightMoves(boardState, row, col, piece.color)
        break
      case "bishop":
        highlightBishopMoves(boardState, row, col, piece.color)
        break
      case "queen":
        highlightRookMoves(boardState, row, col, piece.color)
        highlightBishopMoves(boardState, row, col, piece.color)
        break
      case "king":
        highlightKingMoves(boardState, row, col, piece.color)
        break
    }
  }

  // Modificar a função highlightPawnMoves para incluir a captura en passant
  const highlightPawnMoves = (boardState: Square[][], row: number, col: number, color: PieceColor) => {
    const direction = color === "white" ? -1 : 1
    const startRow = color === "white" ? 6 : 1

    // Move forward one square
    if (isInBounds(row + direction, col) && !boardState[row + direction][col].piece) {
      boardState[row + direction][col].isValidMove = true
      boardState[row + direction][col].highlighted = true

      // Move forward two squares from starting position
      if (row === startRow && !boardState[row + 2 * direction][col].piece) {
        boardState[row + 2 * direction][col].isValidMove = true
        boardState[row + 2 * direction][col].highlighted = true
      }
    }

    // Capture diagonally
    const captureDirections = [
      { r: direction, c: -1 },
      { r: direction, c: 1 },
    ]
    captureDirections.forEach((dir) => {
      const newRow = row + dir.r
      const newCol = col + dir.c
      if (
        isInBounds(newRow, newCol) &&
        boardState[newRow][newCol].piece &&
        boardState[newRow][newCol].piece?.color !== color
      ) {
        boardState[newRow][newCol].isValidMove = true
        boardState[newRow][newCol].highlighted = true
      }

      // En passant capture
      if (
        isInBounds(newRow, newCol) &&
        !boardState[newRow][newCol].piece &&
        lastPawnDoubleMove &&
        lastPawnDoubleMove.row === row &&
        lastPawnDoubleMove.col === newCol &&
        boardState[row][newCol].piece?.type === "pawn" &&
        boardState[row][newCol].piece?.color !== color
      ) {
        boardState[newRow][newCol].isValidMove = true
        boardState[newRow][newCol].highlighted = true
      }
    })
  }

  const highlightRookMoves = (boardState: Square[][], row: number, col: number, color: PieceColor) => {
    const directions = [
      { r: -1, c: 0 }, // up
      { r: 1, c: 0 }, // down
      { r: 0, c: -1 }, // left
      { r: 0, c: 1 }, // right
    ]

    directions.forEach((dir) => {
      let newRow = row + dir.r
      let newCol = col + dir.c

      while (isInBounds(newRow, newCol)) {
        if (!boardState[newRow][newCol].piece) {
          boardState[newRow][newCol].isValidMove = true
          boardState[newRow][newCol].highlighted = true
        } else {
          if (boardState[newRow][newCol].piece?.color !== color) {
            boardState[newRow][newCol].isValidMove = true
            boardState[newRow][newCol].highlighted = true
          }
          break
        }
        newRow += dir.r
        newCol += dir.c
      }
    })
  }

  const highlightKnightMoves = (boardState: Square[][], row: number, col: number, color: PieceColor) => {
    const moves = [
      { r: -2, c: -1 },
      { r: -2, c: 1 },
      { r: -1, c: -2 },
      { r: -1, c: 2 },
      { r: 1, c: -2 },
      { r: 1, c: 2 },
      { r: 2, c: -1 },
      { r: 2, c: 1 },
    ]

    moves.forEach((move) => {
      const newRow = row + move.r
      const newCol = col + move.c

      if (
        isInBounds(newRow, newCol) &&
        (!boardState[newRow][newCol].piece || boardState[newRow][newCol].piece?.color !== color)
      ) {
        boardState[newRow][newCol].isValidMove = true
        boardState[newRow][newCol].highlighted = true
      }
    })
  }

  const highlightBishopMoves = (boardState: Square[][], row: number, col: number, color: PieceColor) => {
    const directions = [
      { r: -1, c: -1 }, // up-left
      { r: -1, c: 1 }, // up-right
      { r: 1, c: -1 }, // down-left
      { r: 1, c: 1 }, // down-right
    ]

    directions.forEach((dir) => {
      let newRow = row + dir.r
      let newCol = col + dir.c

      while (isInBounds(newRow, newCol)) {
        if (!boardState[newRow][newCol].piece) {
          boardState[newRow][newCol].isValidMove = true
          boardState[newRow][newCol].highlighted = true
        } else {
          if (boardState[newRow][newCol].piece?.color !== color) {
            boardState[newRow][newCol].isValidMove = true
            boardState[newRow][newCol].highlighted = true
          }
          break
        }
        newRow += dir.r
        newCol += dir.c
      }
    })
  }

  const highlightKingMoves = (boardState: Square[][], row: number, col: number, color: PieceColor) => {
    const moves = [
      { r: -1, c: -1 },
      { r: -1, c: 0 },
      { r: -1, c: 1 },
      { r: 0, c: -1 },
      { r: 0, c: 1 },
      { r: 1, c: -1 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]

    moves.forEach((move) => {
      const newRow = row + move.r
      const newCol = col + move.c

      if (
        isInBounds(newRow, newCol) &&
        (!boardState[newRow][newCol].piece || boardState[newRow][newCol].piece?.color !== color)
      ) {
        boardState[newRow][newCol].isValidMove = true
        boardState[newRow][newCol].highlighted = true
      }
    })

    // Check for castling
    if (!boardState[row][col].piece?.hasMoved) {
      // Kingside castling
      if (
        boardState[row][7].piece?.type === "rook" &&
        !boardState[row][7].piece?.hasMoved &&
        !boardState[row][5].piece &&
        !boardState[row][6].piece
      ) {
        boardState[row][6].isValidMove = true
        boardState[row][6].highlighted = true
      }

      // Queenside castling
      if (
        boardState[row][0].piece?.type === "rook" &&
        !boardState[row][0].piece?.hasMoved &&
        !boardState[row][1].piece &&
        !boardState[row][2].piece &&
        !boardState[row][3].piece
      ) {
        boardState[row][2].isValidMove = true
        boardState[row][2].highlighted = true
      }
    }
  }

  const isInBounds = (row: number, col: number) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8
  }

  // Função para gerar a notação algébrica de um movimento
  const getMoveNotation = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    piece: Piece,
    capturedPiece: Piece | null,
    isCheck: boolean,
    isCheckmate: boolean,
    isCastling = false,
    isEnPassant = false,
    promotedTo?: PieceType,
  ): string => {
    if (isCastling) {
      return toCol > fromCol ? "O-O" : "O-O-O"
    }

    const pieceSymbols: Record<PieceType, string> = {
      pawn: "",
      rook: "R",
      knight: "N",
      bishop: "B",
      queen: "Q",
      king: "K",
      null: "",
    }

    const fromFile = String.fromCharCode(97 + fromCol)
    const fromRank = 8 - fromRow
    const toFile = String.fromCharCode(97 + toCol)
    const toRank = 8 - toRow

    let notation = ""

    // Peça movida (exceto peão)
    if (piece.type !== "pawn") {
      notation += pieceSymbols[piece.type]
    }

    // Para peões, mostrar a coluna de origem apenas em capturas
    if (piece.type === "pawn" && capturedPiece) {
      notation += fromFile
    }

    // Captura
    if (capturedPiece || isEnPassant) {
      notation += "x"
    }

    // Destino
    notation += toFile + toRank

    // Promoção
    if (promotedTo) {
      notation += "=" + pieceSymbols[promotedTo]
    }

    // Xeque ou xeque-mate
    if (isCheckmate) {
      notation += "#"
    } else if (isCheck) {
      notation += "+"
    }

    return notation
  }

  // Modificar a função handlePromotion para registrar o movimento no histórico
  const handlePromotion = (pieceType: PieceType) => {
    if (!promotionPending) return

    const { fromRow, fromCol, toRow, toCol } = promotionPending

    // Complete the move with the selected promotion piece
    const newBoard = [...board.map((r) => [...r])]
    const piece = newBoard[fromRow][fromCol].piece
    const capturedPiece = newBoard[toRow][toCol].piece

    if (!piece) return

    // Move the piece and promote it
    newBoard[toRow][toCol].piece = {
      ...piece,
      type: pieceType,
      hasMoved: true,
    }
    newBoard[fromRow][fromCol].piece = null

    // Switch turns
    const nextPlayer = currentPlayer === "white" ? "black" : "white"

    // Verificar se o movimento resulta em xeque ou xeque-mate
    const isCheck = isKingInCheck(newBoard, nextPlayer)
    const isCheckmate = isCheck && !hasLegalMoves(newBoard, nextPlayer)

    // Criar notação do movimento
    const notation = getMoveNotation(
      fromRow,
      fromCol,
      toRow,
      toCol,
      piece,
      capturedPiece,
      isCheck,
      isCheckmate,
      false,
      false,
      pieceType,
    )

    // Adicionar ao histórico
    const newMove: MoveHistory = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: { ...piece },
      capturedPiece: capturedPiece ? { ...capturedPiece } : null,
      notation,
      isCheck,
      isCheckmate,
      promotedTo: pieceType,
    }

    // Atualizar o histórico de movimentos
    const newHistory = [...moveHistory.slice(0, currentMoveIndex + 1), newMove]
    setMoveHistory(newHistory)
    setCurrentMoveIndex(newHistory.length - 1)

    setCurrentPlayer(nextPlayer)
    setBoard(newBoard)
    setShowPromotion(false)
    setPromotionPending(null)

    // Limpar as setas após a promoção
    clearArrows()

    // Check for checkmate after promotion
    checkForCheckmate(newBoard, nextPlayer)
  }

  // Modificar a função movePiece para implementar a captura en passant e rastrear movimentos de peão
  const movePiece = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = [...board.map((r) => [...r])]
    const piece = newBoard[fromRow][fromCol].piece
    const capturedPiece = newBoard[toRow][toCol].piece

    if (!piece) return

    // Verificar se é um roque
    const isCastling = piece.type === "king" && Math.abs(fromCol - toCol) === 2

    // Verificar se é uma captura en passant
    const isEnPassant =
      piece.type === "pawn" &&
      Math.abs(fromCol - toCol) === 1 &&
      !newBoard[toRow][toCol].piece &&
      lastPawnDoubleMove &&
      lastPawnDoubleMove.row === fromRow &&
      lastPawnDoubleMove.col === toCol

    // Reset last pawn double move
    setLastPawnDoubleMove(null)

    // Handle castling
    if (isCastling) {
      // Kingside castling
      if (toCol === 6) {
        newBoard[fromRow][5].piece = newBoard[fromRow][7].piece
        newBoard[fromRow][7].piece = null
        if (newBoard[fromRow][5].piece) {
          newBoard[fromRow][5].piece.hasMoved = true
        }
      }
      // Queenside castling
      else if (toCol === 2) {
        newBoard[fromRow][3].piece = newBoard[fromRow][0].piece
        newBoard[fromRow][0].piece = null
        if (newBoard[fromRow][3].piece) {
          newBoard[fromRow][3].piece.hasMoved = true
        }
      }
    }

    // Handle en passant capture
    let capturedEnPassantPiece = null
    if (isEnPassant) {
      // Capturar o peão que fez o movimento duplo
      capturedEnPassantPiece = newBoard[fromRow][toCol].piece
      newBoard[fromRow][toCol].piece = null
    }

    // Track pawn double move for en passant
    if (piece.type === "pawn" && Math.abs(fromRow - toRow) === 2) {
      setLastPawnDoubleMove({ row: toRow, col: toCol })
    }

    // Move the piece
    newBoard[toRow][toCol].piece = { ...piece, hasMoved: true }
    newBoard[fromRow][fromCol].piece = null

    // Switch turns
    const nextPlayer = currentPlayer === "white" ? "black" : "white"

    // Verificar se o movimento resulta em xeque ou xeque-mate
    const isCheck = isKingInCheck(newBoard, nextPlayer)
    const isCheckmate = isCheck && !hasLegalMoves(newBoard, nextPlayer)

    // Criar notação do movimento
    const notation = getMoveNotation(
      fromRow,
      fromCol,
      toRow,
      toCol,
      piece,
      capturedPiece || capturedEnPassantPiece,
      isCheck,
      isCheckmate,
      isCastling,
      isEnPassant,
    )

    // Adicionar ao histórico
    const newMove: MoveHistory = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: { ...piece },
      capturedPiece: capturedPiece
        ? { ...capturedPiece }
        : capturedEnPassantPiece
          ? { ...capturedEnPassantPiece }
          : null,
      notation,
      isCheck,
      isCheckmate,
      isEnPassant,
      isCastling,
    }

    // Atualizar o histórico de movimentos
    const newHistory = [...moveHistory.slice(0, currentMoveIndex + 1), newMove]
    setMoveHistory(newHistory)
    setCurrentMoveIndex(newHistory.length - 1)
    setViewingHistory(false)

    setCurrentPlayer(nextPlayer)
    setBoard(newBoard)

    // Limpar as setas após o movimento
    clearArrows()

    // Check for checkmate
    checkForCheckmate(newBoard, nextPlayer)
  }

  // Find the king's position for a given color
  const findKing = (boardState: Square[][], color: PieceColor): { row: number; col: number } | null => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col].piece
        if (piece && piece.type === "king" && piece.color === color) {
          return { row, col }
        }
      }
    }
    return null
  }

  // Check if a square is under attack by the opponent
  const isSquareUnderAttack = (
    boardState: Square[][],
    row: number,
    col: number,
    attackerColor: PieceColor,
  ): boolean => {
    // Check for pawn attacks
    const pawnDirection = attackerColor === "white" ? -1 : 1
    const pawnAttacks = [
      { r: -pawnDirection, c: -1 },
      { r: -pawnDirection, c: 1 },
    ]

    for (const attack of pawnAttacks) {
      const newRow = row + attack.r
      const newCol = col + attack.c
      if (isInBounds(newRow, newCol)) {
        const piece = boardState[newRow][newCol].piece
        if (piece && piece.type === "pawn" && piece.color === attackerColor) {
          return true
        }
      }
    }

    // Check for knight attacks
    const knightMoves = [
      { r: -2, c: -1 },
      { r: -2, c: 1 },
      { r: -1, c: -2 },
      { r: -1, c: 2 },
      { r: 1, c: -2 },
      { r: 1, c: 2 },
      { r: 2, c: -1 },
      { r: 2, c: 1 },
    ]

    for (const move of knightMoves) {
      const newRow = row + move.r
      const newCol = col + move.c
      if (isInBounds(newRow, newCol)) {
        const piece = boardState[newRow][newCol].piece
        if (piece && piece.type === "knight" && piece.color === attackerColor) {
          return true
        }
      }
    }

    // Check for attacks along straight lines (rook, queen)
    const straightDirections = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 },
    ]

    for (const dir of straightDirections) {
      let newRow = row + dir.r
      let newCol = col + dir.c

      while (isInBounds(newRow, newCol)) {
        const piece = boardState[newRow][newCol].piece
        if (piece) {
          if (piece.color === attackerColor && (piece.type === "rook" || piece.type === "queen")) {
            return true
          }
          break // Stop checking in this direction if we hit any piece
        }
        newRow += dir.r
        newCol += dir.c
      }
    }

    // Check for attacks along diagonals (bishop, queen)
    const diagonalDirections = [
      { r: -1, c: -1 },
      { r: -1, c: 1 },
      { r: 1, c: -1 },
      { r: 1, c: 1 },
    ]

    for (const dir of diagonalDirections) {
      let newRow = row + dir.r
      let newCol = col + dir.c

      while (isInBounds(newRow, newCol)) {
        const piece = boardState[newRow][newCol].piece
        if (piece) {
          if (piece.color === attackerColor && (piece.type === "bishop" || piece.type === "queen")) {
            return true
          }
          break // Stop checking in this direction if we hit any piece
        }
        newRow += dir.r
        newCol += dir.c
      }
    }

    // Check for king attacks (adjacent squares)
    const kingMoves = [
      { r: -1, c: -1 },
      { r: -1, c: 0 },
      { r: -1, c: 1 },
      { r: 0, c: -1 },
      { r: 0, c: 1 },
      { r: 1, c: -1 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]

    for (const move of kingMoves) {
      const newRow = row + move.r
      const newCol = col + move.c
      if (isInBounds(newRow, newCol)) {
        const piece = boardState[newRow][newCol].piece
        if (piece && piece.type === "king" && piece.color === attackerColor) {
          return true
        }
      }
    }

    return false
  }

  // Check if the king is in check
  const isKingInCheck = (boardState: Square[][], kingColor: PieceColor): boolean => {
    const kingPos = findKing(boardState, kingColor)
    if (!kingPos) return false

    const opponentColor = kingColor === "white" ? "black" : "white"
    return isSquareUnderAttack(boardState, kingPos.row, kingPos.col, opponentColor)
  }

  // Check if a move would put or leave the king in check
  const wouldMoveResultInCheck = (
    boardState: Square[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    kingColor: PieceColor,
  ): boolean => {
    // Create a copy of the board to simulate the move
    const tempBoard = boardState.map((row) =>
      row.map((square) => ({
        ...square,
        piece: square.piece ? { ...square.piece } : null,
      })),
    )

    // Simulate the move
    const piece = tempBoard[fromRow][fromCol].piece
    if (!piece) return false

    tempBoard[toRow][toCol].piece = piece
    tempBoard[fromRow][fromCol].piece = null

    // Check if the king is in check after the move
    return isKingInCheck(tempBoard, kingColor)
  }

  // Check if there are any legal moves for a player
  const hasLegalMoves = (boardState: Square[][], playerColor: PieceColor): boolean => {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = boardState[fromRow][fromCol].piece
        if (piece && piece.color === playerColor) {
          // For each piece, check all possible moves
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              // Skip the current position
              if (fromRow === toRow && fromCol === toCol) continue

              // Check if the move is valid based on piece type
              let isValidMove = false

              switch (piece.type) {
                case "pawn":
                  isValidMove = isPawnMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "rook":
                  isValidMove = isRookMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "knight":
                  isValidMove = isKnightMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "bishop":
                  isValidMove = isBishopMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "queen":
                  isValidMove =
                    isRookMoveValid(boardState, fromRow, fromCol, toRow, toCol) ||
                    isBishopMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "king":
                  isValidMove = isKingMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
              }

              // If the move is valid and doesn't result in check, return true
              if (isValidMove && !wouldMoveResultInCheck(boardState, fromRow, fromCol, toRow, toCol, playerColor)) {
                return true
              }
            }
          }
        }
      }
    }

    return false
  }

  // Get all legal moves for a player
  const getAllLegalMoves = (boardState: Square[][], playerColor: PieceColor) => {
    const legalMoves = []

    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = boardState[fromRow][fromCol].piece
        if (piece && piece.color === playerColor) {
          // For each piece, check all possible moves
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              // Skip the current position
              if (fromRow === toRow && fromCol === toCol) continue

              // Check if the move is valid based on piece type
              let isValidMove = false

              switch (piece.type) {
                case "pawn":
                  isValidMove = isPawnMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "rook":
                  isValidMove = isRookMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "knight":
                  isValidMove = isKnightMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "bishop":
                  isValidMove = isBishopMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "queen":
                  isValidMove =
                    isRookMoveValid(boardState, fromRow, fromCol, toRow, toCol) ||
                    isBishopMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
                case "king":
                  isValidMove = isKingMoveValid(boardState, fromRow, fromCol, toRow, toCol)
                  break
              }

              // If the move is valid and doesn't result in check, add it to legal moves
              if (isValidMove && !wouldMoveResultInCheck(boardState, fromRow, fromCol, toRow, toCol, playerColor)) {
                legalMoves.push({
                  fromRow,
                  fromCol,
                  toRow,
                  toCol,
                  piece,
                  capturedPiece: boardState[toRow][toCol].piece,
                })
              }
            }
          }
        }
      }
    }

    return legalMoves
  }

  // Modificar a função isPawnMoveValid para incluir a captura en passant
  const isPawnMoveValid = (
    boardState: Square[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean => {
    const piece = boardState[fromRow][fromCol].piece
    if (!piece || piece.type !== "pawn") return false

    const direction = piece.color === "white" ? -1 : 1
    const startRow = piece.color === "white" ? 6 : 1

    // Move forward one square
    if (fromCol === toCol && toRow === fromRow + direction && !boardState[toRow][toCol].piece) {
      return true
    }

    // Move forward two squares from starting position
    if (
      fromCol === toCol &&
      fromRow === startRow &&
      toRow === fromRow + 2 * direction &&
      !boardState[fromRow + direction][fromCol].piece &&
      !boardState[toRow][toCol].piece
    ) {
      return true
    }

    // Capture diagonally
    if (
      Math.abs(fromCol - toCol) === 1 &&
      toRow === fromRow + direction &&
      boardState[toRow][toCol].piece &&
      boardState[toRow][toCol].piece?.color !== piece.color
    ) {
      return true
    }

    // En passant capture
    if (
      Math.abs(fromCol - toCol) === 1 &&
      toRow === fromRow + direction &&
      !boardState[toRow][toCol].piece &&
      lastPawnDoubleMove &&
      lastPawnDoubleMove.row === fromRow &&
      lastPawnDoubleMove.col === toCol &&
      boardState[fromRow][toCol].piece?.type === "pawn" &&
      boardState[fromRow][toCol].piece?.color !== piece.color
    ) {
      return true
    }

    return false
  }

  const isRookMoveValid = (
    boardState: Square[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean => {
    const piece = boardState[fromRow][fromCol].piece
    if (!piece) return false

    // Rook moves horizontally or vertically
    if (fromRow !== toRow && fromCol !== toCol) return false

    // Check if path is clear
    const rowStep = fromRow === toRow ? 0 : toRow > fromRow ? 1 : -1
    const colStep = fromCol === toCol ? 0 : toCol > fromCol ? 1 : -1

    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep

    while (currentRow !== toRow || currentCol !== toCol) {
      if (boardState[currentRow][currentCol].piece) return false
      currentRow += rowStep
      currentCol += colStep
    }

    // Check destination square
    return !boardState[toRow][toCol].piece || boardState[toRow][toCol].piece?.color !== piece.color
  }

  const isKnightMoveValid = (
    boardState: Square[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean => {
    const piece = boardState[fromRow][fromCol].piece
    if (!piece) return false

    // Knight moves in L-shape
    const rowDiff = Math.abs(fromRow - toRow)
    const colDiff = Math.abs(fromCol - toCol)

    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) return false

    // Check destination square
    return !boardState[toRow][toCol].piece || boardState[toRow][toCol].piece?.color !== piece.color
  }

  const isBishopMoveValid = (
    boardState: Square[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean => {
    const piece = boardState[fromRow][fromCol].piece
    if (!piece) return false

    // Bishop moves diagonally
    const rowDiff = Math.abs(fromRow - toRow)
    const colDiff = Math.abs(fromCol - toCol)

    if (rowDiff !== colDiff) return false

    // Check if path is clear
    const rowStep = toRow > fromRow ? 1 : -1
    const colStep = toCol > fromCol ? 1 : -1

    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep

    while (currentRow !== toRow && currentCol !== toCol) {
      if (boardState[currentRow][currentCol].piece) return false
      currentRow += rowStep
      currentCol += colStep
    }

    // Check destination square
    return !boardState[toRow][toCol].piece || boardState[toRow][toCol].piece?.color !== piece.color
  }

  const isKingMoveValid = (
    boardState: Square[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean => {
    const piece = boardState[fromRow][fromCol].piece
    if (!piece) return false

    // King moves one square in any direction
    const rowDiff = Math.abs(fromRow - toRow)
    const colDiff = Math.abs(fromCol - toCol)

    if (rowDiff > 1 || colDiff > 1) {
      // Check for castling
      if (piece.hasMoved || rowDiff !== 0 || colDiff !== 2) return false

      // Kingside castling
      if (toCol > fromCol) {
        return (
          boardState[fromRow][7].piece?.type === "rook" &&
          !boardState[fromRow][7].piece?.hasMoved &&
          !boardState[fromRow][5].piece &&
          !boardState[fromRow][6].piece
        )
      }
      // Queenside castling
      else {
        return (
          boardState[fromRow][0].piece?.type === "rook" &&
          !boardState[fromRow][0].piece?.hasMoved &&
          !boardState[fromRow][1].piece &&
          !boardState[fromRow][2].piece &&
          !boardState[fromRow][3].piece
        )
      }
    }

    // Check destination square
    return !boardState[toRow][toCol].piece || boardState[toRow][toCol].piece?.color !== piece.color
  }

  // Evaluate a move for the bot
  const evaluateMove = (move: any, boardState: Square[][]) => {
    let score = 0

    // Capture value
    if (move.capturedPiece) {
      score += PIECE_VALUES[move.capturedPiece.type] * 10
    }

    // Pawn promotion value
    if (move.piece.type === "pawn" && (move.toRow === 0 || move.toRow === 7)) {
      score += PIECE_VALUES["queen"] * 5
    }

    // Check if the move puts the opponent in check
    const tempBoard = boardState.map((row) =>
      row.map((square) => ({
        ...square,
        piece: square.piece ? { ...square.piece } : null,
      })),
    )

    tempBoard[move.toRow][move.toCol].piece = move.piece
    tempBoard[move.fromRow][move.fromCol].piece = null

    const opponentColor = move.piece.color === "white" ? "black" : "white"
    if (isKingInCheck(tempBoard, opponentColor)) {
      score += 5
    }

    // Center control for pawns and knights
    if (move.piece.type === "pawn" || move.piece.type === "knight") {
      const centerDistance = Math.abs(move.toRow - 3.5) + Math.abs(move.toCol - 3.5)
      score += (4 - centerDistance) / 2
    }

    // Avoid moving the king early in the game (except for castling)
    if (move.piece.type === "king" && !move.piece.hasMoved && Math.abs(move.fromCol - move.toCol) !== 2) {
      score -= 3
    }

    return score
  }

  // Modificar a função makeBotMove para lidar com en passant
  const makeBotMove = () => {
    if (isGameOver || currentPlayer !== "black" || viewingHistory) return

    setBotThinking(true)

    // Get all legal moves for the bot
    const legalMoves = getAllLegalMoves(board, "black")

    if (legalMoves.length === 0) {
      setBotThinking(false)
      return
    }

    // Evaluate each move
    const scoredMoves = legalMoves.map((move) => ({
      ...move,
      score: evaluateMove(move, board),
    }))

    // Sort moves by score (highest first)
    scoredMoves.sort((a, b) => b.score - a.score)

    // Add some randomness to the top moves
    const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length))
    const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)]

    // Check for pawn promotion
    if (selectedMove.piece.type === "pawn" && selectedMove.toRow === 7) {
      // Auto-promote to queen for the bot
      const newBoard = [...board.map((r) => [...r])]
      const piece = newBoard[selectedMove.fromRow][selectedMove.fromCol].piece
      const capturedPiece = newBoard[selectedMove.toRow][selectedMove.toCol].piece

      if (piece) {
        // Reset last pawn double move
        setLastPawnDoubleMove(null)

        // Handle en passant capture
        let isEnPassant = false
        if (
          Math.abs(selectedMove.fromCol - selectedMove.toCol) === 1 &&
          !newBoard[selectedMove.toRow][selectedMove.toCol].piece
        ) {
          // Remove the captured pawn
          isEnPassant = true
          newBoard[selectedMove.fromRow][selectedMove.toCol].piece = null
        }

        newBoard[selectedMove.toRow][selectedMove.toCol].piece = {
          ...piece,
          type: "queen",
          hasMoved: true,
        }
        newBoard[selectedMove.fromRow][selectedMove.fromCol].piece = null

        // Verificar se o movimento resulta em xeque ou xeque-mate
        const isCheck = isKingInCheck(newBoard, "white")
        const isCheckmate = isCheck && !hasLegalMoves(newBoard, "white")

        // Criar notação do movimento
        const notation = getMoveNotation(
          selectedMove.fromRow,
          selectedMove.fromCol,
          selectedMove.toRow,
          selectedMove.toCol,
          piece,
          capturedPiece,
          isCheck,
          isCheckmate,
          false,
          isEnPassant,
          "queen",
        )

        // Adicionar ao histórico
        const newMove: MoveHistory = {
          from: { row: selectedMove.fromRow, col: selectedMove.fromCol },
          to: { row: selectedMove.toRow, col: selectedMove.toCol },
          piece: { ...piece },
          capturedPiece: capturedPiece ? { ...capturedPiece } : null,
          notation,
          isCheck,
          isCheckmate,
          promotedTo: "queen",
          isEnPassant,
        }

        // Atualizar o histórico de movimentos
        const newHistory = [...moveHistory.slice(0, currentMoveIndex + 1), newMove]
        setMoveHistory(newHistory)
        setCurrentMoveIndex(newHistory.length - 1)

        setBoard(newBoard)
        setCurrentPlayer("white")

        // Check for checkmate
        checkForCheckmate(newBoard, "white")
      }
    } else {
      // Make the selected move
      movePiece(selectedMove.fromRow, selectedMove.fromCol, selectedMove.toRow, selectedMove.toCol)
    }

    setBotThinking(false)
  }

  // Check for checkmate
  const checkForCheckmate = (boardState: Square[][], playerColor: PieceColor) => {
    // Check if the king is in check
    if (isKingInCheck(boardState, playerColor)) {
      // Check if there are any legal moves that can get out of check
      if (!hasLegalMoves(boardState, playerColor)) {
        // Checkmate!
        setGameStatus(`Xeque-mate! ${playerColor === "white" ? "Pretas" : "Brancas"} venceram!`)
        setIsGameOver(true)
        return
      } else {
        // Just check
        setGameStatus(`${playerColor === "white" ? "Brancas" : "Pretas"} em xeque!`)
      }
    } else {
      // Check for stalemate
      if (!hasLegalMoves(boardState, playerColor)) {
        setGameStatus("Empate por afogamento!")
        setIsGameOver(true)
        return
      }

      // Normal move
      setGameStatus("")
    }
  }

  // Adicionar função para limpar todas as setas
  const clearArrows = () => {
    setArrows([])
    setDragStart(null)
    setDragEnd(null)
  }

  // Modificar a função resetGame para também limpar as setas
  const resetGame = () => {
    initializeBoard()
    clearArrows()
  }

  const toggleBot = () => {
    if (viewingHistory) {
      // Voltar para o jogo atual antes de ativar o bot
      setViewingHistory(false)
      const lastBoard = recreateBoardFromHistory(moveHistory, moveHistory.length - 1)
      setBoard(lastBoard)
      setCurrentMoveIndex(moveHistory.length - 1)
    }

    setBotEnabled(!botEnabled)

    // If enabling bot and it's already black's turn, trigger a bot move
    if (!botEnabled && currentPlayer === "black") {
      // Small delay to ensure state updates first
      setTimeout(() => makeBotMove(), 100)
    }
  }

  // Get the file letter (a-h) for a column
  const getFile = (col: number) => {
    return String.fromCharCode(97 + col)
  }

  // Get the rank number (1-8) for a row
  const getRank = (row: number) => {
    return 8 - row
  }

  // Modificar a função renderArrows para ajustar o posicionamento das setas
  const renderArrows = () => {
    const cellSize = 48
    const centerOffset = cellSize / 2

    return arrows.map((arrow, index) => {
      // Calcular posições centrais das células
      const fromX = arrow.from.col * cellSize + centerOffset
      const fromY = arrow.from.row * cellSize + centerOffset
      const toX = arrow.to.col * cellSize + centerOffset
      const toY = arrow.to.row * cellSize + centerOffset

      // Calcular o ângulo para ajustar a ponta da seta
      const angle = Math.atan2(toY - fromY, toX - fromX)

      // Ajustar o ponto final para que a seta aponte para o centro do quadrado
      // Reduzir o comprimento da seta em 10 pixels para não ultrapassar o centro
      const shortenBy = 10
      const adjustedToX = toX - Math.cos(angle) * shortenBy
      const adjustedToY = toY - Math.sin(angle) * shortenBy

      // Se for uma seta em L (movimento de torre)
      if (arrow.isLShaped) {
        // Criar um caminho em L com pontos ajustados
        const midX = fromX
        const midY = toY

        // Ajustar o ponto final do segundo segmento
        const angleSecondSegment = Math.atan2(toY - midY, toX - midX)
        const adjustedEndX = toX - Math.cos(angleSecondSegment) * shortenBy
        const adjustedEndY = toY - Math.sin(angleSecondSegment) * shortenBy

        // Desenhar duas linhas conectadas
        return (
          <g key={index}>
            <defs>
              <marker id={`arrowhead-${index}`} markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={arrow.color} />
              </marker>
            </defs>
            <polyline
              points={`${fromX},${fromY} ${midX},${midY} ${adjustedEndX},${adjustedEndY}`}
              stroke={arrow.color}
              strokeWidth="3"
              fill="none"
              markerEnd={`url(#arrowhead-${index})`}
              opacity="0.7"
            />
          </g>
        )
      } else {
        // Seta normal (linha reta) com ponto final ajustado
        return (
          <g key={index}>
            <defs>
              <marker id={`arrowhead-${index}`} markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={arrow.color} />
              </marker>
            </defs>
            <line
              x1={fromX}
              y1={fromY}
              x2={adjustedToX}
              y2={adjustedToY}
              stroke={arrow.color}
              strokeWidth="3"
              markerEnd={`url(#arrowhead-${index})`}
              opacity="0.7"
            />
          </g>
        )
      }
    })
  }

  // Função para recriar o tabuleiro a partir do histórico até um determinado índice
  const recreateBoardFromHistory = (history: MoveHistory[], index: number): Square[][] => {
    // Criar um tabuleiro inicial
    const newBoard: Square[][] = Array(8)
      .fill(null)
      .map((_, row) =>
        Array(8)
          .fill(null)
          .map((_, col) => ({
            piece: null,
            highlighted: false,
            selected: false,
            isValidMove: false,
            position: { row, col },
          })),
      )

    // Set up pawns
    for (let col = 0; col < 8; col++) {
      newBoard[1][col].piece = { type: "pawn", color: "black", hasMoved: false }
      newBoard[6][col].piece = { type: "pawn", color: "white", hasMoved: false }
    }

    // Set up rooks
    newBoard[0][0].piece = { type: "rook", color: "black", hasMoved: false }
    newBoard[0][7].piece = { type: "rook", color: "black", hasMoved: false }
    newBoard[7][0].piece = { type: "rook", color: "white", hasMoved: false }
    newBoard[7][7].piece = { type: "rook", color: "white", hasMoved: false }

    // Set up knights
    newBoard[0][1].piece = { type: "knight", color: "black" }
    newBoard[0][6].piece = { type: "knight", color: "black" }
    newBoard[7][1].piece = { type: "knight", color: "white" }
    newBoard[7][6].piece = { type: "knight", color: "white" }

    // Set up bishops
    newBoard[0][2].piece = { type: "bishop", color: "black" }
    newBoard[0][5].piece = { type: "bishop", color: "black" }
    newBoard[7][2].piece = { type: "bishop", color: "white" }
    newBoard[7][5].piece = { type: "bishop", color: "white" }

    // Set up queens
    newBoard[0][3].piece = { type: "queen", color: "black" }
    newBoard[7][3].piece = { type: "queen", color: "white" }

    // Set up kings
    newBoard[0][4].piece = { type: "king", color: "black", hasMoved: false }
    newBoard[7][4].piece = { type: "king", color: "white", hasMoved: false }

    // Aplicar todos os movimentos até o índice especificado
    for (let i = 0; i <= index; i++) {
      const move = history[i]

      // Mover a peça
      if (move.promotedTo) {
        // Promoção de peão
        newBoard[move.to.row][move.to.col].piece = {
          ...move.piece,
          type: move.promotedTo,
          hasMoved: true,
        }
      } else {
        newBoard[move.to.row][move.to.col].piece = {
          ...move.piece,
          hasMoved: true,
        }
      }

      // Remover a peça da posição original
      newBoard[move.from.row][move.from.col].piece = null

      // Lidar com capturas en passant
      if (move.isEnPassant) {
        newBoard[move.from.row][move.to.col].piece = null
      }

      // Lidar com roque
      if (move.isCastling) {
        if (move.to.col === 6) {
          // Roque curto
          newBoard[move.from.row][5].piece = newBoard[move.from.row][7].piece
          newBoard[move.from.row][7].piece = null
          if (newBoard[move.from.row][5].piece) {
            newBoard[move.from.row][5].piece.hasMoved = true
          }
        } else if (move.to.col === 2) {
          // Roque longo
          newBoard[move.from.row][3].piece = newBoard[move.from.row][0].piece
          newBoard[move.from.row][0].piece = null
          if (newBoard[move.from.row][3].piece) {
            newBoard[move.from.row][3].piece.hasMoved = true
          }
        }
      }
    }

    return newBoard
  }

  // Função para navegar pelo histórico de movimentos
  const navigateHistory = (index: number) => {
    if (index < -1 || index >= moveHistory.length) return

    if (index === -1) {
      // Voltar para o tabuleiro inicial
      initializeBoard()
      setViewingHistory(true)
      setCurrentMoveIndex(-1)
      return
    }

    // Recriar o tabuleiro até o movimento selecionado
    const historicalBoard = recreateBoardFromHistory(moveHistory, index)
    setBoard(historicalBoard)
    setCurrentMoveIndex(index)
    setViewingHistory(true)

    // Definir o jogador atual com base no último movimento
    const nextPlayer = (index + 1) % 2 === 0 ? "white" : "black"
    setCurrentPlayer(nextPlayer)
  }

  // Função para voltar ao jogo atual
  const returnToCurrentGame = () => {
    if (!viewingHistory) return

    // Se não houver movimentos, voltar para o tabuleiro inicial
    if (moveHistory.length === 0) {
      initializeBoard()
    } else {
      // Recriar o tabuleiro até o último movimento
      const currentBoard = recreateBoardFromHistory(moveHistory, moveHistory.length - 1)
      setBoard(currentBoard)
      setCurrentMoveIndex(moveHistory.length - 1)

      // Definir o jogador atual com base no último movimento
      const nextPlayer = moveHistory.length % 2 === 0 ? "white" : "black"
      setCurrentPlayer(nextPlayer)
    }

    setViewingHistory(false)
  }

  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-6">
      <div className="flex flex-col items-center">
        {/* Game controls */}
        <div className="flex items-center justify-between w-full max-w-md mb-4">
          <div className="flex items-center space-x-2">
            <Switch id="bot-mode" checked={botEnabled} onCheckedChange={toggleBot} disabled={isGameOver} />
            <Label htmlFor="bot-mode" className="text-white flex items-center">
              {botEnabled ? (
                <>
                  <Bot className="w-4 h-4 mr-1" /> Modo Single Player
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-1" /> Modo Dois Jogadores
                </>
              )}
            </Label>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={clearArrows}
              variant="outline"
              className="bg-[#5882d8] hover:bg-[#4872c8] text-white"
              title="Limpar setas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Setas
            </Button>

            <Button onClick={resetGame} variant="outline" className="bg-[#7fa650] hover:bg-[#8fb760] text-white">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Game status */}
        {gameStatus && (
          <div
            className={`mb-4 text-xl font-bold ${gameStatus.includes("Xeque-mate") ? "text-red-500" : "text-white"}`}
          >
            {gameStatus}
          </div>
        )}

        {/* Current player indicator */}
        <div className="mb-4 text-white">
          {viewingHistory ? (
            <div className="flex items-center">
              <span className="mr-2">Visualizando histórico</span>
              <Button onClick={returnToCurrentGame} variant="outline" size="sm" className="ml-2">
                Voltar ao jogo
              </Button>
            </div>
          ) : botThinking ? (
            <div className="flex items-center">
              <span className="mr-2">Bot pensando...</span>
              <div className="w-4 h-4 rounded-full bg-[#7fa650] animate-pulse"></div>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">Vez das</span>
              <div className={`w-4 h-4 rounded-full ${currentPlayer === "white" ? "bg-white" : "bg-black"} mr-2`}></div>
              <span>{currentPlayer === "white" ? "Brancas" : "Pretas"}</span>
            </div>
          )}
        </div>

        {/* Chess board with file and rank labels */}
        <div className="relative">
          {/* File labels (a-h) - top */}
          <div className="absolute top-0 left-0 right-0 flex">
            {Array(8)
              .fill(0)
              .map((_, col) => (
                <div
                  key={`top-${col}`}
                  className="w-12 h-6 sm:w-16 sm:h-6 flex items-center justify-center text-xs text-gray-400"
                >
                  {getFile(col)}
                </div>
              ))}
          </div>

          {/* Rank labels (1-8) - left */}
          <div className="absolute top-6 bottom-0 left-0 flex flex-col">
            {Array(8)
              .fill(0)
              .map((_, row) => (
                <div
                  key={`left-${row}`}
                  className="w-6 h-12 sm:w-6 sm:h-16 flex items-center justify-center text-xs text-gray-400"
                >
                  {getRank(row)}
                </div>
              ))}
          </div>

          <div className="relative ml-6 mt-6" onMouseLeave={handleMouseLeave}>
            <div className="grid grid-cols-8 border-2 border-[#333333] shadow-lg">
              {board.map((row, rowIndex) =>
                row.map((square, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
                      ${(rowIndex + colIndex) % 2 === 0 ? "bg-[#f0d9b5]" : "bg-[#b58863]"} 
                      ${square.selected ? "ring-4 ring-[#5882d8] ring-inset" : ""}
                      ${square.highlighted && !square.piece ? "bg-[#5882d8] bg-opacity-50" : ""}
                      ${square.highlighted && square.piece ? "bg-[#d85858] bg-opacity-50" : ""}
                      relative
                      ${
                        (botEnabled && currentPlayer === "black" && !isGameOver) || viewingHistory
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      ${
                        isDragging && dragStart && dragStart.row === rowIndex && dragStart.col === colIndex
                          ? "ring-2 ring-yellow-500 ring-inset"
                          : ""
                      }
                    `}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
                    onMouseMove={(e) => handleMouseMove(e, rowIndex, colIndex)}
                    onMouseUp={(e) => handleMouseUp(e, rowIndex, colIndex)}
                  >
                    {square.piece && <ChessPiece type={square.piece.type} color={square.piece.color} />}
                  </div>
                )),
              )}
            </div>

            {/* SVG overlay for arrows */}
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${8 * 48} ${8 * 48}`}
              style={{ width: "100%", height: "100%" }}
            >
              {renderArrows()}
            </svg>
          </div>

          {/* File labels (a-h) - bottom */}
          <div className="absolute bottom-0 left-6 right-0 flex">
            {Array(8)
              .fill(0)
              .map((_, col) => (
                <div
                  key={`bottom-${col}`}
                  className="w-12 h-6 sm:w-16 sm:h-6 flex items-center justify-center text-xs text-gray-400"
                >
                  {getFile(col)}
                </div>
              ))}
          </div>

          {/* Rank labels (1-8) - right */}
          <div className="absolute top-6 bottom-6 right-0 flex flex-col">
            {Array(8)
              .fill(0)
              .map((_, row) => (
                <div
                  key={`right-${row}`}
                  className="w-6 h-12 sm:w-6 sm:h-16 flex items-center justify-center text-xs text-gray-400"
                >
                  {getRank(row)}
                </div>
              ))}
          </div>
        </div>

        {/* Promotion dialog */}
        <PromotionDialog
          isOpen={showPromotion}
          onClose={() => setShowPromotion(false)}
          onSelect={handlePromotion}
          color={currentPlayer}
        />
      </div>

      {/* Histórico de movimentos */}
      <div className="bg-[#2f2f2f] p-4 rounded-lg shadow-lg mt-4 md:mt-0 w-full md:w-64">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-bold">Histórico de Movimentos</h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => navigateHistory(currentMoveIndex - 1)}
              disabled={currentMoveIndex <= -1}
              size="sm"
              variant="outline"
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigateHistory(currentMoveIndex + 1)}
              disabled={currentMoveIndex >= moveHistory.length - 1}
              size="sm"
              variant="outline"
              className="p-1"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {moveHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum movimento realizado</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2 w-10 text-left">#</th>
                  <th className="py-2 text-left">Brancas</th>
                  <th className="py-2 text-left">Pretas</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-700 ${
                      currentMoveIndex === index * 2 || currentMoveIndex === index * 2 + 1
                        ? "bg-[#444444]"
                        : "hover:bg-[#3a3a3a]"
                    }`}
                  >
                    <td className="py-2 text-gray-400">{index + 1}.</td>
                    <td
                      className={`py-2 cursor-pointer ${
                        currentMoveIndex === index * 2 ? "text-white font-bold" : "text-gray-300"
                      }`}
                      onClick={() => navigateHistory(index * 2)}
                    >
                      {moveHistory[index * 2]?.notation}
                    </td>
                    <td
                      className={`py-2 cursor-pointer ${
                        currentMoveIndex === index * 2 + 1 ? "text-white font-bold" : "text-gray-300"
                      }`}
                      onClick={() => navigateHistory(index * 2 + 1)}
                    >
                      {moveHistory[index * 2 + 1]?.notation || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {viewingHistory && (
          <Button onClick={returnToCurrentGame} className="w-full mt-4 bg-[#7fa650] hover:bg-[#8fb760] text-white">
            Voltar ao jogo atual
          </Button>
        )}
      </div>
    </div>
  )
}

