import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  listen(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, data => {
        observer.next(data);
      });
    });
  }
}
