import LoginForm from '../../src/components/auth/LoginForm';

export const metadata = {
  title: 'Login',
  description: 'Sign in to your ESKAN Real Estate account to manage your listings, favorites, and inquiries.'
};

export default function LoginPage() {
  return (
    <section className="auth-section pt-5 pb-5 mt-5 bg-light min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-4 p-md-5">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}