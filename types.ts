
export enum GameState {
  Start,
  Playing,
  Win,
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface CatchEffect {
  id: number;
  position: Position;
}
