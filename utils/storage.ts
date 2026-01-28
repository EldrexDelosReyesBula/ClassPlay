import { get, set, del } from 'idb-keyval';

export const saveGameState = async (gameKey: string, state: any) => {
  try {
    await set(gameKey, state);
  } catch (error) {
    console.error('Failed to save game state to IDB', error);
  }
};

export const loadGameState = async <T>(gameKey: string): Promise<T | undefined> => {
  try {
    return await get<T>(gameKey);
  } catch (error) {
    console.error('Failed to load game state from IDB', error);
    return undefined;
  }
};

export const clearGameState = async (gameKey: string) => {
  try {
    await del(gameKey);
  } catch (error) {
    console.error('Failed to clear game state from IDB', error);
  }
};