import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCategoriasPage from './AdminCategoriasPage';

const mockExportarCategoriasAPDF = jest.fn();
const mockExportarCategoriasAExcel = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({})
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const mockApiGet = jest.fn();

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: (...args) => mockApiGet(...args),
  },
}));

jest.mock('../../utils/exportUtils', () => ({
  exportarCategoriasAPDF: (...args) => mockExportarCategoriasAPDF(...args),
  exportarCategoriasAExcel: (...args) => mockExportarCategoriasAExcel(...args),
}));

describe('AdminCategoriasPage export buttons', () => {
  beforeEach(() => {
    mockApiGet.mockResolvedValue({
      data: {
        data: {
          categorias: [
            { id: 1, nombre: 'Bebidas', descripcion: 'Refrescos', activo: true },
            { id: 2, nombre: 'Limpieza', descripcion: 'Productos de limpieza', activo: false }
          ]
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows selecting the export format by stable selectors', async () => {
    render(<AdminCategoriasPage />);

    await waitFor(() => {
      expect(screen.getByText(/Gestión de Categorías/i)).toBeInTheDocument();
    });

    const toggle = screen.getByTestId('exportar-dropdown-toggle');
    await userEvent.click(toggle);

    const pdfOption = screen.getByTestId('exportar-pdf-option');
    const excelOption = screen.getByTestId('exportar-excel-option');

    expect(pdfOption).toBeInTheDocument();
    expect(excelOption).toBeInTheDocument();

    await userEvent.click(pdfOption);
    expect(mockExportarCategoriasAPDF).toHaveBeenCalledTimes(1);
  });
});
