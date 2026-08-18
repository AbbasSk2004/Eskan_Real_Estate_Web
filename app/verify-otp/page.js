import VerifyOTP from '../../src/components/auth/verfi_otp';

export const metadata = {
  title: 'Verify OTP',
  description: 'Enter the one-time password sent to your email to verify your ESKAN Real Estate account.'
};

export default function VerifyOtpPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
            <VerifyOTP />
          </div>
        </div>
      </div>
    </div>
  );
}