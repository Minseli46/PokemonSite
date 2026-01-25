import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock des hooks
jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    mode: 'light',
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
  }),
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('displays the Pokédex title', () => {
    render(<App />);
    const title = screen.getByText(/Pokédex/i);
    expect(title).toBeInTheDocument();
  });
});
