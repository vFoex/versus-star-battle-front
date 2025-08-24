import { Expose, Type } from "class-transformer";
import { Grid } from "./grid.class";

export class GameSession {
    @Expose({ name: 'game_id' })
    id: string;

    @Type(() => Grid)
    grid: Grid;
}