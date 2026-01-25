import axios from 'axios';
import type { Pokemon, Team, Quiz, PokemonListResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pokémon API
export const pokemonAPI = {
  getList: async (limit = 20, offset = 0): Promise<PokemonListResponse> => {
    const response = await api.get('/pokemons', { params: { limit, offset } });
    return response.data;
  },

  getById: async (id: number): Promise<Pokemon> => {
    const response = await api.get(`/pokemons/${id}`);
    return response.data;
  },

  search: async (name: string): Promise<{ results: Pokemon[] }> => {
    const response = await api.get('/pokemons/search', { params: { name } });
    return response.data;
  },

  filterByGeneration: async (generation: number): Promise<{ results: Pokemon[] }> => {
    const response = await api.get('/pokemons/filter', { params: { generation } });
    return response.data;
  },

  compare: async (id1: number, id2: number) => {
    const response = await api.get('/pokemons/compare', { params: { id1, id2 } });
    return response.data;
  },
};

// Team API
export const teamAPI = {
  create: async (userId: string, name: string, pokemons: number[]): Promise<Team> => {
    const response = await api.post('/teams', { userId, name, pokemons });
    return response.data;
  },

  getUserTeams: async (userId: string): Promise<{ teams: Team[] }> => {
    const response = await api.get(`/teams/user/${userId}`);
    return response.data;
  },

  getById: async (teamId: string): Promise<Team> => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  update: async (teamId: string, data: Partial<Team>): Promise<Team> => {
    const response = await api.put(`/teams/${teamId}`, data);
    return response.data;
  },

  delete: async (teamId: string): Promise<void> => {
    await api.delete(`/teams/${teamId}`);
  },

  addPokemon: async (teamId: string, pokemonId: number): Promise<Team> => {
    const response = await api.post(`/teams/${teamId}/pokemon`, { pokemonId });
    return response.data;
  },

  removePokemon: async (teamId: string, pokemonId: number): Promise<Team> => {
    const response = await api.delete(`/teams/${teamId}/pokemon/${pokemonId}`);
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  generate: async (difficulty = 'medium', count = 10) => {
    const response = await api.get('/quiz/generate', { params: { difficulty, count } });
    return response.data;
  },

  getSaved: async (difficulty?: string, limit = 10): Promise<{ quizzes: Quiz[] }> => {
    const response = await api.get('/quiz', { params: { difficulty, limit } });
    return response.data;
  },

  save: async (quizData: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> => {
    const response = await api.post('/quiz', quizData);
    return response.data;
  },

  checkAnswer: async (pokemonId: number, answer: string, questionType: string) => {
    const response = await api.post('/quiz/check', { pokemonId, answer, questionType });
    return response.data;
  },
};

export default api;
