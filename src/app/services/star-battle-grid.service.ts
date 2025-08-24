import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CustomHttpService } from "./custom-http.service";
import { Grid } from "../models/grid.class";
import { GameSession } from "../models/game-session.class";

@Injectable({
    providedIn: 'root'
})
export class StarBattleGridService extends CustomHttpService {

    route: string = '';

    public getGame(): Observable<GameSession> {
        return this.get(`${this.route}create-game`, GameSession);
    }

    public connectToGame(gameId: string): Observable<any> {
        this.socket = new WebSocket(`ws://localhost:8000/ws/${gameId}`);
        this.socket.onmessage = (event) => {
        this.messages$.next(JSON.parse(event.data));
        };

        this.socket.onerror = (event) => {
        console.error('WebSocket error', event);
        };

        this.socket.onclose = () => {
        console.log('WebSocket closed');
        };

        return this.messages$.asObservable();
    }
}