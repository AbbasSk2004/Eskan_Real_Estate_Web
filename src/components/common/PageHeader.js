import React from 'react';
import Link from 'next/link';
import '../../assets/css/PageHeader.css';

const PageHeader = ({ title, crumb }) => {
  return (
    <div className="container-fluid page-header py-5" style={{ backgroundImage: `url('/img/header.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container-fluid page-header-inner py-5">
        <div className="container">
          <div className="breadcrumb-text">
            <h1 className="display-4 text-white mb-3 animated fadeInDown">{title}</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/" className="text-white">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">{crumb || title}</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;