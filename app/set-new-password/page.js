import SetNewPasswordForm from '../../src/components/auth/SetNewPasswordForm';

export const metadata = {
  title: 'Set New Password',
  description: 'Choose a new password for your ESKAN Real Estate account.'
};

export default function SetNewPasswordPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
            <SetNewPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}