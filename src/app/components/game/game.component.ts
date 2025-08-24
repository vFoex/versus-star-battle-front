import { Component, inject, OnInit } from "@angular/core";
import { StarBattleGridService } from "../../services/star-battle-grid.service";
import { Grid, GridCell, GridCellContent } from "../../models/grid.class";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { GameSession } from "../../models/game-session.class";

@Component({
    selector: 'game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    imports: [
        CommonModule,
        MatIconModule
    ],
})
export class GameComponent implements OnInit {
    private starBattleGridService = inject(StarBattleGridService);

    grid: Grid;

    gameSessionId: string;

    ngOnInit(): void {
        
    }

    cellClicked(cell: GridCell): void {

        if (cell.content === GridCellContent.EMPTY) {
            cell.content = GridCellContent.CROSS;
        } else if (cell.content === GridCellContent.CROSS) {
            cell.content = GridCellContent.STAR;
            this.addAutomaticCrosses(cell);
        } else if (cell.content === GridCellContent.STAR) {
            cell.content = GridCellContent.EMPTY;
            this.removeAutomaticCrosses(cell);
        }

        this.grid.cells[cell.y][cell.x] = cell;
        this.clearAutomaticCrosses(cell.x, cell.y);

        this.starBattleGridService.sendWebSocketMessage({
            action: 'update_grid',
            game_id: this.gameSessionId,
            grid: this.grid,
        });
    }

    startNewGame(): void {
        if(!this.gameSessionId) return;
        this.starBattleGridService.sendWebSocketMessage({
            action: 'end_game',
            game_id: this.gameSessionId
        });

        this.startGame();
    }

    private startGame(): void{
        this.starBattleGridService.getGame().subscribe({
            next: (gameSession: GameSession) => {
                this.gameSessionId = gameSession.id;
                this.grid = gameSession.grid;
                this.starBattleGridService.connectToGame(this.gameSessionId).subscribe({
                    next: (message) => {
                        console.log('WebSocket message received:', message);
                        // Handle incoming WebSocket messages here
                        // For example, update the grid based on the message
                    },
                    error: (error) => {
                        console.error('WebSocket error:', error);
                    }
                });
            },
            error: (error) => {
                console.error('Error fetching grid:', error);
            }
        });
    }

    private addAutomaticCrosses(cell: GridCell): void {

        const adjacentDiagonalPositions = [
            { x: cell.x - 1, y: cell.y - 1 },
            { x: cell.x + 1, y: cell.y + 1 },
            { x: cell.x - 1, y: cell.y + 1 },
            { x: cell.x + 1, y: cell.y - 1 }
        ];

        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                const currentCell = this.grid.cells[y][x];
                if (currentCell.content !== GridCellContent.EMPTY) {
                    console.log(`Skipping cell at (${x}, ${y}) because it is not empty.`);
                    continue; // Skip if the cell is not empty
                }

                if (currentCell.regionColor == cell.regionColor || x == cell.x || y == cell.y || adjacentDiagonalPositions.some(pos => pos.x === x && pos.y === y)) {
                    this.grid.cells[y][x].content = GridCellContent.CROSS;
                    this.grid.cells[y][x].automaticallySetBy = [cell.x, cell.y];
                    this.grid.cells[y][x].automaticallySet = true;
                }
            }
        }
    }

    private removeAutomaticCrosses(cell: GridCell): void {
        
        const adjacentDiagonalPositions = [
            { x: cell.x - 1, y: cell.y - 1 },
            { x: cell.x + 1, y: cell.y + 1 },
            { x: cell.x - 1, y: cell.y + 1 },
            { x: cell.x + 1, y: cell.y - 1 }
        ];

        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                const currentCell = this.grid.cells[y][x];
                if (currentCell.automaticallySet && currentCell.automaticallySetBy && 
                    currentCell.automaticallySetBy[0] == cell.x && 
                    currentCell.automaticallySetBy[1] == cell.y &&
                     currentCell.content === GridCellContent.CROSS) {
                    if (currentCell.regionColor == cell.regionColor ||
                        x == cell.x || 
                        y == cell.y || 
                        adjacentDiagonalPositions.some(pos => pos.x === x && pos.y === y)) {
                        this.grid.cells[y][x].content = GridCellContent.EMPTY;
                        this.clearAutomaticCrosses(x, y);
                    }
                }
            }
        }
    }

    private clearAutomaticCrosses(x: number, y: number): void {
        this.grid.cells[y][x].automaticallySet = false;
        this.grid.cells[y][x].automaticallySetBy = undefined;

    }
}