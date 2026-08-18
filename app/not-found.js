import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-xxl py-5 text-center">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h1 className="display-1 text-primary">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="text-muted mb-4">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" className="btn btn-primary py-3 px-5">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}