import ForgotPassword from '../../src/components/auth/ForgotPassword';

export const metadata = {
  title: 'Forgot Password',
  description: 'Reset your ESKAN Real Estate account password with a secure email link.'
};

export default function ForgotPasswordPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
            <ForgotPassword />
          </div>
        </div>
      </div>
    </div>
  );
}
