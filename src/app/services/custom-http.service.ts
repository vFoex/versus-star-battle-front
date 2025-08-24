import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { map, Observable, Subject } from "rxjs";

export abstract class CustomHttpService {
    private http = inject(HttpClient);

    apiUrl: string = 'http://localhost:8000/';

    abstract route: string;

    protected socket?: WebSocket;
    protected messages$ = new Subject<any>();

    get(url: string, type: any, options?: any): Observable<any> {
        return this.http.get(`${this.apiUrl}${url}`).pipe(
            map(response => {
                if (type) {
                    return plainToInstance(type, response);
                }
                return response;
            })
        );
    }

    post(url: string, body: any, type?: any, options?: any): Observable<any> {
        return this.http.post(`${this.apiUrl}${url}`, body).pipe(
            map(response => {
                if (type) {
                    return plainToInstance(type, response);
                }
                return response;
            })
        );
    }

    put(url: string, body: any, type?: any, options?: any): Observable<any> {
        return this.http.put(`${this.apiUrl}${url}`, body).pipe(
            map(response => {
                if (type) {
                    return plainToInstance(type, response);
                }
                return response;
            })
        );
    }

    delete(url: string, options?: any): Observable<any> {
        return this.http.delete(`${this.apiUrl}${url}`).pipe(
            map(response => response)
        );
    }

    sendWebSocketMessage(message: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }
}