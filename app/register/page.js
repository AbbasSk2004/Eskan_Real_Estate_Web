import RegisterForm from '../../src/components/auth/RegisterForm';

export const metadata = {
  title: 'Register',
  description: 'Create your ESKAN Real Estate account to list properties, save favorites, and manage inquiries.'
};

export default function RegisterPage() {
  return (
    <section className="auth-section pt-5 pb-5 mt-5 bg-light min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-4 p-md-5">
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}