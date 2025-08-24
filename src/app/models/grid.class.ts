import { Expose, Type } from 'class-transformer';

export enum GridCellContent {
    STAR = "star",
    CROSS = "cross",
    EMPTY = "empty"
}

export class GridCell {

    @Expose({ name: 'region_color' })
    regionColor: string;

    content: GridCellContent;

    x: number;
    y: number;

    automaticallySet?: boolean;
    automaticallySetBy?: [number, number];
}

export type GridCells = GridCell[][];

export class Grid{

    width: number;
    height: number;

    @Type(() => GridCell)
    cells: GridCells;
}