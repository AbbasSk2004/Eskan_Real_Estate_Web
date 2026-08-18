import ResetCodeForm from '../../src/components/auth/ResetCodeForm';

export const metadata = {
  title: 'Reset Password',
  description: 'Enter the verification code sent to your email to reset your ESKAN Real Estate account password.'
};

export default function ResetPasswordPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
            <ResetCodeForm />
          </div>
        </div>
      </div>
    </div>
  );
}