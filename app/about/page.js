import Link from 'next/link';

export const metadata = {
  title: 'About Us',
  description: 'ESKAN Real Estate is a Lebanese property platform connecting buyers, renters, and property owners with verified listings across Lebanon.'
};

export default function AboutPage() {
  return (
    <>
      <div className="container-xxl pt-5 mt-5">
      <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                className="img-fluid rounded shadow-sm w-100"
                src="/img/about.jpg"
                alt="About ESKAN Real Estate"
              />
            </div>
            <div className="col-lg-6">
              <h1 className="text-primary mb-4">Who We Are</h1>
              <p className="text-muted mb-4">
                ESKAN Real Estate is a modern Lebanese property platform built to make buying, renting, and
                listing property simple, transparent, and secure. From apartments and villas to offices,
                shops, and land — we help you find the right property across every region of Lebanon.
              </p>
              <p className="text-muted mb-4">
                Every listing on the platform is verified before it goes live, so you can browse with
                confidence. Property owners can list their properties in minutes, respond to inquiries
                directly, and manage everything from a single dashboard.
              </p>
              <div className="row g-4 pt-2">
                <div className="col-6 col-md-4">
                  <div className="bg-light rounded p-4 text-center h-100">
                    <h2 className="text-primary mb-0">100%</h2>
                    <small className="text-muted">Verified Listings</small>
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="bg-light rounded p-4 text-center h-100">
                    <h2 className="text-primary mb-0">8+</h2>
                    <small className="text-muted">Regions Covered</small>
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="bg-light rounded p-4 text-center h-100">
                    <h2 className="text-primary mb-0">24/7</h2>
                    <small className="text-muted">Owner Support</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-xxl pb-5">
        <div className="container">
          <div className="bg-light rounded p-4 p-md-5">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3">
                  <i className="fa fa-shield-alt fa-2x text-primary mt-1"></i>
                  <div>
                    <h5 className="mb-2">Trust &amp; Verification</h5>
                    <p className="text-muted mb-0">Every property is reviewed before listing to keep the platform honest.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3">
                  <i className="fa fa-location-dot fa-2x text-primary mt-1"></i>
                  <div>
                    <h5 className="mb-2">National Coverage</h5>
                    <p className="text-muted mb-0">Properties listed across all Lebanese governorates, cities, and villages.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3">
                  <i className="fa fa-comments fa-2x text-primary mt-1"></i>
                  <div>
                    <h5 className="mb-2">Direct Contact</h5>
                    <p className="text-muted mb-0">Talk to property owners directly through inquiries and built-in chat.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-5">
            <h2 className="text-primary mb-3">Ready to Find Your Property?</h2>
            <Link href="/properties" className="btn btn-primary py-3 px-5">
              Browse Properties<i className="fa fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}