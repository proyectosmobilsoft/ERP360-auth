import { SimpleLogin } from '@/components/auth/SimpleLogin';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';

export function SimpleAuthPage() {
  const { tenant } = useTenant('erp360');
  const { user, isAuthenticated } = useAuth();

  const handleLoginSuccess = () => {
    console.log('Login exitoso - redirigir a aplicación');
    // Aquí puedes agregar lógica de redirección
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Bienvenido!</h2>
            <p className="text-gray-600 mb-4">Has iniciado sesión correctamente.</p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Usuario:</strong> {user.email}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Tenant:</strong> {tenant?.name}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ERP360</h1>
          <p className="text-gray-600">Plataforma Empresarial</p>
        </div>

        {/* Simple Login Component */}
        <SimpleLogin 
          tenantId="erp360" 
          onSuccess={handleLoginSuccess}
        />

        {/* Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Este es el componente de login simple para aplicaciones internas
          </p>
        </div>
      </div>
    </div>
  );
}